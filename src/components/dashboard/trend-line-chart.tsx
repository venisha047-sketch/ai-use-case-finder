"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScoreTrendPoint } from "@/types";

interface TrendLineChartProps {
  data: ScoreTrendPoint[];
  isLoading?: boolean;
}

const COLORS = {
  feasibility: "#6366f1",
  impact: "#10b981",
  complexity: "#f59e0b",
};

export function TrendLineChart({ data, isLoading }: TrendLineChartProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!data?.length) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        Run your first analysis to see score trends.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) =>
            new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
          }}
          labelFormatter={(label) =>
            new Date(String(label)).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          }
          formatter={(value, name) =>
            [`${Math.round(Number(value))}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)] as [string, string]
          }
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          formatter={(value: string) =>
            value.charAt(0).toUpperCase() + value.slice(1)
          }
        />
        <Line
          type="monotone"
          dataKey="feasibility"
          stroke={COLORS.feasibility}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="impact"
          stroke={COLORS.impact}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="complexity"
          stroke={COLORS.complexity}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
