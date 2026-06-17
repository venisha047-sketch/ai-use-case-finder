"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";
import type { Analysis } from "@/types";

interface ScoreRadarChartProps {
  analysis: Analysis;
}

export function ScoreRadarChart({ analysis }: ScoreRadarChartProps) {
  const data = [
    { subject: "Feasibility", value: analysis.feasibilityScore },
    { subject: "Impact", value: analysis.impactScore },
    { subject: "Complexity", value: analysis.complexityScore },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
        />
        <Radar
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value) => [Math.round(Number(value)), "Score"] as [number, string]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
