import { Search, X } from 'lucide-react';
import type { FormEvent, RefObject } from 'react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  totalImages: number;
}

const QUICK_TERMS = [
  'Mountain',
  'Brutalist',
  'Minimal',
  'Desert',
  'Classic',
  'Sculpture',
];

export function Hero({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchInputRef,
  totalImages,
}: HeroProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <section
      id="top"
      className="bg-white border-b border-[#E4E4E7] pt-10 pb-10 sm:pt-16 sm:pb-14"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-medium text-[#71717A] tracking-wide mb-3">
            Curated AI Visuals · Licensed Stock Photography ·{' '}
            <span className="font-mono tabular-nums">{totalImages}</span> High-Res Works
          </p>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-[#0A0A0A] leading-[1.08] text-balance">
            Discover Beautiful Images
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#52525B] leading-relaxed max-w-2xl mx-auto">
            Explore a world of stunning photography and creative visuals.
          </p>

          {/* Large Search Bar */}
          <form
            onSubmit={handleSubmit}
            role="search"
            aria-label="Search images"
            className="mt-8 relative flex items-center w-full h-14 rounded-xl border border-[#D4D4D8] bg-white focus-within:border-[#0A0A0A] transition-colors"
          >
            <Search
              className="w-5 h-5 text-[#71717A] ml-4 shrink-0"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="hero-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search landscapes, architecture, cars, digital art..."
              aria-label="Search images by keyword, category, or style"
              className="w-full h-full px-3.5 bg-transparent text-sm sm:text-base text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="inline-flex items-center justify-center w-9 h-9 mr-1 text-[#71717A] hover:text-[#0A0A0A] rounded-lg hover:bg-[#F4F4F5] transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            <button
              type="submit"
              className="mr-1.5 h-11 px-5 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#27272A] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
            >
              Search
            </button>
          </form>

          {/* Quiet Inline Trending Searches (Zero Pills) */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-[#71717A]">
            <span>Popular searches:</span>
            {QUICK_TERMS.map((term, index) => (
              <span key={term} className="inline-flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange(term);
                    onSearchSubmit();
                  }}
                  className="text-[#52525B] hover:text-[#0A0A0A] underline underline-offset-4 decoration-[#D4D4D8] hover:decoration-[#0A0A0A] transition-colors cursor-pointer"
                >
                  {term}
                </button>
                {index < QUICK_TERMS.length - 1 && (
                  <span aria-hidden="true" className="text-[#D4D4D8]">
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
