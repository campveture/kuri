type IconProps = { size?: number };

const stroke = {
  fill: "none" as const,
  stroke: "#2B241C",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PluckIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 3c3 3 3 8 0 11-3-3-3-8 0-11z" />
      <path d="M12 14v7" />
    </svg>
  );
}

export function WitherIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M4 20C4 10 12 4 20 4c0 8-6 16-16 16z" />
      <path d="M8 17c3-2 6-5 8-9" />
    </svg>
  );
}

export function RollIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 3c4 0 7 3 7 6s-3 5-6 5-4-1.5-4-3.5S10.5 7 13 7" />
    </svg>
  );
}

export function OxidiseIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v8l6 3" fill="none" />
    </svg>
  );
}

export function DryIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  );
}
