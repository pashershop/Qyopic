import { Search } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
  onResetHome: () => void;
}

export function Header({ onSearchClick, onResetHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 pt-2.5 sm:pt-3 px-3 sm:px-6 lg:px-8 pointer-events-none">
      <div className="pointer-events-auto max-w-7xl mx-auto h-13 sm:h-14 pl-4 pr-2 sm:pl-5 sm:pr-2.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#E4E4E7] flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onResetHome();
          }}
          className="inline-flex items-center gap-2 min-h-[40px] font-display text-lg sm:text-xl font-bold tracking-tight leading-none text-[#0A0A0A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A] rounded-full"
        >
          <svg
            width="22"
            height="22"
            viewBox="3.75 3.75 16.5 16.5"
            fill="none"
            aria-hidden="true"
            className="w-[22px] h-[22px] sm:w-6 sm:h-6 shrink-0"
          >
            <rect
              x="4.6875"
              y="4.6875"
              width="14.625"
              height="14.625"
              rx="2.8125"
              stroke="#0A0A0A"
              strokeWidth="1.5"
            />
            <circle cx="8.8" cy="8.8" r="1.25" fill="#0A0A0A" />
            <rect x="13.95" y="7.55" width="2.5" height="2.5" rx="0.5" fill="#0A0A0A" />
            <rect x="10.75" y="10.75" width="2.5" height="2.5" rx="0.5" fill="#0A0A0A" />
            <rect x="13.95" y="10.75" width="2.5" height="2.5" rx="0.5" fill="#0A0A0A" />
            <rect x="7.55" y="13.95" width="2.5" height="2.5" rx="0.5" fill="#0A0A0A" />
            <rect x="10.75" y="13.95" width="2.5" height="2.5" rx="0.5" fill="#0A0A0A" />
            <rect x="13.95" y="13.95" width="2.5" height="2.5" rx="0.5" fill="#0A0A0A" />
          </svg>
          <span className="leading-none">Qyopic</span>
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
