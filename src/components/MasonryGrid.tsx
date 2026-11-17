import { ImageCard } from '@/src/components/ImageCard';
import type { ImageItem } from '@/src/types/image';

interface MasonryGridProps {
  images: ImageItem[];
  onOpenStock: (image: ImageItem) => void;
  onResetFilters?: () => void;
}

export function MasonryGrid({
  images,
  onOpenStock,
  onResetFilters,
}: MasonryGridProps) {
  if (images.length === 0) {
    return (
      <div className="py-16 px-6 text-center border border-[#E4E4E7] rounded-xl bg-[#FAFAFA]">
        <h3 className="font-display text-lg font-semibold text-[#0A0A0A]">
          No matching images found
        </h3>
        <p className="mt-2 text-sm text-[#52525B] max-w-md mx-auto">
          Try clearing your search query or switching to another category to browse the full Qyopic collection.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#27272A] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 sm:gap-6">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onOpenStock={onOpenStock}
        />
      ))}
    </div>
  );
}
