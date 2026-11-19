import { ArrowLeft, Check, Copy } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { InfoModalType } from '@/src/types/image';

type StaticPageKind = Exclude<InfoModalType, null>;

interface StaticPageProps {
  page: StaticPageKind;
  onBackHome: () => void;
}

const PAGE_TITLES: Record<StaticPageKind, string> = {
  about: 'About Qyopic',
  contact: 'Contact Us',
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
};

const PAGE_SUBTITLES: Record<StaticPageKind, string> = {
  about: 'Discover Beautiful Images — without friction or clutter.',
  contact: 'Reach the Qyopic editorial and licensing team.',
  privacy: 'Transparent data practices with zero accounts and zero tracking.',
  terms: 'Clear licensing terms for personal and commercial creative work.',
};

export function StaticPage({ page, onBackHome }: StaticPageProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setCopiedEmail(false);
    setSubmitted(false);
  }, [page]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@qyopic.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[66px] sm:pt-[74px] pb-8 sm:pb-12">
      <div className="fixed top-[74px] sm:top-[82px] left-0 right-0 z-20 pointer-events-none px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={onBackHome}
            className="pointer-events-auto inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#E4E4E7] bg-white/95 backdrop-blur-sm text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] active:bg-[#E4E4E7] transition-colors cursor-pointer shadow-none"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Gallery</span>
          </button>
        </div>
      </div>

      <div className="pb-6 border-b border-[#E4E4E7]">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A]">
          {PAGE_TITLES[page]}
        </h1>
        <p className="mt-2 text-base text-[#52525B]">{PAGE_SUBTITLES[page]}</p>
      </div>

      <div className="mt-8 text-sm sm:text-base text-[#3F3F46] leading-relaxed space-y-6">
        {page === 'about' && (
          <>
            <p>
              Qyopic is an open visual discovery platform built to showcase curated AI-generated artwork alongside licensed high-resolution stock photography. Every image is organized by clear categories so designers, writers, developers, and creative teams can browse and download visuals quickly without login walls.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                <h2 className="font-display text-base font-semibold text-[#0A0A0A]">
                  Zero Friction
                </h2>
                <p className="mt-1.5 text-sm text-[#52525B]">
                  No signup, no accounts, and no subscriptions required to browse or download.
                </p>
              </div>
              <div className="p-5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                <h2 className="font-display text-base font-semibold text-[#0A0A0A]">
                  Curated Quality
                </h2>
                <p className="mt-1.5 text-sm text-[#52525B]">
                  Every photograph and generative study is inspected for resolution, composition, and tone.
                </p>
              </div>
              <div className="p-5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                <h2 className="font-display text-base font-semibold text-[#0A0A0A]">
                  Edge Delivery
                </h2>
                <p className="mt-1.5 text-sm text-[#52525B]">
                  Fast global image delivery powered by Cloudinary CDN and Cloudflare edge routing.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-xl border border-[#E4E4E7] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#71717A]">
                  Creator &amp; Developer
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-[#0A0A0A]">
                  MD Robin Mia
                </h2>
                <p className="mt-0.5 text-sm text-[#52525B]">
                  Founder &amp; creator of Qyopic
                </p>
              </div>
              <a
                href="https://www.facebook.com/mdrobinmia0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] text-sm font-medium text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] transition-colors shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 21v-8.2h2.75l.41-3.2H13.5V7.56c0-.93.26-1.56 1.59-1.56h1.7V3.14c-.3-.04-1.31-.14-2.49-.14-2.46 0-4.15 1.5-4.15 4.26V9.6H7.35v3.2h2.8V21h3.35z" />
                </svg>
                <span>facebook.com/mdrobinmia0</span>
              </a>
            </div>
          </>
        )}

        {page === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-4">
              <p>
                Have a licensing question, creator submission inquiry, or technical feedback? Reach our editorial team directly via email or the contact form.
              </p>

              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                <div>
                  <p className="text-xs text-[#71717A]">Direct Email</p>
                  <p className="font-mono text-sm text-[#0A0A0A] mt-0.5">
                    hello@qyopic.com
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#E4E4E7] bg-white text-xs font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="md:col-span-7">
              {submitted ? (
                <div className="p-6 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] text-[#0A0A0A]">
                  <h2 className="font-display text-lg font-semibold">
                    Message received
                  </h2>
                  <p className="mt-1.5 text-sm text-[#52525B]">
                    Thank you for contacting Qyopic. You can also email hello@qyopic.com directly at any time.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-4 inline-flex items-center justify-center h-9 px-4 rounded-lg border border-[#E4E4E7] bg-white text-xs font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleContactSubmit}
                  className="p-6 rounded-2xl border border-[#E4E4E7] bg-white space-y-4"
                >
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#D4D4D8] text-base sm:text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#D4D4D8] text-base sm:text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      className="w-full p-3.5 rounded-lg border border-[#D4D4D8] text-base sm:text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#27272A] transition-colors cursor-pointer"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {page === 'privacy' && (
          <div className="space-y-5">
            <section>
              <h2 className="font-display text-lg font-semibold text-[#0A0A0A]">
                1. No User Accounts or Personal Profiles
              </h2>
              <p className="mt-2">
                Qyopic is built for frictionless image discovery with zero user accounts, zero signups, and zero personal tracking profiles. We do not collect names, passwords, or private browsing histories.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-semibold text-[#0A0A0A]">
                2. Client-Side Search &amp; Filtering
              </h2>
              <p className="mt-2">
                All keyword searches and category filters run directly in your browser without sending personal queries to a user database.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-semibold text-[#0A0A0A]">
                3. Edge Media Delivery &amp; Advertising
              </h2>
              <p className="mt-2">
                Static assets and images served via Cloudflare Pages and Cloudflare R2 use standard CDN delivery headers. Stock download pages may display third-party advertisements subject to their respective privacy disclosures.
              </p>
            </section>
          </div>
        )}

        {page === 'terms' && (
          <div className="space-y-5">
            <section>
              <h2 className="font-display text-lg font-semibold text-[#0A0A0A]">
                1. Permitted Creative Use
              </h2>
              <p className="mt-2">
                All images published on Qyopic—both AI-generated visuals and licensed stock photographs—are curated for free personal and commercial creative use across websites, editorial layouts, presentations, and digital products.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-semibold text-[#0A0A0A]">
                2. Attribution
              </h2>
              <p className="mt-2">
                Attribution is not legally required, though crediting the listed creator or Qyopic is always appreciated when possible.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-semibold text-[#0A0A0A]">
                3. Restrictions
              </h2>
              <p className="mt-2">
                Redistributing, scraping, or reselling unmodified Qyopic image files as a standalone stock image repository or competing gallery feed is not permitted.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
