import { Search } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
  onResetHome: () => void;
}

export function Header({ onSearchClick, onResetHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 pt-2.5 sm:pt-3 px-3 sm:px-6 lg:px-8 pointer-events-none">
      <div className="pointer-events-auto max-w-7xl mx-auto h-13 sm:h-14 pl-4 pr-2 sm:pl-6 sm:pr-2.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#E4E4E7] shadow-xs flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onResetHome();
          }}
          className="inline-flex items-center gap-2.5 min-h-[40px] font-display text-lg sm:text-xl font-bold tracking-tight text-[#0A0A0A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A] rounded-full"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-[#0A0A0A] shrink-0"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r="3.5"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M15.5 15.5L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Qyopic</span>
        </a>

        {/* Primary Search Trigger */}
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search images"
          className="inline-flex items-center justify-center gap-2 h-9 sm:h-10 px-4 rounded-full border border-[#E4E4E7] bg-white text-[#0A0A0A] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] active:bg-[#E4E4E7] transition-colors text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
        >
          <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Search</span>
        </button>
      </div>
    </header>
  );
}
