import {
  FolderOpen,
  BarChart3,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/types";
import { formatScore } from "@/lib/utils";

interface StatsStripProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const STAT_CARDS = (stats: DashboardStats) => [
  {
    label: "Total Projects",
    value: stats.totalProjects.toString(),
    sub: `${stats.totalAnalyses} analyses run`,
    icon: FolderOpen,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    label: "Avg Feasibility",
    value: `${formatScore(stats.avgFeasibilityScore)}`,
    sub: "out of 100",
    icon: BarChart3,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Avg Impact Score",
    value: `${formatScore(stats.avgImpactScore)}`,
    sub: "out of 100",
    icon: TrendingUp,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "High ROI Projects",
    value: stats.roiDistribution.high.toString(),
    sub: `${stats.roiDistribution.medium} medium, ${stats.roiDistribution.low} low`,
    icon: Zap,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

export function StatsStrip({ stats, isLoading }: StatsStripProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = STAT_CARDS(stats);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
        <div
          key={label}
          className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}
            >
              <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
