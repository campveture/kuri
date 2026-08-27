type IconProps = { className?: string; size?: number };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SearchIcon({ className, size = 19 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.2" y2="16.2" />
    </svg>
  );
}

export function AccountIcon({ className, size = 19 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.4-4 4-6 7.5-6s6.1 2 7.5 6" />
    </svg>
  );
}

export function BagIcon({ className, size = 19 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function ChevronDownIcon({ className, size = 10 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ArrowRightIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function LeafQuoteIcon({ className, size = 30 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} stroke="#C89A3E" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20C4 10 12 4 20 4c0 8-6 16-16 16z" />
      <path d="M4 20c4-6 8-9 12-12" />
    </svg>
  );
}

export function CloseIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function MenuIcon({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} stroke="currentColor" fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}
