import { Check, Copy, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { InfoModalType } from '@/src/types/image';

interface InfoModalProps {
  type: InfoModalType;
  onClose: () => void;
}

export function InfoModal({ type, onClose }: InfoModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(false);
    setCopiedEmail(false);
  }, [type]);

  useEffect(() => {
    if (!type) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [type, onClose]);

  if (!type) return null;

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

  const titles: Record<Exclude<InfoModalType, null>, string> = {
    about: 'About Qyopic',
    contact: 'Contact Us',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#0A0A0A]/70 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[88vh] overflow-y-auto bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7]">
          <h2
            id="info-modal-title"
            className="font-display text-lg font-bold text-[#0A0A0A]"
          >
            {titles[type]}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E4E4E7] text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 text-sm text-[#3F3F46] leading-relaxed space-y-4">
          {type === 'about' && (
            <>
              <p className="text-[#0A0A0A] font-medium">
                Qyopic — Discover Beautiful Images.
              </p>
              <p>
                Qyopic is an open visual discovery gallery showcasing curated AI-generated artwork alongside licensed high-resolution stock photography. Every image is organized cleanly by category so designers, writers, and creators can find the exact visual frame they need without account walls or clutter.
              </p>
              <p>
                All media entries are loaded from a structured JSON catalog designed for instant edge delivery via Cloudflare R2 public object URLs.
              </p>
            </>
          )}

          {type === 'contact' && (
            <>
              <p>
                Have a licensing question, creator submission inquiry, or technical feedback? Reach our editorial team directly.
              </p>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                <div>
                  <p className="text-xs text-[#71717A]">Direct Email</p>
                  <p className="font-mono text-sm text-[#0A0A0A]">
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

              {submitted ? (
                <div className="p-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] text-[#0A0A0A]">
                  <p className="font-medium">Message prepared</p>
                  <p className="mt-1 text-xs text-[#52525B]">
                    Thank you for reaching out to Qyopic. You can also email hello@qyopic.com directly at any time.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3 pt-1">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-[#0A0A0A] mb-1"
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
                      className="w-full h-10 px-3 rounded-lg border border-[#D4D4D8] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-[#0A0A0A] mb-1"
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
                      className="w-full h-10 px-3 rounded-lg border border-[#D4D4D8] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium text-[#0A0A0A] mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      className="w-full p-3 rounded-lg border border-[#D4D4D8] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-10 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#27272A] transition-colors cursor-pointer"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </>
          )}

          {type === 'privacy' && (
            <>
              <p>
                Qyopic is built for frictionless image discovery with zero user accounts, zero signups, and zero personal tracking profiles.
              </p>
              <p>
                We do not store personal user data, login credentials, or search histories on any database. All category filtering and keyword searches run directly in your browser.
              </p>
              <p>
                When image assets are served via Cloudflare R2 public URLs, standard edge caching headers apply solely to deliver fast image downloads.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                All images published on Qyopic—both AI-generated visuals and licensed stock photographs—are curated for free personal and commercial creative use.
              </p>
              <p>
                You may download, adapt, and embed images in websites, presentations, editorial articles, and design projects without attribution, though crediting the listed creator is always appreciated.
              </p>
              <p>
                Redistributing or reselling unmodified Qyopic image files as a standalone stock repository is not permitted.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
