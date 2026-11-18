import legacyImagesJson from '../../src/data/images.json';

interface Env {
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
}

interface CfEventContext {
  request: Request;
  env: Env;
  params: { route?: string | string[] };
}

interface StoredImageRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  sourceType: 'AI Generated' | 'Licensed Stock';
  creator: string;
  storageProvider: 'cloudinary' | 'legacy-r2' | 'local';
  publicId?: string;
  url?: string;
  r2Key?: string;
  aspectRatio: string;
  width: number;
  height: number;
  sizeBytes?: number;
  fileSize: string;
  format: string;
  publishedAt: string;
  downloads: number;
  featured: boolean;
  popular: boolean;
  latest: boolean;
  tags: string[];
  palette: string[];
}

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  created_at?: string;
  tags?: string[];
  context?: {
    custom?: Record<string, string>;
  };
}

const SESSION_COOKIE_NAME = 'qyopic_admin';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const VALID_CATEGORIES = new Set([
  'Nature',
  'Technology',
  'Animals',
  'Architecture',
  'Wallpapers',
  'Abstract',
  'Cars',
  'Digital Art',
]);

function jsonResponse(data: unknown, status = 200, headers?: HeadersInit): Response {
  const resHeaders = new Headers(headers);
  resHeaders.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { status, headers: resHeaders });
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    if (key) result[key] = val;
  }
  return result;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function encodeBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(padLen));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

function getSessionSecret(env: Env): string {
  return (
    env.ADMIN_SESSION_SECRET ||
    env.ADMIN_PASSWORD ||
    env.CLOUDINARY_API_SECRET ||
    'qyopic-fallback-secret'
  );
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message)
  );
  return toHex(signature);
}

async function sha1Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(input)
  );
  return toHex(digest);
}

async function createSessionToken(env: Env): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = toHex(nonceBytes.buffer);
  const payload = `${expiresAt}.${nonce}`;
  const sig = await hmacSha256Hex(getSessionSecret(env), payload);
  return `${payload}.${sig}`;
}

async function verifySessionToken(
  env: Env,
  token: string | undefined
): Promise<boolean> {
  if (!token || !env.ADMIN_PASSWORD) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [expiresAtStr, nonce, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expectedSig = await hmacSha256Hex(
    getSessionSecret(env),
    `${expiresAtStr}.${nonce}`
  );
  return timingSafeEqualStr(sig, expectedSig);
}

async function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string
): Promise<string> {
  const sorted = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return sha1Hex(`${sorted}${apiSecret}`);
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `image-${Date.now()}`
  );
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function inferAspectRatio(width: number, height: number): string {
  if (!width || !height) return '4:3';
  const ratio = width / height;
  const candidates: Array<{ label: string; value: number }> = [
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '1:1', value: 1 },
    { label: '3:4', value: 3 / 4 },
    { label: '9:16', value: 9 / 16 },
  ];
  let best = candidates[0];
  let minDiff = Math.abs(ratio - best.value);
  for (const candidate of candidates) {
    const diff = Math.abs(ratio - candidate.value);
    if (diff < minDiff) {
      minDiff = diff;
      best = candidate;
    }
  }
  return best.label;
}

function cleanContextValue(value: string): string {
  return value.replace(/[|=]/g, ' ').trim();
}

function mapCloudinaryResourceToItem(res: CloudinaryResource): StoredImageRecord {
  const custom = res.context?.custom ?? {};
  const publicId = res.public_id;
  const baseName = publicId.split('/').pop() || publicId;
  const title = custom.title || baseName.replace(/[-_]+/g, ' ');
  const category =
    custom.category && VALID_CATEGORIES.has(custom.category)
      ? custom.category
      : 'Nature';
  const width = Number(res.width) || 1920;
  const height = Number(res.height) || 1080;
  const sizeBytes = Number(res.bytes) || 0;
  const format = (res.format || 'jpg').toUpperCase();
  const slug = custom.slug || slugify(title);

  return {
    id: `cl_${encodeBase64Url(publicId)}`,
    slug,
    title,
    description:
      custom.description ||
      `Curated ${category.toLowerCase()} visual hosted on Cloudinary CDN.`,
    category,
    sourceType:
      custom.source_type === 'AI Generated'
        ? 'AI Generated'
        : 'Licensed Stock',
    creator: custom.creator || 'Qyopic Studio',
    storageProvider: 'cloudinary',
    publicId,
    url: res.secure_url,
    aspectRatio: inferAspectRatio(width, height),
    width,
    height,
    sizeBytes,
    fileSize: formatBytes(sizeBytes),
    format,
    publishedAt: (res.created_at || new Date().toISOString()).slice(0, 10),
    downloads: 0,
    featured: true,
    popular: false,
    latest: true,
    tags:
      Array.isArray(res.tags) && res.tags.length > 0
        ? res.tags
        : [category.toLowerCase()],
    palette: ['#0A0A0A', '#52525B', '#D4D4D8', '#FAFAFA'],
  };
}

