export const CATEGORIES = [
  'All',
  'Nature',
  'Technology',
  'Animals',
  'Architecture',
  'Wallpapers',
  'Abstract',
  'Cars',
  'Digital Art',
  '3D Renders',
  'Anime',
  'Cyberpunk',
  'Minimalist',
  'Space',
  'Aesthetic',
  'Portraits',
  'Gaming',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ImageCategory = Exclude<Category, 'All'>;

export type ImageSourceType = 'AI Generated' | 'Licensed Stock';

export type SourceFilter = 'All' | ImageSourceType;

export type AspectRatio = '3:4' | '16:9' | '4:3' | '1:1' | '9:16' | string;

export type StorageProviderId = 'cloudinary' | 'legacy-r2' | 'local';

export interface ImageItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ImageCategory;
  sourceType: ImageSourceType;
  creator: string;
  /**
   * Active storage provider for this asset.
   * Existing pre-migration items default to 'legacy-r2' / 'local';
   * new uploads use 'cloudinary'.
   */
  storageProvider?: StorageProviderId;
  /** Cloudinary Public ID (e.g., "qyopic/nature/alpine-peaks") */
  publicId?: string;
  /** Primary CDN URL (Cloudinary secure_url or public URL) */
  url?: string;
  /** Preserved legacy R2 object key / local asset path during migration */
  r2Key?: string;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  /** Exact file size in bytes (stored for uploaded assets) */
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

export type InfoModalType = 'about' | 'contact' | 'privacy' | 'terms' | null;
