import { CheckCircle2, Flag } from "lucide-react";
import type { Roadmap } from "@/types";

interface RoadmapTimelineProps {
  roadmap: Roadmap;
}

const PHASES = [
  {
    key: "day30" as const,
    label: "Day 30",
    sublabel: "Foundation",
    color: "bg-violet-500",
    ring: "ring-violet-200",
    pillColor: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    key: "day60" as const,
    label: "Day 60",
    sublabel: "Expansion",
    color: "bg-primary",
    ring: "ring-primary/20",
    pillColor: "bg-primary/5 text-primary border-primary/20",
  },
  {
    key: "day90" as const,
    label: "Day 90",
    sublabel: "Scale",
    color: "bg-emerald-500",
    ring: "ring-emerald-200",
    pillColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

export function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  return (
    <div className="space-y-0">
      {PHASES.map(({ key, label, sublabel, color, ring, pillColor }, idx) => {
        const phase = roadmap[key];
        return (
          <div key={key} className="flex gap-4">
            {/* Timeline column */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} ring-2 ${ring} z-10`}
              >
                <span className="text-xs font-bold text-white">{idx + 1}</span>
              </div>
              {idx < PHASES.length - 1 && (
                <div className="w-0.5 flex-1 bg-border my-1" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${idx < PHASES.length - 1 ? "pb-6" : "pb-0"} pt-0.5`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${pillColor}`}>
                  {label}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {sublabel}
                </span>
              </div>

              <h3 className="text-sm font-semibold mb-2">{phase.title}</h3>

              <ul className="space-y-1.5 mb-3">
                {phase.tasks.map((task) => (
                  <li
                    key={task}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/60 mt-0.5 shrink-0" />
                    {task}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Flag className="h-3 w-3" />
                {phase.milestone}
              </div>

              {idx < PHASES.length - 1 && <div className="h-4" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
