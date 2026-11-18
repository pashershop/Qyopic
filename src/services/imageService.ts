import rawCloudinaryImages from '@/src/data/cloudinary-catalog.json';
import rawLegacyImages from '@/src/data/images.json';
import { resolveMediaOriginalUrl } from '@/src/storage/storageManager';
import type { Category, ImageItem, SourceFilter } from '@/src/types/image';

const cloudinaryCatalog: ImageItem[] = (rawCloudinaryImages as ImageItem[]).map(
  (item) => ({
    ...item,
    storageProvider: item.storageProvider ?? 'cloudinary',
  })
);

const legacyCatalog: ImageItem[] = (rawLegacyImages as ImageItem[]).map(
  (item) => ({
    ...item,
    storageProvider: item.storageProvider ?? 'legacy-r2',
  })
);

const bundledCatalog: ImageItem[] = [...cloudinaryCatalog, ...legacyCatalog];

export function getAllImages(): ImageItem[] {
  return bundledCatalog;
}

export async function fetchMergedCatalog(): Promise<ImageItem[]> {
  try {
    const response = await fetch('/api/media', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return bundledCatalog;
    }
    const data = (await response.json()) as { images?: ImageItem[] };
    if (Array.isArray(data.images) && data.images.length > 0) {
      return data.images;
    }
    return bundledCatalog;
  } catch {
    return bundledCatalog;
  }
}

export function getFeaturedImages(): ImageItem[] {
  return bundledCatalog.filter((item) => item.featured);
}

export function getPopularImages(): ImageItem[] {
  return [...bundledCatalog]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 8);
}

export function getLatestImages(): ImageItem[] {
  return [...bundledCatalog]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 8);
}

export function filterImages(
  images: ImageItem[],
  query: string,
  category: Category,
  sourceFilter: SourceFilter = 'All'
): ImageItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return images.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    if (!matchesCategory) return false;

    const matchesSource =
      sourceFilter === 'All' || item.sourceType === sourceFilter;
    if (!matchesSource) return false;

    if (!normalizedQuery) return true;

    const haystack = [
      item.title,
      item.description,
      item.category,
      item.sourceType,
      item.creator,
      ...item.tags,
    ]
      .join(' ')
      .toLowerCase();

    return normalizedQuery
      .split(/\s+/)
      .every((term) => haystack.includes(term));
  });
}

export function getRelatedImages(
  target: ImageItem,
  allImages: ImageItem[],
  limit = 4
): ImageItem[] {
  const targetTags = new Set(target.tags);

  return allImages
    .filter((item) => item.id !== target.id)
    .map((item) => {
      let score = 0;
      if (item.category === target.category) score += 10;
      for (const tag of item.tags) {
        if (targetTags.has(tag)) score += 2;
      }
      if (item.sourceType === target.sourceType) score += 1;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function getCategoryCounts(images: ImageItem[]): Record<Category, number> {
  const counts: Record<string, number> = { All: images.length };
  for (const item of images) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }
  return counts as Record<Category, number>;
}

/**
 * Downloads the image at 100% original quality via the active StorageProvider.
 * For Cloudinary images, uses fl_attachment without resize/lossy transforms.
 * For legacy R2/local images, fetches the preserved original asset cleanly.
 */
export async function downloadImageFile(item: ImageItem): Promise<void> {
  const originalUrl = resolveMediaOriginalUrl(item);
  const ext = (item.format || 'jpg').toLowerCase();
  const fileName = `${item.slug}.${ext}`;

  try {
    const response = await fetch(originalUrl, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    const link = document.createElement('a');
    link.href = originalUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
