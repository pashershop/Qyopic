import { cloudinaryProvider } from '@/src/storage/providers/cloudinaryProvider';
import { legacyR2Provider } from '@/src/storage/providers/legacyR2Provider';
import type { StorageDisplayOptions, StorageProvider } from '@/src/storage/types';
import type { ImageItem, StorageProviderId } from '@/src/types/image';

/**
 * Modular Storage Manager
 * Register new storage providers here without touching UI components.
 */
const REGISTERED_PROVIDERS: StorageProvider[] = [
  cloudinaryProvider,
  legacyR2Provider,
];

export const ACTIVE_UPLOAD_PROVIDER: StorageProviderId = 'cloudinary';

export function resolveProviderForItem(item: ImageItem): StorageProvider {
  const matched = REGISTERED_PROVIDERS.find((provider) =>
    provider.canHandle(item)
  );
  return matched ?? legacyR2Provider;
}

export function resolveMediaDisplayUrl(
  item: ImageItem,
  options?: StorageDisplayOptions
): string {
  return resolveProviderForItem(item).getDisplayUrl(item, options);
}

export function resolveMediaOriginalUrl(item: ImageItem): string {
  return resolveProviderForItem(item).getOriginalDownloadUrl(item);
}

export function resolveMediaDirectUrl(item: ImageItem): string {
  return resolveProviderForItem(item).getDirectUrl(item);
}
