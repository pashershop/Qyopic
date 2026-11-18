import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = import.meta.dirname;
const LEGACY_CATALOG_PATH = path.join(ROOT_DIR, 'src', 'data', 'images.json');
const CLOUDINARY_CATALOG_PATH = path.join(
  ROOT_DIR,
  'src',
  'data',
  'cloudinary-catalog.json'
);
const SESSION_COOKIE_NAME = 'qyopic_admin';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

interface StoredImageRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  sourceType: 'AI Generated' | 'Licensed Stock';
  creator: string;
  storageProvider?: 'cloudinary' | 'legacy-r2' | 'local';
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

function getSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
  if (secret) return secret;
  // Ephemeral per-process fallback only when unconfigured (login still blocked without ADMIN_PASSWORD)
  return crypto.createHash('sha256').update(ROOT_DIR).digest('hex');
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
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

function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${expiresAt}.${crypto.randomBytes(16).toString('hex')}`;
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [expiresAtStr, nonce, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const payload = `${expiresAtStr}.${nonce}`;
  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const cookies = parseCookies(req.headers.cookie);
  if (!verifySessionToken(cookies[SESSION_COOKIE_NAME])) {
    res.status(401).json({
      error: 'Admin authentication required to upload or delete images.',
    });
    return;
  }
  next();
}

async function readJsonArray(filePath: string): Promise<StoredImageRecord[]> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredImageRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeCloudinaryCatalog(items: StoredImageRecord[]): Promise<void> {
  await fs.writeFile(
    CLOUDINARY_CATALOG_PATH,
    `${JSON.stringify(items, null, 2)}\n`,
    'utf8'
  );
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

function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const sorted = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto
    .createHash('sha1')
    .update(`${sorted}${apiSecret}`)
    .digest('hex');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Admin session status
  app.get('/api/admin/session', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const authenticated = verifySessionToken(cookies[SESSION_COOKIE_NAME]);
    const adminConfigured = Boolean(process.env.ADMIN_PASSWORD);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const hasSigned = Boolean(
      process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
    );
    const hasPreset = Boolean(process.env.CLOUDINARY_UPLOAD_PRESET);
    const cloudinaryConfigured = Boolean(cloudName && (hasSigned || hasPreset));

    res.json({
      authenticated,
      adminConfigured,
      cloudinaryConfigured,
      activeProvider: 'cloudinary',
    });
  });

  // Admin login
  app.post('/api/admin/login', (req, res) => {
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (!configuredPassword) {
      res.status(503).json({
        error:
          'ADMIN_PASSWORD is not configured on the server. Set ADMIN_PASSWORD in your environment.',
      });
      return;
    }

    const submitted =
      typeof req.body?.password === 'string' ? req.body.password : '';
    const submittedBuf = Buffer.from(submitted, 'utf8');
    const configuredBuf = Buffer.from(configuredPassword, 'utf8');

    const matches =
      submittedBuf.length === configuredBuf.length &&
      crypto.timingSafeEqual(submittedBuf, configuredBuf);

    if (!matches) {
      res.status(401).json({ error: 'Invalid admin password.' });
      return;
    }

    const token = createSessionToken();
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TTL_MS,
      path: '/',
    });

    res.json({ authenticated: true });
  });

  // Admin logout
  app.post('/api/admin/logout', (_req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.json({ authenticated: false });
  });

  // Public merged catalog (Cloudinary uploads + preserved legacy R2 images)
  app.get('/api/media', async (_req, res) => {
    const [cloudinaryItems, legacyItems] = await Promise.all([
      readJsonArray(CLOUDINARY_CATALOG_PATH),
      readJsonArray(LEGACY_CATALOG_PATH),
    ]);

    const normalizedCloudinary = cloudinaryItems.map((item) => ({
      ...item,
      storageProvider: 'cloudinary' as const,
    }));
    const normalizedLegacy = legacyItems.map((item) => ({
      ...item,
      storageProvider: item.storageProvider ?? ('legacy-r2' as const),
    }));

    res.json({
      images: [...normalizedCloudinary, ...normalizedLegacy],
    });
  });

  // Admin-only Cloudinary Upload API using Upload Preset (API Secret never exposed to frontend)
  app.post('/api/media/upload', requireAdmin, async (req, res) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || (!(apiKey && apiSecret) && !uploadPreset)) {
      res.status(503).json({
        error:
          'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and credentials on the server.',
      });
      return;
    }

    const {
      fileDataUrl,
      title,
      category,
      description,
      sourceType,
      creator,
      tags,
    } = req.body ?? {};

    if (
      typeof fileDataUrl !== 'string' ||
      !/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(fileDataUrl)
    ) {
      res.status(400).json({ error: 'A valid base64 image file is required.' });
      return;
    }

    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    if (!cleanTitle) {
      res.status(400).json({ error: 'Image title is required.' });
      return;
    }

    const cleanCategory =
      typeof category === 'string' && VALID_CATEGORIES.has(category)
        ? category
        : 'Nature';

    const folder = `qyopic/${slugify(cleanCategory)}`;
    const formData = new FormData();
    formData.append('file', fileDataUrl);
    formData.append('folder', folder);
    if (uploadPreset) {
      formData.append('upload_preset', uploadPreset);
    }

    if (apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign: Record<string, string | number> = {
        folder,
        timestamp,
      };
      if (uploadPreset) {
        paramsToSign.upload_preset = uploadPreset;
      }
      const signature = signCloudinaryParams(paramsToSign, apiSecret);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
    }

    try {
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const uploadResult = (await uploadResponse.json()) as {
        public_id?: string;
        secure_url?: string;
        format?: string;
        bytes?: number;
        width?: number;
        height?: number;
        error?: { message?: string };
      };

      if (
        !uploadResponse.ok ||
        !uploadResult.public_id ||
        !uploadResult.secure_url
      ) {
        res.status(502).json({
          error:
            uploadResult.error?.message ||
            'Cloudinary upload failed. Check preset and credentials.',
        });
        return;
      }

      const width = Number(uploadResult.width) || 1920;
      const height = Number(uploadResult.height) || 1080;
      const sizeBytes = Number(uploadResult.bytes) || 0;
      const format = (uploadResult.format || 'jpg').toUpperCase();
      const id = `cl-${Date.now()}`;
      const slug = `${slugify(cleanTitle)}-${Date.now().toString(36).slice(-4)}`;

      const cleanTags = Array.isArray(tags)
        ? tags
            .map((t) => String(t).trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 10)
        : typeof tags === 'string'
          ? tags
              .split(',')
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean)
              .slice(0, 10)
          : [cleanCategory.toLowerCase()];

      const newRecord: StoredImageRecord = {
        id,
        slug,
        title: cleanTitle,
        description:
          typeof description === 'string' && description.trim()
            ? description.trim()
            : `Curated ${cleanCategory.toLowerCase()} visual hosted on Cloudinary CDN.`,
        category: cleanCategory,
        sourceType:
          sourceType === 'AI Generated' ? 'AI Generated' : 'Licensed Stock',
        creator:
          typeof creator === 'string' && creator.trim()
            ? creator.trim()
            : 'Qyopic Admin',
        storageProvider: 'cloudinary',
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        aspectRatio: inferAspectRatio(width, height),
        width,
        height,
        sizeBytes,
        fileSize: formatBytes(sizeBytes),
        format,
        publishedAt: new Date().toISOString().slice(0, 10),
        downloads: 0,
        featured: true,
        popular: false,
        latest: true,
        tags: cleanTags.length > 0 ? cleanTags : [cleanCategory.toLowerCase()],
        palette: ['#0A0A0A', '#52525B', '#D4D4D8', '#FAFAFA'],
      };

      const existing = await readJsonArray(CLOUDINARY_CATALOG_PATH);
      await writeCloudinaryCatalog([newRecord, ...existing]);

      res.status(201).json({ image: newRecord });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Unexpected upload failure.',
      });
    }
  });

  // Admin-only Delete API (Protects legacy R2 items during migration)
  app.delete('/api/media/:id', requireAdmin, async (req, res) => {
    const targetId = req.params.id;
    const legacyItems = await readJsonArray(LEGACY_CATALOG_PATH);
    if (legacyItems.some((item) => item.id === targetId)) {
      res.status(403).json({
        error:
          'Legacy R2 images are protected during migration and cannot be deleted.',
      });
      return;
    }

    const cloudinaryItems = await readJsonArray(CLOUDINARY_CATALOG_PATH);
    const target = cloudinaryItems.find((item) => item.id === targetId);
    if (!target) {
      res.status(404).json({ error: 'Image not found.' });
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (cloudName && apiKey && apiSecret && target.publicId) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = signCloudinaryParams(
          {
            public_id: target.publicId,
            timestamp,
          },
          apiSecret
        );

        const destroyForm = new FormData();
        destroyForm.append('public_id', target.publicId);
        destroyForm.append('api_key', apiKey);
        destroyForm.append('timestamp', String(timestamp));
        destroyForm.append('signature', signature);

        await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
          {
            method: 'POST',
            body: destroyForm,
          }
        );
      } catch {
        // Proceed with catalog cleanup even if remote destroy encounters transient error
      }
    }

    const remaining = cloudinaryItems.filter((item) => item.id !== targetId);
    await writeCloudinaryCatalog(remaining);

    res.json({ deleted: true, id: targetId });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Qyopic server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Qyopic server:', err);
  process.exit(1);
});
