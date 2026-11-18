import type { StorageDisplayOptions, StorageProvider } from '@/src/storage/types';
import type { ImageItem } from '@/src/types/image';

/**
 * Legacy R2 / Local Asset Provider
 * Preserves existing R2 URLs and local demo image paths intact during migration.
 */
const LEGACY_R2_BASE_URL = (
  import.meta.env.VITE_R2_PUBLIC_URL || ''
).replace(/\/+$/, '');

export const legacyR2Provider: StorageProvider = {
  id: 'legacy-r2',
  label: 'Legacy R2 / Local Assets',

  canHandle(item: ImageItem): boolean {
    return Boolean(item.r2Key || item.url);
  },

  getDisplayUrl(item: ImageItem, _options?: StorageDisplayOptions): string {
    return this.getDirectUrl(item);
  },

  getOriginalDownloadUrl(item: ImageItem): string {
    return this.getDirectUrl(item);
  },

  getDirectUrl(item: ImageItem): string {
    const raw = item.r2Key || item.url || '';
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }

    const normalizedKey = raw.startsWith('/') ? raw : `/${raw}`;
    if (LEGACY_R2_BASE_URL) {
      return `${LEGACY_R2_BASE_URL}${normalizedKey}`;
    }

    return normalizedKey;
  },
};
