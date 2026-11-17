interface AdContainerProps {
  slotId: string;
  variant?: 'banner' | 'rectangle';
  label?: string;
}

/**
 * Reusable advertisement slot container for Stock pages.
 * Replace the inner placeholder markup with your Google AdSense (<ins class="adsbygoogle">)
 * or custom sponsor banner script when going live.
 */
export function AdContainer({
  slotId,
  variant = 'banner',
  label = 'Advertisement',
}: AdContainerProps) {
  const isRectangle = variant === 'rectangle';

  return (
    <aside
      aria-label={`${label} (${slotId})`}
      data-ad-slot={slotId}
      className={`w-full rounded-xl border border-dashed border-[#D4D4D8] bg-[#FAFAFA] flex flex-col items-center justify-center text-center px-4 py-5 ${
        isRectangle ? 'min-h-[250px]' : 'min-h-[96px]'
      }`}
    >
      <span className="text-[11px] font-medium tracking-wider uppercase text-[#71717A]">
        {label}
      </span>
      <p className="mt-1 text-xs text-[#A1A1AA] font-mono">
        {isRectangle
          ? 'Responsive Ad Space · 300×250'
          : 'Responsive Ad Space · 728×90'}
      </p>
    </aside>
  );
}
