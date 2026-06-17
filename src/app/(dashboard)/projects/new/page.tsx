"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectForm } from "@/components/projects/project-form";
import { createProject } from "@/hooks/use-projects";
import type { CreateProjectInput } from "@/lib/validations";
import { useState } from "react";

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateProjectInput) => {
    setIsLoading(true);
    try {
      const project = await createProject(data);
      toast.success("Project created", {
        description: "Your project is ready. Run an analysis to get started.",
      });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      toast.error("Failed to create project", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="New Analysis"
        description="Describe your business challenge to get AI-powered use case recommendations."
      />

      <div className="bg-card border border-border rounded-xl p-6">
        <ProjectForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Project"
        />
      </div>
    </div>
  );
}
