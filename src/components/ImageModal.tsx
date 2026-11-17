import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { resolveImageUrl } from '@/src/config/media';
import { getRelatedImages } from '@/src/services/imageService';
import type { ImageItem } from '@/src/types/image';

interface ImageModalProps {
  image: ImageItem | null;
  allImages: ImageItem[];
  onClose: () => void;
  onSelectImage: (image: ImageItem) => void;
  onDownload: (image: ImageItem) => Promise<void>;
  onSelectCategory: (category: ImageItem['category']) => void;
  onSearchTag: (tag: string) => void;
}

export function ImageModal({
  image,
  allImages,
  onClose,
  onSelectImage,
  onDownload,
  onSelectCategory,
  onSearchTag,
}: ImageModalProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDownloaded(false);
    setCopied(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [image?.id]);

  useEffect(() => {
    if (!image) return;

    const currentIndex = allImages.findIndex((item) => item.id === image.id);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onSelectImage(allImages[currentIndex - 1]);
      } else if (
        e.key === 'ArrowRight' &&
        currentIndex >= 0 &&
        currentIndex < allImages.length - 1
      ) {
        onSelectImage(allImages[currentIndex + 1]);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [image, allImages, onClose, onSelectImage]);

  if (!image) return null;

  const imageUrl = resolveImageUrl(image.r2Key);
  const relatedImages = getRelatedImages(image, allImages, 4);
  const currentIndex = allImages.findIndex((item) => item.id === image.id);
  const prevImage = currentIndex > 0 ? allImages[currentIndex - 1] : null;
  const nextImage =
    currentIndex >= 0 && currentIndex < allImages.length - 1
      ? allImages[currentIndex + 1]
      : null;

  const handleDownload = async () => {
    await onDownload(image);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1800);
  };

  const handleCopyUrl = async () => {
    const absoluteUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${window.location.origin}${imageUrl}`;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-image-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#0A0A0A]/75 flex items-center justify-center p-2 sm:p-6"
    >
      <div
        ref={scrollContainerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[94vh] overflow-y-auto bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl"
      >
        {/* Top Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 bg-white border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#52525B] min-w-0">
            <button
              type="button"
              onClick={() => {
                onSelectCategory(image.category);
                onClose();
              }}
              className="font-medium text-[#0A0A0A] hover:underline underline-offset-4 cursor-pointer truncate"
            >
              {image.category}
            </button>
            <span aria-hidden="true">·</span>
            <span className="truncate">{image.sourceType}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {prevImage && (
              <button
                type="button"
                onClick={() => onSelectImage(prevImage)}
                aria-label="Previous image"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E4E4E7] text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            {nextImage && (
              <button
                type="button"
                onClick={() => onSelectImage(nextImage)}
                aria-label="Next image"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E4E4E7] text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E4E4E7] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Main Image & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* High-Res Image Viewport */}
          <div className="lg:col-span-7 xl:col-span-8 bg-[#FAFAFA] border-b lg:border-b-0 lg:border-r border-[#E4E4E7] p-4 sm:p-8 flex items-center justify-center min-h-[300px] sm:min-h-[460px]">
            <img
              src={imageUrl}
              alt={image.title}
              referrerPolicy="no-referrer"
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
            />
          </div>

          {/* Full Image Details Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 p-5 sm:p-7 flex flex-col justify-between gap-6">
            <div>
              <h2
                id="modal-image-title"
                className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A]"
              >
                {image.title}
              </h2>

              <p className="mt-2.5 text-sm text-[#52525B] leading-relaxed">
                {image.description}
              </p>

              {/* Primary Actions */}
              <div className="mt-6 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  {downloaded ? (
                    <>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span>Downloaded {image.format}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" aria-hidden="true" />
                      <span>
                        Download {image.format} · {image.width}×{image.height}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-[#E4E4E7] bg-white text-[#0A0A0A] text-sm font-medium hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span>Image Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>Copy Image Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Technical Specifications */}
              <dl className="mt-7 pt-6 border-t border-[#E4E4E7] grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                <div>
                  <dt className="text-xs text-[#71717A]">Creator</dt>
                  <dd className="mt-0.5 font-medium text-[#0A0A0A]">
                    {image.creator}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#71717A]">Dimensions</dt>
                  <dd className="mt-0.5 font-mono text-xs sm:text-sm tabular-nums text-[#0A0A0A]">
                    {image.width} × {image.height} px
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#71717A]">Aspect Ratio</dt>
                  <dd className="mt-0.5 font-mono text-xs sm:text-sm tabular-nums text-[#0A0A0A]">
                    {image.aspectRatio}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#71717A]">File Size</dt>
                  <dd className="mt-0.5 font-mono text-xs sm:text-sm tabular-nums text-[#0A0A0A]">
                    {image.fileSize}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#71717A]">Published</dt>
                  <dd className="mt-0.5 font-mono text-xs sm:text-sm tabular-nums text-[#0A0A0A]">
                    {image.publishedAt}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#71717A]">Downloads</dt>
                  <dd className="mt-0.5 font-mono text-xs sm:text-sm tabular-nums text-[#0A0A0A]">
                    {image.downloads.toLocaleString()}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-[#71717A]">License</dt>
                  <dd className="mt-0.5 text-xs sm:text-sm text-[#0A0A0A]">
                    Free for personal and commercial projects · No attribution required
                  </dd>
                </div>
              </dl>

              {/* Color Palette */}
              <div className="mt-6 pt-5 border-t border-[#E4E4E7]">
                <p className="text-xs text-[#71717A] mb-2.5">Color Palette</p>
                <div className="flex items-center gap-2">
                  {image.palette.map((hex) => (
                    <div
                      key={hex}
                      title={hex}
                      className="flex items-center gap-1.5"
                    >
                      <span
                        className="w-5 h-5 rounded-sm border border-[#E4E4E7] inline-block"
                        style={{ backgroundColor: hex }}
                      />
                    </div>
                  ))}
                  <span className="text-xs font-mono text-[#71717A] ml-1">
                    {image.palette.join(' · ')}
                  </span>
                </div>
              </div>

              {/* Tags (Clean Inline Links) */}
              <div className="mt-5 pt-5 border-t border-[#E4E4E7]">
                <p className="text-xs text-[#71717A] mb-2">Tags</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#52525B]">
                  {image.tags.map((tag, idx) => (
                    <span key={tag} className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          onSearchTag(tag);
                          onClose();
                        }}
                        className="hover:text-[#0A0A0A] underline underline-offset-4 decoration-[#D4D4D8] hover:decoration-[#0A0A0A] transition-colors cursor-pointer"
                      >
                        #{tag}
                      </button>
                      {idx < image.tags.length - 1 && (
                        <span aria-hidden="true" className="text-[#D4D4D8]">
                          ·
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Images Section */}
        {relatedImages.length > 0 && (
          <div className="p-5 sm:p-7 border-t border-[#E4E4E7] bg-white">
            <h3 className="font-display text-base sm:text-lg font-semibold text-[#0A0A0A]">
              Related Images
            </h3>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedImages.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onSelectImage(rel)}
                  className="group text-left rounded-xl overflow-hidden border border-[#E4E4E7] bg-[#F4F4F5] hover:border-[#0A0A0A] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#F4F4F5]">
                    <img
                      src={resolveImageUrl(rel.r2Key)}
                      alt={rel.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    />
                  </div>
                  <div className="p-2.5 bg-white">
                    <p className="text-xs font-semibold text-[#0A0A0A] truncate">
                      {rel.title}
                    </p>
                    <p className="text-[11px] text-[#71717A] mt-0.5 truncate">
                      {rel.category} · {rel.sourceType}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
