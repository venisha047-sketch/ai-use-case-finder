import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TechRecommendation } from "@/types";

const TIER_CONFIG = {
  core: {
    label: "Core",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    description: "Essential for implementation",
  },
  optional: {
    label: "Optional",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Enhances capabilities",
  },
  future: {
    label: "Future",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    description: "Long-term architecture",
  },
};

interface TechStackSuggestionsProps {
  recommendations: TechRecommendation[];
}

export function TechStackSuggestions({ recommendations }: TechStackSuggestionsProps) {
  const grouped = recommendations.reduce(
    (acc, rec) => {
      if (!acc[rec.tier]) acc[rec.tier] = [];
      acc[rec.tier].push(rec);
      return acc;
    },
    {} as Record<TechRecommendation["tier"], TechRecommendation[]>
  );

  const tiers: TechRecommendation["tier"][] = ["core", "optional", "future"];

  return (
    <div className="space-y-6">
      {tiers
        .filter((tier) => grouped[tier]?.length)
        .map((tier) => {
          const config = TIER_CONFIG[tier];
          return (
            <div key={tier}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    config.badgeClass
                  )}
                >
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {config.description}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grouped[tier].map((rec) => (
                  <div
                    key={rec.name}
                    className="bg-card border border-border rounded-lg p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold">{rec.name}</p>
                      <Badge variant="secondary" className="text-xs font-normal shrink-0">
                        {rec.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {rec.description}
                    </p>
                    <p className="text-xs text-foreground/70 leading-relaxed border-t border-border pt-2">
                      {rec.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
