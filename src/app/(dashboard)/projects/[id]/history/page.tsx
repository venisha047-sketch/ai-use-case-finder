"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, useProjectAnalyses } from "@/hooks/use-projects";
import {
  formatDate,
  ROI_LEVEL_LABELS,
  ROI_LEVEL_COLORS,
  PRIORITY_RANK_LABELS,
  PRIORITY_RANK_COLORS,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AnalysisSummary } from "@/types";

// Re-use the summary shape from the full Analysis type
type HistoryEntry = Pick<
  import("@/types").Analysis,
  | "id"
  | "feasibilityScore"
  | "impactScore"
  | "complexityScore"
  | "roiLevel"
  | "priorityRank"
  | "roiRange"
  | "createdAt"
>;

function AnalysisRow({ entry, index, total }: { entry: HistoryEntry; index: number; total: number }) {
  const isLatest = index === 0;
  return (
    <Link href={`/analysis/${entry.id}`}>
      <div className={cn(
        "bg-card border rounded-xl p-4 hover:border-primary/40 transition-colors group",
        isLatest ? "border-primary/30" : "border-border"
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              isLatest ? "bg-primary/10" : "bg-muted"
            )}>
              <BarChart3 className={cn("h-4 w-4", isLatest ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                  Analysis #{total - index}
                </p>
                {isLatest && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Latest
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                {formatDate(entry.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", ROI_LEVEL_COLORS[entry.roiLevel])}>
              {ROI_LEVEL_LABELS[entry.roiLevel]}
            </span>
            <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", PRIORITY_RANK_COLORS[entry.priorityRank])}>
              {PRIORITY_RANK_LABELS[entry.priorityRank]}
            </span>
          </div>
        </div>

        <div className="flex gap-6 mt-3 pt-3 border-t border-border">
          {[
            { label: "Feasibility", value: entry.feasibilityScore },
            { label: "Impact", value: entry.impactScore },
            { label: "Complexity", value: entry.complexityScore },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-lg font-bold">{Math.round(value)}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
          <div className="text-center ml-auto">
            <div className="text-sm font-semibold">{entry.roiRange}</div>
            <div className="text-xs text-muted-foreground">ROI Range</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProjectHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { project, isLoading: projectLoading, error: projectError, refetch: refetchProject } = useProject(id);
  const { analyses, isLoading: analysesLoading, error: analysesError, refetch: refetchAnalyses } = useProjectAnalyses(id);

  const isLoading = projectLoading || analysesLoading;
  const error = projectError || analysesError;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <ErrorState
        message={error ?? "Project not found."}
        onRetry={() => { refetchProject(); refetchAnalyses(); }}
      />
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Link href={`/projects/${id}`}>
        <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to project
        </Button>
      </Link>

      <PageHeader
        title="Analysis History"
        description={project.title}
      />

      {analyses.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
            <Hash className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No analyses yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Run your first AI analysis from the project page to see results here.
          </p>
          <Link href={`/projects/${id}`}>
            <Button size="sm" variant="outline">Go to project</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">
            {analyses.length} {analyses.length === 1 ? "analysis" : "analyses"} — newest first
          </p>
          {analyses.map((entry, index) => (
            <AnalysisRow
              key={entry.id}
              entry={entry}
              index={index}
              total={analyses.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
