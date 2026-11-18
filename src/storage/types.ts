import type { ImageItem, StorageProviderId } from '@/src/types/image';

export interface StorageDisplayOptions {
  width?: number;
  quality?: 'auto' | 'original';
}

export interface StorageProvider {
  readonly id: StorageProviderId;
  readonly label: string;
  canHandle(item: ImageItem): boolean;
  getDisplayUrl(item: ImageItem, options?: StorageDisplayOptions): string;
  getOriginalDownloadUrl(item: ImageItem): string;
  getDirectUrl(item: ImageItem): string;
}
