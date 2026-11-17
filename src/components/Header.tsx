import { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
  onNavigateSection: (sectionId: string) => void;
  onResetHome: () => void;
}

const NAV_LINKS = [
  { label: 'Explore', target: 'featured' },
  { label: 'Categories', target: 'categories' },
  { label: 'Popular', target: 'popular' },
  { label: 'Latest', target: 'latest' },
] as const;

export function Header({
  onSearchClick,
  onNavigateSection,
  onResetHome,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (target: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(target);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E4E4E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
            onResetHome();
          }}
          className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#0A0A0A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A] rounded-sm"
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

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#52525B]"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.target}
              type="button"
              onClick={() => handleNavClick(link.target)}
              className="py-1 text-[#52525B] hover:text-[#0A0A0A] border-b border-transparent hover:border-[#0A0A0A] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Search Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onSearchClick();
            }}
            aria-label="Search images"
            className="inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-lg border border-[#E4E4E7] bg-white text-[#0A0A0A] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-colors text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
          >
            <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E4E4E7] text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#E4E4E7] bg-white px-4 py-3 flex flex-col gap-1"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.target}
              type="button"
              onClick={() => handleNavClick(link.target)}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] rounded-lg transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
