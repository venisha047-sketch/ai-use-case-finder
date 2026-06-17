"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardStats } from "@/types";
import type { GetDashboardStatsResponse } from "@/types/api";

interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/stats");
      const json: GetDashboardStatsResponse = await res.json();
      if (json.success) {
        setStats(json.data);
      } else {
        setError(json.error.message);
      }
    } catch {
      setError("Failed to load dashboard stats.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}
