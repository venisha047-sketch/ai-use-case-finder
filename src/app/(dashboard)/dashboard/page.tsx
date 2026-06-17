"use client";

import Link from "next/link";
import { PlusCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatsStrip } from "@/components/dashboard/stats-strip";
import { TrendLineChart } from "@/components/dashboard/trend-line-chart";
import { ROIDistributionChart } from "@/components/dashboard/roi-distribution-chart";
import { RecentProjectsTable } from "@/components/dashboard/recent-projects-table";
import { ErrorState } from "@/components/shared/error-state";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

export default function DashboardPage() {
  const { stats, isLoading, error, refetch } = useDashboardStats();

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your AI use case analyses"
        action={
          <Link href="/projects/new">
            <Button size="sm" className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        }
      />

      <StatsStrip stats={stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Score trend chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Score Trends</h2>
              <p className="text-xs text-muted-foreground">
                Average scores across all analyses over time
              </p>
            </div>
          </div>
          <TrendLineChart
            data={stats?.scoreTrend ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* ROI distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">ROI Distribution</h2>
            <p className="text-xs text-muted-foreground">
              Projects by estimated ROI level
            </p>
          </div>
          {stats && (
            <ROIDistributionChart distribution={stats.roiDistribution} />
          )}
        </div>
      </div>

      {/* Recent projects */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold">Recent Projects</h2>
            <p className="text-xs text-muted-foreground">
              Your most recently created analyses
            </p>
          </div>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <RecentProjectsTable
          projects={stats?.recentProjects ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
