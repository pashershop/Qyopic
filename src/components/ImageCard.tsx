import { Download, ImageOff } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { resolveImageUrl } from '@/src/config/media';
import type { ImageItem } from '@/src/types/image';

interface ImageCardProps {
  image: ImageItem;
  onOpenStock: (image: ImageItem) => void;
}

const ASPECT_CLASS_MAP: Record<ImageItem['aspectRatio'], string> = {
  '3:4': 'aspect-[3/4]',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '1:1': 'aspect-square',
  '9:16': 'aspect-[9/16]',
};

export function ImageCard({ image, onOpenStock }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imageUrl = resolveImageUrl(image.r2Key);
  const aspectClass = ASPECT_CLASS_MAP[image.aspectRatio] || 'aspect-[4/3]';
  const stockHref = `/stock/${image.slug}`;

  const handleOpen = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onOpenStock(image);
  };

  return (
    <article className="break-inside-avoid mb-3 sm:mb-6 group">
      <a
        href={stockHref}
        onClick={handleOpen}
        aria-label={`View ${image.title} stock page`}
        className="block relative overflow-hidden rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
      >
        {/* Natural Aspect Container */}
        <div
          className={`relative w-full ${aspectClass} overflow-hidden bg-[#F4F4F5]`}
        >
          {!hasError ? (
            <img
              src={imageUrl}
              alt={image.title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setLoaded(true)}
              onError={() => setHasError(true)}
              className={`w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F4F4F5] text-[#71717A]">
              <ImageOff className="w-6 h-6 mb-2" aria-hidden="true" />
              <span className="text-xs font-medium text-[#0A0A0A]">
                {image.title}
              </span>
              <span className="text-[11px] mt-1">{image.category}</span>
            </div>
          )}

          {/* Desktop Hover & Focus Overlay */}
          <div className="hidden md:flex absolute inset-x-0 bottom-0 p-3.5 bg-[#0A0A0A]/85 text-white items-end justify-between gap-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {image.title}
              </h3>
              <p className="text-xs text-white/75 mt-0.5 truncate">
                {image.category} · {image.sourceType}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white text-[#0A0A0A] group-hover:bg-[#E4E4E7] transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Mobile Caption & Download Row (Navigates to Stock Page) */}
        <div className="flex md:hidden items-center justify-between gap-2 p-2.5 sm:p-3 bg-white border-t border-[#E4E4E7]">
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold text-[#0A0A0A] truncate">
              {image.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#71717A] mt-0.5 truncate">
              {image.category} · {image.sourceType}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#F4F4F5] text-[#0A0A0A] shrink-0"
          >
            <Download className="w-4 h-4" />
          </span>
        </div>
      </a>
    </article>
  );
}
