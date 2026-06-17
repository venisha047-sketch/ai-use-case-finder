"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn, getScoreColor, getScoreBgClass } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { UseCase } from "@/types";

interface UseCaseCardProps {
  useCase: UseCase;
  index: number;
}

function UseCaseCard({ useCase, index }: UseCaseCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary shrink-0 mt-0.5">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{useCase.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {useCase.category}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {useCase.timeToValue}
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            {[
              { label: "Feasibility", value: useCase.feasibility },
              { label: "Impact", value: useCase.impact },
              { label: "Complexity", value: useCase.complexity },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{label}:</span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    getScoreColor(value)
                  )}
                >
                  {Math.round(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            {useCase.description}
          </p>

          <div className="flex sm:hidden items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Time to value: {useCase.timeToValue}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {useCase.benefits.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Benefits
                </p>
                <ul className="space-y-1">
                  {useCase.benefits.map((b) => (
                    <li key={b} className="text-xs text-muted-foreground flex gap-1.5">
                      <span className="shrink-0 mt-1">·</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {useCase.risks.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  Risks
                </p>
                <ul className="space-y-1">
                  {useCase.risks.map((r) => (
                    <li key={r} className="text-xs text-muted-foreground flex gap-1.5">
                      <span className="shrink-0 mt-1">·</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {useCase.requiredCapabilities.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2">Required Capabilities</p>
              <div className="flex flex-wrap gap-1.5">
                {useCase.requiredCapabilities.map((cap) => (
                  <Badge key={cap} variant="secondary" className="text-xs font-normal">
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface UseCaseListProps {
  useCases: UseCase[];
}

export function UseCaseList({ useCases }: UseCaseListProps) {
  if (!useCases?.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No use cases found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {useCases.map((uc, i) => (
        <UseCaseCard key={uc.id} useCase={uc} index={i} />
      ))}
    </div>
  );
}
