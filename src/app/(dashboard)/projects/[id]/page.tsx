"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Pencil,
  Trash2,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { LoadingAnalysis } from "@/components/shared/loading-analysis";
import { ErrorState } from "@/components/shared/error-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, deleteProject } from "@/hooks/use-projects";
import { runAnalysis } from "@/hooks/use-analysis";
import { formatDate, COMPANY_SIZE_LABELS } from "@/lib/utils";
import type { RouteParams } from "@/types/api";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { project, isLoading, error, refetch } = useProject(id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRunAnalysis = async () => {
    if (!project) return;
    setIsAnalyzing(true);
    try {
      const analysis = await runAnalysis(project.id);
      toast.success("Analysis complete!", {
        description: "Your AI use case report is ready.",
      });
      router.push(`/analysis/${analysis.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed.";
      if (msg.includes("ANALYZING")) {
        toast.error("Analysis already running", {
          description: "Please wait for the current analysis to complete.",
        });
      } else if (msg.includes("limit")) {
        toast.error("Analysis limit reached", {
          description: "You have reached your hourly analysis limit.",
        });
      } else {
        toast.error("Analysis failed", { description: msg });
      }
    } finally {
      setIsAnalyzing(false);
      refetch();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(id);
      toast.success("Project deleted");
      router.push("/projects");
    } catch (err) {
      toast.error("Delete failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <ErrorState
        message={error ?? "Project not found."}
        onRetry={error ? refetch : undefined}
      />
    );
  }

  if (isAnalyzing) {
    return <LoadingAnalysis />;
  }

  const hasAnalysis = !!project.latestAnalysis;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Projects
          </Button>
        </Link>
      </div>

      <PageHeader
        title={project.title}
        description={`${project.industry} · ${project.department}`}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/projects/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        }
      />

      {/* Metadata card */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <ProjectStatusBadge status={project.status} />
          <span className="text-xs text-muted-foreground">
            {COMPANY_SIZE_LABELS[project.companySize]}
          </span>
          <span className="text-xs text-muted-foreground">
            Created {formatDate(project.createdAt)}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Problem Statement
            </p>
            <p className="text-sm leading-relaxed">{project.problemStatement}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Current Process
            </p>
            <p className="text-sm leading-relaxed">{project.processDescription}</p>
          </div>
        </div>
      </div>

      {/* Status alerts */}
      {project.status === "FAILED" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The last analysis failed. You can run a new analysis below.
          </AlertDescription>
        </Alert>
      )}

      {/* Analysis CTA / Link */}
      {hasAnalysis ? (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Latest Analysis</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generated {formatDate(project.latestAnalysis!.createdAt)} ·
                Impact score: {Math.round(project.latestAnalysis!.impactScore)}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/analysis/${project.latestAnalysis!.id}`}>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  View Report
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={handleRunAnalysis}
                disabled={project.status === "ANALYZING"}
                className="gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Re-analyze
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Ready to analyze</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Run an AI analysis to discover use cases, scores, and a
              90-day implementation roadmap.
            </p>
          </div>
          <Button onClick={handleRunAnalysis} className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            Run AI Analysis
          </Button>
          <p className="text-xs text-muted-foreground">
            Takes 30–90 seconds
          </p>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete project?"
        description={`"${project.title}" and all associated analyses will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete project"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
