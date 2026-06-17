"use client";

import { getScoreColor, getScoreRingColor } from "@/lib/utils";

interface ScoreGaugeProps {
  label: string;
  value: number;
  description?: string;
}

export function ScoreGauge({ label, value, description }: ScoreGaugeProps) {
  const rounded = Math.round(value);
  const clampedValue = Math.min(100, Math.max(0, rounded));

  // SVG arc parameters
  const radius = 36;
  const cx = 48;
  const cy = 48;
  const circumference = 2 * Math.PI * radius;
  // Only use the bottom 75% of the circle (270°)
  const arcLength = circumference * 0.75;
  const offset = circumference * (1 - (clampedValue / 100) * 0.75);

  const ringClass = getScoreRingColor(clampedValue);
  const textClass = getScoreColor(clampedValue);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg width="96" height="80" viewBox="0 0 96 80">
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="7"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(135 ${cx} ${cy})`}
          />
          {/* Filled arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            className={`${ringClass} transition-all duration-700 ease-out`}
            strokeWidth="7"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(135 ${cx} ${cy})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pb-2">
          <span className={`text-xl font-bold tracking-tight ${textClass}`}>
            {clampedValue}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-[10px] text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
