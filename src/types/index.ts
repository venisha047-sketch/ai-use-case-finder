// ─────────────────────────────────────────────────────────────────────────────
// Domain Types — AI Use Case Finder & Implementation Advisor
//
// These are the application-layer interfaces. They mirror the Prisma models
// but are decoupled from the ORM so they can be safely imported by both
// server and client code without pulling in Prisma client.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enums ────────────────────────────────────────────────────────────────────
// Duplicated from Prisma enums so client code never imports from @prisma/client

export type CompanySize =
  | "STARTUP"
  | "SMALL_BUSINESS"
  | "MID_MARKET"
  | "ENTERPRISE";

export type ROILevel = "LOW" | "MEDIUM" | "HIGH";

export type PriorityRank = "IMMEDIATE" | "STRATEGIC" | "FUTURE";

export type ProjectStatus =
  | "PENDING"
  | "ANALYZING"
  | "COMPLETED"
  | "FAILED";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;          // Clerk user ID
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  userId: string;
  title: string;
  industry: string;
  department: string;
  companySize: CompanySize;
  problemStatement: string;
  processDescription: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** Project with its most recent analysis pre-joined (used on detail pages) */
export interface ProjectWithLatestAnalysis extends Project {
  latestAnalysis: Analysis | null;
}

/** Lightweight row used in paginated lists and dashboard tables */
export interface ProjectSummary {
  id: string;
  userId: string;
  title: string;
  industry: string;
  department: string;
  companySize: CompanySize;
  status: ProjectStatus;
  createdAt: Date;
  latestAnalysis: AnalysisSummary | null;
}

// ─── Use Case ─────────────────────────────────────────────────────────────────
// Each element inside Analysis.recommendations (stored as JSON)

export interface UseCase {
  id: string;           // deterministic slug, e.g. "email-automation"
  title: string;
  description: string;
  category: string;     // e.g. "Customer Support", "Process Automation"
  feasibility: number;  // 0–100
  impact: number;       // 0–100
  complexity: number;   // 0–100
  timeToValue: string;  // e.g. "3–6 months"
  requiredCapabilities: string[];
  benefits: string[];
  risks: string[];
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────
// Analysis.roadmap JSON shape

export interface RoadmapPhase {
  title: string;
  tasks: string[];
  milestone: string;
}

export interface Roadmap {
  day30: RoadmapPhase;
  day60: RoadmapPhase;
  day90: RoadmapPhase;
}

// ─── Tech Recommendation ──────────────────────────────────────────────────────
// Each element inside Analysis.techRecommendations

export interface TechRecommendation {
  name: string;
  category: string;    // e.g. "ML Platform", "Data Pipeline", "LLM API"
  description: string;
  rationale: string;
  tier: "core" | "optional" | "future";
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

export interface Analysis {
  id: string;
  projectId: string;

  // Scores
  feasibilityScore: number;
  impactScore: number;
  complexityScore: number;

  // ROI
  roiLevel: ROILevel;
  roiRange: string;

  // Classification
  priorityRank: PriorityRank;

  // AI-generated content
  executiveSummary: string;
  recommendations: UseCase[];
  roadmap: Roadmap;
  techRecommendations: TechRecommendation[];

  // Token usage
  promptTokens: number | null;
  completionTokens: number | null;

  createdAt: Date;
}

/** Lightweight version used in lists and dashboard stats */
export interface AnalysisSummary {
  id: string;
  feasibilityScore: number;
  impactScore: number;
  complexityScore: number;
  roiLevel: ROILevel;
  priorityRank: PriorityRank;
  createdAt: Date;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProjects: number;
  totalAnalyses: number;
  avgFeasibilityScore: number;
  avgImpactScore: number;
  avgComplexityScore: number;
  roiDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  recentProjects: ProjectSummary[];
  scoreTrend: ScoreTrendPoint[];
}

export interface ScoreTrendPoint {
  date: string;             // ISO date string for Recharts
  feasibility: number;
  impact: number;
  complexity: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ─── Common Utility Types ─────────────────────────────────────────────────────

/** Makes specific keys of T optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Makes all keys of T required and non-nullable */
export type RequiredNonNullable<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

/** Represents a successful or failed operation result */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
