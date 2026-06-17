import { ScoreGauge } from "./score-gauge";
import type { Analysis } from "@/types";

interface ScoreGridProps {
  analysis: Analysis;
}

export function ScoreGrid({ analysis }: ScoreGridProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold mb-4">Scores</h2>
      <div className="grid grid-cols-3 gap-4 divide-x divide-border">
        <ScoreGauge
          label="Feasibility"
          value={analysis.feasibilityScore}
          description="How achievable"
        />
        <ScoreGauge
          label="Impact"
          value={analysis.impactScore}
          description="Business value"
        />
        <ScoreGauge
          label="Complexity"
          value={analysis.complexityScore}
          description="Implementation effort"
        />
      </div>
    </div>
  );
}
