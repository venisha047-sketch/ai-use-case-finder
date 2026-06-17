import Link from "next/link";
import { ChevronRight, Calendar, Building2, Layers } from "lucide-react";
import { formatRelativeTime, COMPANY_SIZE_LABELS, ROI_LEVEL_LABELS, ROI_LEVEL_COLORS } from "@/lib/utils";
import { ProjectStatusBadge } from "./project-status-badge";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "@/types";

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const score = project.latestAnalysis;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {project.department}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ProjectStatusBadge status={project.status} />
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {project.industry}
        </span>
        <span className="flex items-center gap-1">
          <Layers className="h-3 w-3" />
          {COMPANY_SIZE_LABELS[project.companySize]}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatRelativeTime(project.createdAt)}
        </span>
      </div>

      {score && (
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          {[
            { label: "Feasibility", value: score.feasibilityScore },
            { label: "Impact", value: score.impactScore },
            { label: "Complexity", value: score.complexityScore },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 text-center">
              <div className="text-sm font-semibold">{Math.round(value)}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
          <div className="flex-1 text-center">
            <span
              className={cn(
                "inline-block rounded-full border px-2 py-0.5 text-xs font-medium",
                ROI_LEVEL_COLORS[score.roiLevel]
              )}
            >
              {ROI_LEVEL_LABELS[score.roiLevel]}
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}
