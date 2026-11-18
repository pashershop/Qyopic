import type { MouseEvent, ReactNode } from 'react';

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

interface SocialItem {
  name: string;
  href: string;
  icon: ReactNode;
}

const SOCIAL_LINKS: SocialItem[] = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8.2h2.75l.41-3.2H13.5V7.56c0-.93.26-1.56 1.59-1.56h1.7V3.14c-.3-.04-1.31-.14-2.49-.14-2.46 0-4.15 1.5-4.15 4.26V9.6H7.35v3.2h2.8V21h3.35z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.58 7.19a2.75 2.75 0 0 0-1.94-1.95C17.93 4.78 12 4.78 12 4.78s-5.93 0-7.64.46A2.75 2.75 0 0 0 2.42 7.2 28.7 28.7 0 0 0 1.96 12a28.7 28.7 0 0 0 .46 4.81 2.75 2.75 0 0 0 1.94 1.95c1.71.46 7.64.46 7.64.46s5.93 0 7.64-.46a2.75 2.75 0 0 0 1.94-1.95c.46-1.58.46-4.81.46-4.81s0-3.23-.46-4.81zM10 15.11V8.89L15.4 12 10 15.11z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.34 0 .66.06.96.16V8.99a6.35 6.35 0 0 0-.96-.08A6.33 6.33 0 0 0 3.16 15.2a6.33 6.33 0 0 0 6.33 6.33 6.33 6.33 0 0 0 6.34-6.33V8.76a8.18 8.18 0 0 0 4.76 1.52V6.84c-.34 0-.67-.05-1-.15z" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    href: 'https://t.me',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.66 4.33 3.4 10.98c-1.18.47-1.17 1.13-.21 1.42l4.43 1.38 10.25-6.46c.48-.3.93-.14.56.19l-8.3 7.5-.31 4.62c.45 0 .65-.21.9-.45l2.17-2.11 4.51 3.33c.83.46 1.43.22 1.63-.77l2.96-13.94c.3-1.22-.46-1.77-1.33-1.36z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Snapchat',
    href: 'https://www.snapchat.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.5c-3.05 0-5.15 2.02-5.15 5.15 0 .92.18 2.04.26 2.75-.46.23-1.08.16-1.48-.05-.26-.14-.57-.05-.72.2-.14.25-.05.56.19.72.52.34 1.27.64 1.8.82-.28 1.54-1.47 2.86-3.15 3.43-.3.1-.49.4-.44.71.06.34.36.57.7.57.58.02 1.24.16 1.72.42.26.14.37.43.47.76.14.44.45.77.96.77.47 0 1-.16 1.56-.16.65 0 1.21.4 1.9.91.57.42 1.15.77 1.42.77s.85-.35 1.42-.77c.69-.51 1.25-.91 1.9-.91.56 0 1.09.16 1.56.16.51 0 .82-.33.96-.77.1-.33.21-.62.47-.76.48-.26 1.14-.4 1.72-.42.34 0 .64-.23.7-.57.05-.31-.14-.61-.44-.71-1.68-.57-2.87-1.89-3.15-3.43.53-.18 1.28-.48 1.8-.82.24-.16.33-.47.19-.72-.15-.25-.46-.34-.72-.2-.4.21-1.02.28-1.48.05.08-.71.26-1.83.26-2.75C17.15 4.52 15.05 2.5 12 2.5z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Likee',
    href: 'https://likee.video',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
];

export function Footer({ onNavigatePath, onResetHome }: FooterProps) {
  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigatePath(path);
  };

  return (
    <footer className="bg-white border-t border-[#E4E4E7] mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Social Icons */}
          <div className="md:col-span-8">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onResetHome();
              }}
              className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#0A0A0A] cursor-pointer"
            >
              <img
                src="/assets/aistudio/frame-ai_21e85880.svg"
                alt=""
                width={26}
                height={26}
                aria-hidden="true"
                className="w-6.5 h-6.5 shrink-0 object-contain"
              />
              <span>Qyopic</span>
            </a>
            <p className="mt-1 text-sm text-[#71717A]">
              Discover Beautiful Images.
            </p>

            {/* Social Media Icons Side-by-Side */}
            <div
              aria-label="Social media links"
              className="mt-5 flex flex-wrap items-center gap-2"
            >
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="inline-flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-lg border border-[#E4E4E7] bg-white text-[#52525B] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] active:bg-[#0A0A0A] active:text-white transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Stacked Footer Info Links (No "Navigation" label) */}
          <div className="md:col-span-4 md:justify-self-end">
            <div className="flex flex-col items-start gap-1 text-sm text-[#52525B]">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleLinkClick(e, link.path)}
                  className="min-h-[38px] inline-flex items-center hover:text-[#0A0A0A] hover:underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E4E4E7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#71717A]">
          <p>© {new Date().getFullYear()} Qyopic. All rights reserved.</p>
          <p>Curated AI-generated visuals &amp; licensed stock photography.</p>
        </div>
      </div>
    </footer>
  );
}
