import type { MouseEvent } from 'react';

interface FooterProps {
  onNavigatePath: (path: string) => void;
  onResetHome: () => void;
}

const FOOTER_LINKS = [
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Terms & Conditions', path: '/terms' },
] as const;

export function Footer({ onNavigatePath, onResetHome }: FooterProps) {
  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigatePath(path);
  };

  return (
    <footer className="bg-white border-t border-[#E4E4E7] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onResetHome();
              }}
              className="font-display text-lg font-bold tracking-tight text-[#0A0A0A] cursor-pointer"
            >
              Qyopic
            </a>
            <p className="mt-1 text-sm text-[#71717A]">
              Discover Beautiful Images.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#52525B]"
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => handleLinkClick(e, link.path)}
                className="hover:text-[#0A0A0A] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E4E4E7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#71717A]">
          <p>© {new Date().getFullYear()} Qyopic. All rights reserved.</p>
          <p>Curated AI-generated visuals &amp; licensed stock photography.</p>
        </div>
      </div>
    </footer>
  );
}
