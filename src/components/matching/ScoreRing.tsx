interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({ score, size = 40, strokeWidth = 3 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#10b981' : score >= 40 ? '#C9A84C' : '#6b7280';

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border/50"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-[9px] font-semibold"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
      >
        {score}
      </text>
    </svg>
  );
}
