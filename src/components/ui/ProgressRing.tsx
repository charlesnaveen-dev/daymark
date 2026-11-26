import { motion } from 'framer-motion';

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}

export function ProgressRing({
  percent,
  size = 168,
  strokeWidth = 12,
  label,
  sublabel,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const isComplete = percent >= 100;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-subtle)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? 'var(--success)' : 'var(--accent-primary)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="tabular-nums text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {label}
        </span>
        {sublabel && (
          <span className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
