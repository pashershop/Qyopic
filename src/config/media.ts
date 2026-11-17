/**
 * Cloudflare R2 Public Media Configuration
 *
 * To switch from local demo assets to Cloudflare R2 storage:
 * 1. Set VITE_R2_PUBLIC_URL in your environment (e.g., https://cdn.qyopic.com).
 * 2. Upload your image files to your R2 bucket using the matching r2Key path,
 *    or replace r2Key values in src/data/images.json with full R2 public URLs.
 */
export const R2_PUBLIC_BASE_URL = (
  import.meta.env.VITE_R2_PUBLIC_URL || ''
).replace(/\/+$/, '');

export function resolveImageUrl(r2Key: string): string {
  if (!r2Key) return '';
  if (/^https?:\/\//i.test(r2Key)) {
    return r2Key;
  }

  const normalizedKey = r2Key.startsWith('/') ? r2Key : `/${r2Key}`;
  if (R2_PUBLIC_BASE_URL) {
    return `${R2_PUBLIC_BASE_URL}${normalizedKey}`;
  }

  return normalizedKey;
}
