import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function getScoreVariant(score: number): "success" | "warning" | "danger" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-500";
}

export function getScoreRingColor(score: number): string {
  if (score >= 70) return "stroke-emerald-500";
  if (score >= 40) return "stroke-amber-500";
  return "stroke-red-500";
}

export function getScoreBgClass(score: number): string {
  if (score >= 70) return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800";
  if (score >= 40) return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800";
  return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(date);
}

export const COMPANY_SIZE_LABELS: Record<string, string> = {
  STARTUP: "Startup",
  SMALL_BUSINESS: "Small Business",
  MID_MARKET: "Mid-Market",
  ENTERPRISE: "Enterprise",
};

export const ROI_LEVEL_LABELS: Record<string, string> = {
  LOW: "Low ROI",
  MEDIUM: "Medium ROI",
  HIGH: "High ROI",
};

export const ROI_LEVEL_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const PRIORITY_RANK_LABELS: Record<string, string> = {
  IMMEDIATE: "Immediate",
  STRATEGIC: "Strategic",
  FUTURE: "Future",
};

export const PRIORITY_RANK_COLORS: Record<string, string> = {
  IMMEDIATE: "bg-violet-50 text-violet-700 border-violet-200",
  STRATEGIC: "bg-blue-50 text-blue-700 border-blue-200",
  FUTURE: "bg-slate-100 text-slate-700 border-slate-200",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ANALYZING: "Analyzing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  ANALYZING: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
};

export const INDUSTRIES = [
  "Technology",
  "Healthcare & Life Sciences",
  "Financial Services",
  "Retail & E-commerce",
  "Manufacturing",
  "Education",
  "Real Estate",
  "Transportation & Logistics",
  "Energy & Utilities",
  "Media & Entertainment",
  "Government & Public Sector",
  "Professional Services",
  "Agriculture",
  "Non-profit",
  "Other",
];

export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Sales",
  "Marketing",
  "Customer Success",
  "Operations",
  "Finance",
  "Human Resources",
  "Legal & Compliance",
  "Research & Development",
  "Data & Analytics",
  "IT Infrastructure",
  "Executive / Leadership",
  "Other",
];
