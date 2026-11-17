import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ImageOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdContainer } from '@/src/components/AdContainer';
import { resolveImageUrl } from '@/src/config/media';
import { getRelatedImages } from '@/src/services/imageService';
import type { ImageCategory, ImageItem } from '@/src/types/image';

interface StockPageProps {
  image: ImageItem;
  allImages: ImageItem[];
  onBackHome: () => void;
  onOpenStock: (image: ImageItem) => void;
  onDownload: (image: ImageItem) => Promise<void>;
  onSelectCategory: (category: ImageCategory) => void;
  onSearchTag: (tag: string) => void;
}

export function StockPage({
  image,
  allImages,
  onBackHome,
  onOpenStock,
  onDownload,
  onSelectCategory,
  onSearchTag,
}: StockPageProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setDownloaded(false);
    setCopied(false);
    setImgError(false);
  }, [image.id]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Breadcrumb & Prev/Next Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E4E4E7]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-[#E4E4E7] bg-white text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Gallery</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm text-[#71717A] min-w-0">
            <button
              type="button"
              onClick={() => onSelectCategory(image.category)}
              className="text-[#0A0A0A] font-medium hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              {image.category}
            </button>
            <span aria-hidden="true">/</span>
            <span className="truncate">{image.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={!prevImage}
            onClick={() => prevImage && onOpenStock(prevImage)}
            aria-label="Previous stock image"
            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-[#E4E4E7] text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            type="button"
            disabled={!nextImage}
            onClick={() => nextImage && onOpenStock(nextImage)}
            aria-label="Next stock image"
            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-[#E4E4E7] text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Top Leaderboard Ad Slot */}
      <div className="mt-6">
        <AdContainer slotId="stock-top-banner" variant="banner" />
      </div>

      {/* Main Stock Image & Download Sidebar */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: High-Res Visual */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] p-4 sm:p-8 flex items-center justify-center min-h-[320px] sm:min-h-[520px]">
          {!imgError ? (
            <img
              src={imageUrl}
              alt={image.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 text-[#71717A]">
              <ImageOff className="w-8 h-8 mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-[#0A0A0A]">
                {image.title}
              </p>
              <p className="text-xs mt-1">{image.category}</p>
            </div>
          )}
        </div>

        {/* Right: Title, Download, Ad Slot & Details */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5 sm:p-6">
            <p className="text-xs font-medium text-[#71717A]">
              {image.category} · {image.sourceType}
            </p>

            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
              {image.title}
            </h1>

            <p className="mt-3 text-sm text-[#52525B] leading-relaxed">
              {image.description}
            </p>

            {/* Primary Download & Copy Actions */}
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full inline-flex items-center justify-center gap-2 h-12 px-5 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#27272A] transition-colors cursor-pointer"
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
                    <span>Copy Direct Image Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Technical Details */}
            <dl className="mt-6 pt-6 border-t border-[#E4E4E7] grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
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
              <div className="flex flex-wrap items-center gap-2">
                {image.palette.map((hex) => (
                  <span
                    key={hex}
                    title={hex}
                    className="w-5 h-5 rounded-sm border border-[#E4E4E7] inline-block"
                    style={{ backgroundColor: hex }}
                  />
                ))}
                <span className="text-xs font-mono text-[#71717A] ml-1">
                  {image.palette.join(' · ')}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-5 pt-5 border-t border-[#E4E4E7]">
              <p className="text-xs text-[#71717A] mb-2">Tags</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#52525B]">
                {image.tags.map((tag, idx) => (
                  <span key={tag} className="inline-flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onSearchTag(tag)}
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

          {/* Sidebar Rectangle Ad Slot */}
          <AdContainer slotId="stock-sidebar-rectangle" variant="rectangle" />
        </div>
      </div>

      {/* Bottom Ad Banner Before Related Images */}
      <div className="mt-10">
        <AdContainer slotId="stock-bottom-banner" variant="banner" />
      </div>

      {/* Related Images */}
      {relatedImages.length > 0 && (
        <section
          aria-labelledby="related-images-heading"
          className="mt-12 pt-10 border-t border-[#E4E4E7]"
        >
          <h2
            id="related-images-heading"
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A]"
          >
            Related Stock Images
          </h2>
          <p className="mt-1 text-sm text-[#52525B]">
            More visuals matching {image.category} and similar themes.
          </p>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedImages.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onOpenStock(rel)}
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
                <div className="p-3 bg-white">
                  <p className="text-xs sm:text-sm font-semibold text-[#0A0A0A] truncate">
                    {rel.title}
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#71717A] mt-0.5 truncate">
                    {rel.category} · {rel.sourceType}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