async function fetchCloudinaryCatalog(env: Env): Promise<StoredImageRecord[]> {
  const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    return [];
  }

  try {
    const auth = btoa(`${apiKey}:${apiSecret}`);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?type=upload&prefix=qyopic/&context=true&tags=true&max_results=100`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) return [];
    const data = (await response.json()) as {
      resources?: CloudinaryResource[];
    };
    if (!Array.isArray(data.resources)) return [];
    return data.resources.map(mapCloudinaryResourceToItem);
  } catch {
    return [];
  }
}

export async function onRequest(context: CfEventContext): Promise<Response> {
  const { request, env, params } = context;
  const routeParts = Array.isArray(params.route)
    ? params.route
    : typeof params.route === 'string'
      ? params.route.split('/').filter(Boolean)
      : [];

  const path = `/${routeParts.join('/')}`;
  const method = request.method.toUpperCase();
  const isHttps = new URL(request.url).protocol === 'https:';

  // GET /api/admin/session
  if (method === 'GET' && path === '/admin/session') {
    const cookies = parseCookies(request.headers.get('Cookie'));
    const authenticated = await verifySessionToken(
      env,
      cookies[SESSION_COOKIE_NAME]
    );
    const adminConfigured = Boolean(env.ADMIN_PASSWORD);
    const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
    const hasSigned = Boolean(env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
    const hasPreset = Boolean(env.CLOUDINARY_UPLOAD_PRESET);
    const cloudinaryConfigured = Boolean(cloudName && (hasSigned || hasPreset));

    return jsonResponse({
      authenticated,
      adminConfigured,
      cloudinaryConfigured,
      activeProvider: 'cloudinary',
    });
  }

  // POST /api/admin/login
  if (method === 'POST' && path === '/admin/login') {
    if (!env.ADMIN_PASSWORD) {
      return jsonResponse(
        {
          error:
            'ADMIN_PASSWORD is not configured in Cloudflare Pages Environment Variables.',
        },
        503
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      password?: string;
    };
    const submitted = typeof body.password === 'string' ? body.password : '';
    if (!timingSafeEqualStr(submitted, env.ADMIN_PASSWORD)) {
      return jsonResponse({ error: 'Invalid admin password.' }, 401);
    }

    const token = await createSessionToken(env);
    const secureFlag = isHttps ? '; Secure' : '';
    return jsonResponse(
      { authenticated: true },
      200,
      {
        'Set-Cookie': `${SESSION_COOKIE_NAME}=${encodeURIComponent(
          token
        )}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(
          SESSION_TTL_MS / 1000
        )}${secureFlag}`,
      }
    );
  }

  // POST /api/admin/logout
  if (method === 'POST' && path === '/admin/logout') {
    const secureFlag = isHttps ? '; Secure' : '';
    return jsonResponse(
      { authenticated: false },
      200,
      {
        'Set-Cookie': `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureFlag}`,
      }
    );
  }

  // GET /api/media
  if (method === 'GET' && path === '/media') {
    const cloudinaryItems = await fetchCloudinaryCatalog(env);
    const legacyItems = (legacyImagesJson as StoredImageRecord[]).map((item) => ({
      ...item,
      storageProvider: item.storageProvider ?? ('legacy-r2' as const),
    }));

    return jsonResponse({
      images: [...cloudinaryItems, ...legacyItems],
    });
  }

  // POST /api/media/upload (Admin only)
  if (method === 'POST' && path === '/media/upload') {
    const cookies = parseCookies(request.headers.get('Cookie'));
    const authenticated = await verifySessionToken(
      env,
      cookies[SESSION_COOKIE_NAME]
    );
    if (!authenticated) {
      return jsonResponse(
        { error: 'Admin authentication required to upload images.' },
        401
      );
    }

    const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
    const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET?.trim();
    const apiKey = env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || (!(apiKey && apiSecret) && !uploadPreset)) {
      return jsonResponse(
        {
          error:
            'Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (and optionally CLOUDINARY_UPLOAD_PRESET) in Cloudflare Pages.',
        },
        503
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      fileDataUrl?: string;
      title?: string;
      category?: string;
      description?: string;
      sourceType?: string;
      creator?: string;
      tags?: string | string[];
    };

    if (
      typeof body.fileDataUrl !== 'string' ||
      !/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(body.fileDataUrl)
    ) {
      return jsonResponse(
        { error: 'A valid base64 image file is required.' },
        400
      );
    }

    const cleanTitle = typeof body.title === 'string' ? body.title.trim() : '';
    if (!cleanTitle) {
      return jsonResponse({ error: 'Image title is required.' }, 400);
    }

    const cleanCategory =
      typeof body.category === 'string' && VALID_CATEGORIES.has(body.category)
        ? body.category
        : 'Nature';
    const cleanSourceType: 'AI Generated' | 'Licensed Stock' =
      body.sourceType === 'AI Generated' ? 'AI Generated' : 'Licensed Stock';
    const cleanCreator =
      typeof body.creator === 'string' && body.creator.trim()
        ? body.creator.trim()
        : 'Qyopic Admin';
    const cleanDesc =
      typeof body.description === 'string' && body.description.trim()
        ? body.description.trim()
        : `Curated ${cleanCategory.toLowerCase()} visual hosted on Cloudinary CDN.`;

    const cleanTags = Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 10)
      : typeof body.tags === 'string'
        ? body.tags
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 10)
        : [cleanCategory.toLowerCase()];

    const finalTags =
      cleanTags.length > 0 ? cleanTags : [cleanCategory.toLowerCase()];
    const slug = `${slugify(cleanTitle)}-${Date.now().toString(36).slice(-4)}`;
    const folder = `qyopic/${slugify(cleanCategory)}`;
    const contextStr = [
      `title=${cleanContextValue(cleanTitle)}`,
      `category=${cleanContextValue(cleanCategory)}`,
      `source_type=${cleanContextValue(cleanSourceType)}`,
      `creator=${cleanContextValue(cleanCreator)}`,
      `description=${cleanContextValue(cleanDesc)}`,
      `slug=${cleanContextValue(slug)}`,
    ].join('|');
    const tagsStr = finalTags.join(',');

    const formData = new FormData();
    formData.append('file', body.fileDataUrl);
    formData.append('folder', folder);
    formData.append('context', contextStr);
    formData.append('tags', tagsStr);
    if (uploadPreset) {
      formData.append('upload_preset', uploadPreset);
    }

    if (apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign: Record<string, string | number> = {
        context: contextStr,
        folder,
        tags: tagsStr,
        timestamp,
      };
      if (uploadPreset) {
        paramsToSign.upload_preset = uploadPreset;
      }
      const signature = await signCloudinaryParams(paramsToSign, apiSecret);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
    }

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const uploadResult = (await uploadRes.json()) as {
      public_id?: string;
      secure_url?: string;
      format?: string;
      bytes?: number;
      width?: number;
      height?: number;
      created_at?: string;
      error?: { message?: string };
    };

    if (
      !uploadRes.ok ||
      !uploadResult.public_id ||
      !uploadResult.secure_url
    ) {
      return jsonResponse(
        {
          error:
            uploadResult.error?.message ||
            'Cloudinary upload failed. Check credentials and upload preset.',
        },
        502
      );
    }

    const item = mapCloudinaryResourceToItem({
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      created_at: uploadResult.created_at,
      tags: finalTags,
      context: {
        custom: {
          title: cleanTitle,
          category: cleanCategory,
          source_type: cleanSourceType,
          creator: cleanCreator,
          description: cleanDesc,
          slug,
        },
      },
    });

    return jsonResponse({ image: item }, 201);
  }

  // DELETE /api/media/:id (Admin only)
  if (method === 'DELETE' && path.startsWith('/media/')) {
    const cookies = parseCookies(request.headers.get('Cookie'));
    const authenticated = await verifySessionToken(
      env,
      cookies[SESSION_COOKIE_NAME]
    );
    if (!authenticated) {
      return jsonResponse(
        { error: 'Admin authentication required to delete images.' },
        401
      );
    }

    const targetId = decodeURIComponent(path.slice('/media/'.length));
    const legacyItems = legacyImagesJson as Array<{ id: string }>;
    if (legacyItems.some((item) => item.id === targetId)) {
      return jsonResponse(
        {
          error:
            'Legacy R2 images are protected during migration and cannot be deleted.',
        },
        403
      );
    }

    if (!targetId.startsWith('cl_')) {
      return jsonResponse({ error: 'Invalid Cloudinary asset ID.' }, 400);
    }

    let publicId = '';
    try {
      publicId = decodeBase64Url(targetId.slice(3));
    } catch {
      return jsonResponse({ error: 'Malformed asset identifier.' }, 400);
    }

    const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = env.CLOUDINARY_API_SECRET?.trim();
    if (!cloudName || !apiKey || !apiSecret) {
      return jsonResponse(
        { error: 'Cloudinary API credentials are not configured.' },
        503
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await signCloudinaryParams(
      { public_id: publicId, timestamp },
      apiSecret
    );

    const destroyForm = new FormData();
    destroyForm.append('public_id', publicId);
    destroyForm.append('api_key', apiKey);
    destroyForm.append('timestamp', String(timestamp));
    destroyForm.append('signature', signature);

    const destroyRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: destroyForm,
      }
    );

    if (!destroyRes.ok) {
      return jsonResponse(
        { error: 'Failed to delete image from Cloudinary.' },
        502
      );
    }

    return jsonResponse({ deleted: true, id: targetId });
  }

  return jsonResponse({ error: 'API route not found.' }, 404);
}
