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
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ImageCategory = Exclude<Category, 'All'>;

export type ImageSourceType = 'AI Generated' | 'Licensed Stock';

export type SourceFilter = 'All' | ImageSourceType;

export type AspectRatio = '3:4' | '16:9' | '4:3' | '1:1' | '9:16';

export interface ImageItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ImageCategory;
  sourceType: ImageSourceType;
  creator: string;
  /**
   * Relative asset path or Cloudflare R2 object key.
   * When VITE_R2_PUBLIC_URL is set, resolveImageUrl() automatically prefixes it.
   */
  r2Key: string;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  fileSize: string;
  format: 'JPG' | 'PNG' | 'WEBP';
  publishedAt: string;
  downloads: number;
  featured: boolean;
  popular: boolean;
  latest: boolean;
  tags: string[];
  palette: string[];
}

export type InfoModalType = 'about' | 'contact' | 'privacy' | 'terms' | null;
