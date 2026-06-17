"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/use-projects";
import {
  formatDate,
  ROI_LEVEL_LABELS,
  ROI_LEVEL_COLORS,
  PRIORITY_RANK_LABELS,
  PRIORITY_RANK_COLORS,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ProjectHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { project, isLoading, error, refetch } = useProject(id);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  if (error || !project) {
    return <ErrorState message={error ?? "Project not found."} onRetry={refetch} />;
  }

  const analysis = project.latestAnalysis;

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

      {!analysis ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No analysis history yet. Run your first analysis from the project page.
          </p>
          <Link href={`/projects/${id}`} className="mt-4 inline-block">
            <Button size="sm" variant="outline">Go to project</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Latest Analysis
          </p>
          <Link href={`/analysis/${analysis.id}`}>
            <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                      Analysis Report
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(analysis.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", ROI_LEVEL_COLORS[analysis.roiLevel])}>
                    {ROI_LEVEL_LABELS[analysis.roiLevel]}
                  </span>
                  <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", PRIORITY_RANK_COLORS[analysis.priorityRank])}>
                    {PRIORITY_RANK_LABELS[analysis.priorityRank]}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mt-3 pt-3 border-t border-border">
                {[
                  { label: "Feasibility", value: analysis.feasibilityScore },
                  { label: "Impact", value: analysis.impactScore },
                  { label: "Complexity", value: analysis.complexityScore },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <div className="text-lg font-bold">{Math.round(value)}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
