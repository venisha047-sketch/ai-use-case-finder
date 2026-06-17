"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import type { DashboardStats } from "@/types";

interface ROIDistributionChartProps {
  distribution: DashboardStats["roiDistribution"];
}

const DATA = (dist: DashboardStats["roiDistribution"]) => [
  { name: "High", value: dist.high, color: "#10b981" },
  { name: "Medium", value: dist.medium, color: "#f59e0b" },
  { name: "Low", value: dist.low, color: "#94a3b8" },
];

export function ROIDistributionChart({ distribution }: ROIDistributionChartProps) {
  const data = DATA(distribution);
  const total = distribution.high + distribution.medium + distribution.low;

  if (total === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        No analyses yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barSize={36} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [Number(value), "Projects"] as [number, string]}
            cursor={{ fill: "hsl(var(--muted))" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-xs">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-muted-foreground">
              {name}:{" "}
              <span className="font-medium text-foreground">{value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
