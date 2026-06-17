"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ExecutiveSummaryCard } from "@/components/analysis/executive-summary-card";
import { ScoreGrid } from "@/components/analysis/score-grid";
import { ScoreRadarChart } from "@/components/analysis/score-radar-chart";
import { UseCaseList } from "@/components/analysis/use-case-list";
import { RoadmapTimeline } from "@/components/analysis/roadmap-timeline";
import { ROIBarChart } from "@/components/analysis/roi-bar-chart";
import { TechStackSuggestions } from "@/components/analysis/tech-stack-suggestions";
import { ExportButton } from "@/components/analysis/export-button";
import { ErrorState } from "@/components/shared/error-state";
import { useAnalysis } from "@/hooks/use-analysis";
import { useProject } from "@/hooks/use-projects";

function AnalysisSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { analysis, isLoading, error, refetch } = useAnalysis(id);
  const { project } = useProject(analysis?.projectId ?? null);

  if (isLoading) return <AnalysisSkeleton />;

  if (error || !analysis) {
    return (
      <ErrorState
        message={error ?? "Analysis not found."}
        onRetry={error ? refetch : undefined}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        {project && (
          <Link href={`/projects/${analysis.projectId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 -ml-2 text-muted-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {project.title}
            </Button>
          </Link>
        )}
      </div>

      <PageHeader
        title="Analysis Report"
        description={project ? `${project.industry} · ${project.department}` : undefined}
        action={
          <div className="flex gap-2">
            <ExportButton
              analysisId={analysis.id}
              projectTitle={project?.title}
            />
            {project && (
              <Link href={`/projects/${analysis.projectId}`}>
                <Button size="sm" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Re-analyze
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Executive Summary */}
      <ExecutiveSummaryCard analysis={analysis} />

      {/* Score overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ScoreGrid analysis={analysis} />
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-1">Score Overview</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Composite radar view
          </p>
          <ScoreRadarChart analysis={analysis} />
        </div>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="use-cases" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="use-cases" className="text-xs sm:text-sm">
            Use Cases
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs sm:text-sm">
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="tech" className="text-xs sm:text-sm">
            Tech Stack
          </TabsTrigger>
          <TabsTrigger value="charts" className="text-xs sm:text-sm">
            Charts
          </TabsTrigger>
        </TabsList>

        {/* Use Cases Tab */}
        <TabsContent value="use-cases" className="mt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  Recommended AI Use Cases
                </h2>
                <p className="text-xs text-muted-foreground">
                  {analysis.recommendations.length} use case
                  {analysis.recommendations.length !== 1 ? "s" : ""} identified
                  · ranked by priority
                </p>
              </div>
            </div>
            <UseCaseList useCases={analysis.recommendations} />
          </div>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="mb-5">
              <h2 className="text-sm font-semibold">Implementation Roadmap</h2>
              <p className="text-xs text-muted-foreground">
                Structured 30-60-90 day implementation plan
              </p>
            </div>
            <RoadmapTimeline roadmap={analysis.roadmap} />
          </div>
        </TabsContent>

        {/* Tech Stack Tab */}
        <TabsContent value="tech" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="mb-5">
              <h2 className="text-sm font-semibold">
                Technology Recommendations
              </h2>
              <p className="text-xs text-muted-foreground">
                Curated tools organized by implementation tier
              </p>
            </div>
            <TechStackSuggestions
              recommendations={analysis.techRecommendations}
            />
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="mt-4">
          <div className="space-y-5">
            {analysis.recommendations.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold">
                    Use Case Score Comparison
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Feasibility, impact & complexity by use case
                  </p>
                </div>
                <ROIBarChart useCases={analysis.recommendations} />

                {/* Legend */}
                <div className="flex gap-4 text-xs mt-2">
                  {[
                    { label: "Feasibility", color: "#6366f1" },
                    { label: "Impact", color: "#10b981" },
                    { label: "Complexity", color: "#f59e0b" },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Token usage — dev detail */}
            {(analysis.promptTokens != null ||
              analysis.completionTokens != null) && (
              <div className="bg-muted/30 border border-border rounded-xl p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Token Usage
                </p>
                <div className="flex gap-4 text-xs">
                  <span>
                    Prompt:{" "}
                    <span className="font-medium">
                      {analysis.promptTokens?.toLocaleString() ?? "—"}
                    </span>
                  </span>
                  <span>
                    Completion:{" "}
                    <span className="font-medium">
                      {analysis.completionTokens?.toLocaleString() ?? "—"}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
