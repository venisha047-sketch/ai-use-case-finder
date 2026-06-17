"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectForm } from "@/components/projects/project-form";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, updateProject } from "@/hooks/use-projects";
import type { CreateProjectInput } from "@/lib/validations";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { project, isLoading, error, refetch } = useProject(id);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (data: CreateProjectInput) => {
    setIsSaving(true);
    try {
      await updateProject(id, data);
      toast.success("Project updated");
      router.push(`/projects/${id}`);
    } catch (err) {
      toast.error("Update failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error || !project) {
    return <ErrorState message={error ?? "Project not found."} onRetry={refetch} />;
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
        title="Edit Project"
        description="Update project details to get more accurate analysis results."
      />

      <div className="bg-card border border-border rounded-xl p-6">
        <ProjectForm
          defaultValues={{
            title: project.title,
            industry: project.industry,
            department: project.department,
            companySize: project.companySize,
            problemStatement: project.problemStatement,
            processDescription: project.processDescription,
          }}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
