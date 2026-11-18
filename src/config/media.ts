export {
  ACTIVE_UPLOAD_PROVIDER,
  resolveMediaDirectUrl,
  resolveMediaDisplayUrl,
  resolveMediaOriginalUrl,
  resolveProviderForItem,
} from '@/src/storage/storageManager';

export function resolveImageUrl(keyOrUrl: string): string {
  if (!keyOrUrl) return '';
  if (/^https?:\/\//i.test(keyOrUrl)) {
    return keyOrUrl;
  }
  const normalized = keyOrUrl.startsWith('/') ? keyOrUrl : `/${keyOrUrl}`;
  const legacyBase = (import.meta.env.VITE_R2_PUBLIC_URL || '').replace(
    /\/+$/,
    ''
  );
  return legacyBase ? `${legacyBase}${normalized}` : normalized;
}
