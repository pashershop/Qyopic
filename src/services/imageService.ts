import rawImages from '@/src/data/images.json';
import { resolveImageUrl } from '@/src/config/media';
import type { Category, ImageItem, SourceFilter } from '@/src/types/image';

const catalog: ImageItem[] = rawImages as ImageItem[];

export function getAllImages(): ImageItem[] {
  return catalog;
}

export function getFeaturedImages(): ImageItem[] {
  return catalog.filter((item) => item.featured);
}

export function getPopularImages(): ImageItem[] {
  return [...catalog]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 8);
}

export function getLatestImages(): ImageItem[] {
  return [...catalog]
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

export async function downloadImageFile(item: ImageItem): Promise<void> {
  const imageUrl = resolveImageUrl(item.r2Key);
  const fileName = `${item.slug}.${item.format.toLowerCase()}`;

  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
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
    // Fallback for cross-origin buckets without CORS download headers
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
