"use client";

import { useState, useEffect, useCallback } from "react";
import type { Analysis } from "@/types";
import type { GetAnalysisResponse, CreateAnalysisResponse } from "@/types/api";

interface UseAnalysisResult {
  analysis: Analysis | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnalysis(id: string | null): UseAnalysisResult {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analysis/${id}`);
      const json: GetAnalysisResponse = await res.json();
      if (json.success) {
        setAnalysis(json.data);
      } else {
        setError(json.error.message);
      }
    } catch {
      setError("Failed to load analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return { analysis, isLoading, error, refetch: fetchAnalysis };
}

export async function runAnalysis(projectId: string): Promise<Analysis> {
  const res = await fetch("/api/analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
  const json: CreateAnalysisResponse = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}
