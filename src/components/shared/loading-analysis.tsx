"use client";

import { useEffect, useState } from "react";
import { Loader2, Brain, Sparkles, BarChart3 } from "lucide-react";

const STEPS = [
  { icon: Brain, label: "Analyzing your business context…" },
  { icon: Sparkles, label: "Identifying AI opportunities…" },
  { icon: BarChart3, label: "Scoring feasibility and impact…" },
  { icon: Loader2, label: "Generating roadmap and recommendations…" },
];

export function LoadingAnalysis() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 gap-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <CurrentIcon className="h-9 w-9 text-primary" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Running AI Analysis</h3>
        <p className="text-sm text-muted-foreground animate-in fade-in key={step}">
          {STEPS[step].label}
        </p>
        <p className="text-xs text-muted-foreground">
          This may take 30–90 seconds
        </p>
      </div>
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === step
                ? "w-6 bg-primary"
                : i < step
                ? "w-3 bg-primary/40"
                : "w-3 bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
