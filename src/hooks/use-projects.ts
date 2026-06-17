"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Project,
  ProjectSummary,
  ProjectWithLatestAnalysis,
  PaginatedResult,
} from "@/types";
import type {
  CreateProjectBody,
  GetProjectsQuery,
  GetProjectsResponse,
  GetProjectResponse,
  CreateProjectResponse,
  UpdateProjectBody,
  UpdateProjectResponse,
  DeleteProjectResponse,
} from "@/types/api";

interface UseProjectsResult {
  data: PaginatedResult<ProjectSummary> | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProjects(query?: GetProjectsQuery): UseProjectsResult {
  const [data, setData] = useState<PaginatedResult<ProjectSummary> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query?.page) params.set("page", String(query.page));
      if (query?.pageSize) params.set("pageSize", String(query.pageSize));
      if (query?.industry) params.set("industry", query.industry);
      if (query?.status) params.set("status", query.status);
      if (query?.search) params.set("search", query.search);

      const res = await fetch(`/api/projects?${params.toString()}`);
      const json: GetProjectsResponse = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error.message);
      }
    } catch {
      setError("Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, [query?.page, query?.pageSize, query?.industry, query?.status, query?.search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { data, isLoading, error, refetch: fetchProjects };
}

interface UseProjectResult {
  project: ProjectWithLatestAnalysis | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProject(id: string | null): UseProjectResult {
  const [project, setProject] = useState<ProjectWithLatestAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${id}`);
      const json: GetProjectResponse = await res.json();
      if (json.success) {
        setProject(json.data);
      } else {
        setError(json.error.message);
      }
    } catch {
      setError("Failed to load project.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, isLoading, error, refetch: fetchProject };
}

export async function createProject(body: CreateProjectBody): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json: CreateProjectResponse = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

export async function updateProject(
  id: string,
  body: UpdateProjectBody
): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json: UpdateProjectResponse = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  const json: DeleteProjectResponse = await res.json();
  if (!json.success) throw new Error(json.error.message);
}
