"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import type { UseCase } from "@/types";

interface ROIBarChartProps {
  useCases: UseCase[];
}

export function ROIBarChart({ useCases }: ROIBarChartProps) {
  const data = useCases.slice(0, 8).map((uc) => ({
    name: uc.title.length > 24 ? uc.title.slice(0, 24) + "…" : uc.title,
    feasibility: Math.round(uc.feasibility),
    impact: Math.round(uc.impact),
    complexity: Math.round(uc.complexity),
  }));

  const COLORS = {
    feasibility: "#6366f1",
    impact: "#10b981",
    complexity: "#f59e0b",
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
        barSize={6}
        barGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value, name) => [
            Number(value),
            String(name).charAt(0).toUpperCase() + String(name).slice(1),
          ] as [number, string]}
        />
        <Bar dataKey="feasibility" fill={COLORS.feasibility} radius={[0, 3, 3, 0]} />
        <Bar dataKey="impact" fill={COLORS.impact} radius={[0, 3, 3, 0]} />
        <Bar dataKey="complexity" fill={COLORS.complexity} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
