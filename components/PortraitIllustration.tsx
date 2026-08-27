// Abstract silhouette stand-in for a founder/estate portrait -- deliberately
// not a specific likeness, since no real photo exists yet.
export function PortraitIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="400" fill="#EFE6D0" />
      <path
        d="M0 260 C 80 235,180 255,260 230 C 320 212,360 228,400 218 L400 400 L0 400 Z"
        fill="#8FA07C"
        opacity={0.5}
      />
      <path
        d="M0 300 C 100 278,220 298,320 272 C 355 262,380 272,400 264 L400 400 L0 400 Z"
        fill="#5F7350"
        opacity={0.75}
      />
      <rect x="150" y="150" width="140" height="170" fill="#3D3427" />
      <path d="M150 150 L220 100 L290 150 Z" fill="#2B241C" />
      <rect x="192" y="200" width="56" height="120" fill="#EFE6D0" />
      <path
        d="M205 320 L205 250 C205 230 235 230 235 250 L235 320 Z"
        fill="#2B241C"
        opacity={0.85}
      />
      <circle cx="220" cy="222" r="14" fill="#2B241C" opacity={0.85} />
      <circle cx="90" cy="80" r="28" fill="#C89A3E" opacity={0.8} />
    </svg>
  );
}
