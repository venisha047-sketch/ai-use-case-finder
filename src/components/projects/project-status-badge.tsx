import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/utils";
import type { ProjectStatus } from "@/types";
import { Loader2 } from "lucide-react";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  PENDING: "bg-slate-100 text-slate-600 border-slate-200",
  ANALYZING: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {status === "ANALYZING" && (
        <Loader2 className="h-3 w-3 animate-spin" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}
