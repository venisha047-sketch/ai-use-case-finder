import { FileText } from "lucide-react";
import {
  ROI_LEVEL_LABELS,
  ROI_LEVEL_COLORS,
  PRIORITY_RANK_LABELS,
  PRIORITY_RANK_COLORS,
  formatDate,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Analysis } from "@/types";

interface ExecutiveSummaryCardProps {
  analysis: Analysis;
}

export function ExecutiveSummaryCard({ analysis }: ExecutiveSummaryCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Executive Summary</h2>
            <p className="text-xs text-muted-foreground">
              Generated {formatDate(analysis.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
              ROI_LEVEL_COLORS[analysis.roiLevel]
            )}
          >
            {ROI_LEVEL_LABELS[analysis.roiLevel]}
          </span>
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
              PRIORITY_RANK_COLORS[analysis.priorityRank]
            )}
          >
            {PRIORITY_RANK_LABELS[analysis.priorityRank]}
          </span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {analysis.executiveSummary}
      </p>

      {analysis.roiRange && (
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <span className="text-xs text-muted-foreground">Estimated ROI Range:</span>
          <span className="text-xs font-medium">{analysis.roiRange}</span>
        </div>
      )}
    </div>
  );
}
