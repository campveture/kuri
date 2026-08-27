type PouchIllustrationProps = {
  color: string;
  colorDark: string;
  className?: string;
  showLabel?: boolean;
};

export function PouchIllustration({
  color,
  colorDark,
  className,
  showLabel = false,
}: PouchIllustrationProps) {
  return (
    <svg viewBox="0 0 200 260" className={className} role="img" aria-label="Tea pouch">
      <path
        d="M40 40 Q40 20 60 20 L140 20 Q160 20 160 40 L170 220 Q170 240 150 240 L50 240 Q30 240 30 220 Z"
        fill={color}
      />
      <path d="M30 40 L10 62 L10 218 Q10 240 30 240" fill={colorDark} opacity={0.9} />
      <rect x="52" y="120" width="96" height="66" rx="3" fill="#F7F2E6" />
      {showLabel ? (
        <>
          <text
            x="100"
            y="150"
            textAnchor="middle"
            fontFamily="Newsreader, serif"
            fontSize="17"
            fontWeight="600"
            fill="#2B241C"
          >
            KURI
          </text>
          <line x1="64" y1="160" x2="136" y2="160" stroke="#2B241C" strokeWidth="1" opacity={0.5} />
        </>
      ) : (
        <>
          <line x1="64" y1="140" x2="136" y2="140" stroke="#2B241C" strokeWidth="1" />
          <line x1="64" y1="150" x2="136" y2="150" stroke="#2B241C" strokeWidth="1" opacity={0.55} />
        </>
      )}
    </svg>
  );
}
