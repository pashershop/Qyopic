import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ImageOff,
  Share2,
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedFeedback, setSharedFeedback] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setDownloaded(false);
    setCopiedLink(false);
    setSharedFeedback(false);
    setCopiedHex(null);
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
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      setCopiedLink(false);
    }
  };

  const handleShare = async () => {
    const pageUrl = window.location.href;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${image.title} — Qyopic`,
          text: image.description,
          url: pageUrl,
        });
        return;
      } catch {
        // User cancelled or share unavailable; fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(pageUrl);
      setSharedFeedback(true);
      setTimeout(() => setSharedFeedback(false), 1800);
    } catch {
      setSharedFeedback(false);
    }
  };

  const handleCopyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1500);
    } catch {
      setCopiedHex(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-9">
      {/* Top Action Bar (Mobile Touch-Friendly 44px Controls) */}
      <div className="flex items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-[#E4E4E7]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 h-11 px-3.5 rounded-lg border border-[#E4E4E7] bg-white text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] active:bg-[#E4E4E7] transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-sm text-[#71717A] min-w-0">
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
            aria-label="Previous image"
            className="inline-flex items-center justify-center gap-1.5 min-w-[44px] h-11 px-3 rounded-lg border border-[#E4E4E7] text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] active:bg-[#E4E4E7] disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            type="button"
            disabled={!nextImage}
            onClick={() => nextImage && onOpenStock(nextImage)}
            aria-label="Next image"
            className="inline-flex items-center justify-center gap-1.5 min-w-[44px] h-11 px-3 rounded-lg border border-[#E4E4E7] text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] active:bg-[#E4E4E7] disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Top Leaderboard Ad Slot */}
      <div className="mt-5">
        <AdContainer slotId="stock-top-banner" variant="banner" />
      </div>

      {/* Main Stock Showcase & Download Panel */}
      <div className="mt-5 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: High-Resolution Artwork Stage */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl border border-[#E4E4E7] overflow-hidden bg-[#FAFAFA]">
          <div className="p-3 sm:p-8 flex items-center justify-center min-h-[280px] sm:min-h-[500px]">
            {!imgError ? (
              <img
                src={imageUrl}
                alt={image.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="max-h-[68vh] sm:max-h-[74vh] w-auto max-w-full rounded-xl object-contain"
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

          {/* Crisp Stage Meta Bar */}
          <div className="px-4 sm:px-6 py-3 bg-white border-t border-[#E4E4E7] flex flex-wrap items-center justify-between gap-2 text-xs text-[#71717A]">
            <span>
              By <strong className="font-medium text-[#0A0A0A]">{image.creator}</strong>
            </span>
            <span className="font-mono tabular-nums">
              {image.width} × {image.height} px · {image.format} · {image.fileSize}
            </span>
          </div>
        </div>

        {/* Right: Title, Thumb-Friendly Download CTA, Details & Ad Slot */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 text-xs text-[#71717A]">
              <button
                type="button"
                onClick={() => onSelectCategory(image.category)}
                className="font-medium text-[#0A0A0A] hover:underline underline-offset-4 cursor-pointer"
              >
                {image.category}
              </button>
              <span>{image.sourceType}</span>
            </div>

            <h1 className="mt-2.5 font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#0A0A0A] leading-tight text-balance">
              {image.title}
            </h1>

            <p className="mt-3 text-sm text-[#52525B] leading-relaxed">
              {image.description}
            </p>

            {/* Primary Download & Quick Share Actions */}
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#27272A] active:bg-[#27272A] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
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
                      Download Free · {image.width}×{image.height}
                    </span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center justify-center gap-2 h-11 px-3 rounded-xl border border-[#E4E4E7] bg-white text-[#0A0A0A] text-xs sm:text-sm font-medium hover:bg-[#F4F4F5] active:bg-[#E4E4E7] transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Copied URL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 h-11 px-3 rounded-xl border border-[#E4E4E7] bg-white text-[#0A0A0A] text-xs sm:text-sm font-medium hover:bg-[#F4F4F5] active:bg-[#E4E4E7] transition-colors cursor-pointer"
                >
                  {sharedFeedback ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Clean License Note */}
            <div className="mt-5 flex items-start gap-2.5 text-xs text-[#52525B] pt-5 border-t border-[#E4E4E7]">
              <CheckCircle2
                className="w-4 h-4 text-[#0A0A0A] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>
                Free for personal and commercial use. No attribution required.
              </span>
            </div>

            {/* Clean Hairline Details List */}
            <dl className="mt-5 pt-5 border-t border-[#E4E4E7] divide-y divide-[#E4E4E7] text-sm">
              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-xs text-[#71717A]">Creator</dt>
                <dd className="font-medium text-[#0A0A0A] text-right">
                  {image.creator}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-xs text-[#71717A]">Resolution</dt>
                <dd className="font-mono text-xs sm:text-sm tabular-nums text-[#0A0A0A]">
                  {image.width} × {image.height} px
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-xs text-[#71717A]">Aspect Ratio</dt>
                <dd className="font-mono text-xs sm:text-sm tabular-nums text-[#0A0A0A]">
                  {image.aspectRatio}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-xs text-[#71717A]">File Size</dt>
                <dd className="font-mono text-xs sm:text-sm tabular-nums text-[#0A0A0A]">
                  {image.fileSize} ({image.format})
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-xs text-[#71717A]">Published</dt>
                <dd className="font-mono text-xs sm:text-sm tabular-nums text-[#0A0A0A]">
                  {image.publishedAt}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-4">
                <dt className="text-xs text-[#71717A]">Downloads</dt>
                <dd className="font-mono text-xs sm:text-sm tabular-nums text-[#0A0A0A]">
                  {image.downloads.toLocaleString()}
                </dd>
              </div>
            </dl>

            {/* Interactive Color Palette Swatches */}
            <div className="mt-5 pt-5 border-t border-[#E4E4E7]">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs text-[#71717A]">Color Palette</p>
                {copiedHex && (
                  <span className="text-xs font-mono text-[#0A0A0A]">
                    Copied {copiedHex}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {image.palette.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => handleCopyColor(hex)}
                    title={`Copy ${hex}`}
                    className="group flex flex-col items-center gap-1.5 p-1.5 rounded-lg border border-[#E4E4E7] hover:border-[#0A0A0A] transition-colors cursor-pointer"
                  >
                    <span
                      className="w-full h-6 rounded-sm border border-black/10 block"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[10px] font-mono text-[#52525B] group-hover:text-[#0A0A0A]">
                      {hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clickable Tags */}
            <div className="mt-5 pt-5 border-t border-[#E4E4E7]">
              <p className="text-xs text-[#71717A] mb-2">Tags</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-[#52525B]">
                {image.tags.map((tag, idx) => (
                  <span key={tag} className="inline-flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onSearchTag(tag)}
                      className="py-0.5 hover:text-[#0A0A0A] underline underline-offset-4 decoration-[#D4D4D8] hover:decoration-[#0A0A0A] transition-colors cursor-pointer"
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
      <div className="mt-8 sm:mt-10">
        <AdContainer slotId="stock-bottom-banner" variant="banner" />
      </div>

      {/* Related Stock Images */}
      {relatedImages.length > 0 && (
        <section
          aria-labelledby="related-images-heading"
          className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-[#E4E4E7]"
        >
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2
                id="related-images-heading"
                className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A]"
              >
                Related Stock Images
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#52525B]">
                More visuals matching {image.category} and similar tones.
              </p>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {relatedImages.map((rel) => (
              <a
                key={rel.id}
                href={`/stock/${rel.slug}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  e.preventDefault();
                  onOpenStock(rel);
                }}
                className="group block text-left rounded-xl overflow-hidden border border-[#E4E4E7] bg-[#F4F4F5] hover:border-[#0A0A0A] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
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
                <div className="p-2.5 sm:p-3 bg-white border-t border-[#E4E4E7]">
                  <p className="text-xs sm:text-sm font-semibold text-[#0A0A0A] truncate">
                    {rel.title}
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#71717A] mt-0.5 truncate">
                    {rel.category} · {rel.sourceType}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
