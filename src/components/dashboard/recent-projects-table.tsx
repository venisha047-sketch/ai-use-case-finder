"use client";

import Link from "next/link";
import { formatRelativeTime, COMPANY_SIZE_LABELS } from "@/lib/utils";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { ProjectSummary } from "@/types";

interface RecentProjectsTableProps {
  projects: ProjectSummary[];
  isLoading: boolean;
}

export function RecentProjectsTable({
  projects,
  isLoading,
}: RecentProjectsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No projects yet. Create your first analysis to get started.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="group flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {project.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {project.industry} · {COMPANY_SIZE_LABELS[project.companySize]} ·{" "}
              {formatRelativeTime(project.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <ProjectStatusBadge status={project.status} />
            {project.latestAnalysis && (
              <span className="text-xs font-medium text-muted-foreground hidden sm:block">
                Impact: {Math.round(project.latestAnalysis.impactScore)}
              </span>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}
