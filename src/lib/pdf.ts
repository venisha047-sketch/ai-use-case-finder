// ─────────────────────────────────────────────────────────────────────────────
// PDF Generator — produces an executive-ready analysis report
// Uses @react-pdf/renderer v4 (server-side renderToBuffer)
// ─────────────────────────────────────────────────────────────────────────────

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import { createElement } from "react";
import type { Analysis } from "@/types/index";

// ─── Font registration ────────────────────────────────────────────────────────
// Use built-in Helvetica — no network fetch required at render time.
Font.registerHyphenationCallback((word) => [word]);

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  primary: "#6366f1",
  primaryLight: "#ede9fe",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  white: "#ffffff",
  emerald: "#059669",
  amber: "#d97706",
  red: "#dc2626",
  violet: "#7c3aed",
  blue: "#2563eb",
  slate: "#64748b",
  bg: "#f9fafb",
  roiHigh: "#d1fae5",
  roiMedium: "#fef3c7",
  roiLow: "#f1f5f9",
  roiHighText: "#065f46",
  roiMediumText: "#92400e",
  roiLowText: "#334155",
} as const;

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.white,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontSize: 10,
    color: C.text,
    lineHeight: 1.5,
  },
  // Header
  header: {
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandDot: { width: 10, height: 10, backgroundColor: C.primary, borderRadius: 2 },
  brandName: { fontSize: 9, color: C.muted, fontFamily: "Helvetica" },
  docTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.text, marginTop: 12 },
  docSubtitle: { fontSize: 11, color: C.muted, marginTop: 2 },
  metaRow: { flexDirection: "row", gap: 16, marginTop: 10 },
  metaItem: { fontSize: 9, color: C.muted },
  // Section
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.primaryLight,
  },
  // Score grid
  scoreGrid: { flexDirection: "row", gap: 10, marginBottom: 0 },
  scoreBox: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  scoreNumber: { fontSize: 24, fontFamily: "Helvetica-Bold", color: C.primary },
  scoreLabel: { fontSize: 8, color: C.muted, marginTop: 2, textAlign: "center" },
  // Pill badges
  pillRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  pill: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  // Executive summary
  summaryText: { fontSize: 10, color: C.text, lineHeight: 1.7 },
  // Use case card
  ucCard: {
    backgroundColor: C.bg,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  ucHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  ucTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.text, flex: 1, marginRight: 8 },
  ucCategory: { fontSize: 8, color: C.muted, backgroundColor: C.primaryLight, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  ucDesc: { fontSize: 9, color: C.muted, marginBottom: 8, lineHeight: 1.6 },
  ucScoreRow: { flexDirection: "row", gap: 12 },
  ucScore: { flexDirection: "row", gap: 3, alignItems: "center" },
  ucScoreLabel: { fontSize: 8, color: C.muted },
  ucScoreVal: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.text },
  ucTimeRow: { flexDirection: "row", gap: 4, marginTop: 6, alignItems: "center" },
  ucTimeLabel: { fontSize: 8, color: C.muted },
  ucTimeVal: { fontSize: 8, color: C.text },
  // Bullets
  bulletRow: { flexDirection: "row", gap: 6, marginBottom: 3 },
  bulletDot: { width: 3, height: 3, borderRadius: 99, backgroundColor: C.primary, marginTop: 4 },
  bulletText: { fontSize: 9, color: C.muted, flex: 1, lineHeight: 1.5 },
  // Roadmap
  roadmapPhase: {
    backgroundColor: C.bg,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 3,
  },
  phaseHeader: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 6 },
  phaseLabel: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  phaseSub: { fontSize: 9, color: C.muted },
  phaseTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.text, marginBottom: 4 },
  milestone: { fontSize: 8, color: C.muted, marginTop: 6, fontFamily: "Helvetica-Oblique" },
  // Tech
  techCard: {
    flexDirection: "row",
    gap: 10,
    padding: 10,
    backgroundColor: C.bg,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  techName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.text },
  techCategory: { fontSize: 8, color: C.muted },
  techDesc: { fontSize: 9, color: C.muted, marginTop: 2, lineHeight: 1.5, flex: 1 },
  tierPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginTop: 2 },
  tierText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: C.muted },
  // Page 2+
  pageBreak: { marginTop: 0 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roiStyle(level: string) {
  if (level === "HIGH") return { bg: C.roiHigh, text: C.roiHighText };
  if (level === "MEDIUM") return { bg: C.roiMedium, text: C.roiMediumText };
  return { bg: C.roiLow, text: C.roiLowText };
}

function priorityStyle(rank: string) {
  if (rank === "IMMEDIATE") return { bg: "#ede9fe", text: "#5b21b6" };
  if (rank === "STRATEGIC") return { bg: "#dbeafe", text: "#1d4ed8" };
  return { bg: "#f1f5f9", text: "#475569" };
}

function phaseAccentColor(key: string) {
  if (key === "day30") return C.violet;
  if (key === "day60") return C.primary;
  return C.emerald;
}

function tierStyle(tier: string) {
  if (tier === "core") return { bg: "#d1fae5", text: "#065f46" };
  if (tier === "optional") return { bg: "#dbeafe", text: "#1d4ed8" };
  return { bg: "#f1f5f9", text: "#475569" };
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(date));
}

// ─── PDF Document component ───────────────────────────────────────────────────

function AnalysisPdfDoc({ analysis, projectTitle }: { analysis: Analysis; projectTitle: string }) {
  const roi = roiStyle(analysis.roiLevel);
  const priority = priorityStyle(analysis.priorityRank);

  const ROI_LABELS: Record<string, string> = { LOW: "Low ROI", MEDIUM: "Medium ROI", HIGH: "High ROI" };
  const PRIORITY_LABELS: Record<string, string> = { IMMEDIATE: "Immediate", STRATEGIC: "Strategic", FUTURE: "Future" };
  const PHASE_LABELS = [
    { key: "day30", label: "Day 30", sub: "Foundation" },
    { key: "day60", label: "Day 60", sub: "Expansion" },
    { key: "day90", label: "Day 90", sub: "Scale" },
  ] as const;

  return createElement(
    Document,
    { title: `${projectTitle} — AI Analysis`, author: "AI Use Case Finder" },

    // ── Page 1: Overview + scores + executive summary ──────────────────────────
    createElement(
      Page,
      { size: "A4", style: s.page },

      // Header
      createElement(
        View,
        { style: s.header },
        createElement(
          View,
          { style: s.headerTop },
          createElement(
            View,
            { style: s.brandRow },
            createElement(View, { style: s.brandDot }),
            createElement(Text, { style: s.brandName }, "AI Use Case Finder")
          ),
          createElement(Text, { style: s.metaItem }, formatDate(analysis.createdAt))
        ),
        createElement(Text, { style: s.docTitle }, projectTitle),
        createElement(Text, { style: s.docSubtitle }, "AI Use Case Analysis Report"),
        createElement(
          View,
          { style: s.pillRow },
          createElement(
            View,
            { style: [s.pill, { backgroundColor: roi.bg }] },
            createElement(Text, { style: [s.pillText, { color: roi.text }] }, ROI_LABELS[analysis.roiLevel] ?? analysis.roiLevel)
          ),
          createElement(
            View,
            { style: [s.pill, { backgroundColor: priority.bg }] },
            createElement(Text, { style: [s.pillText, { color: priority.text }] }, PRIORITY_LABELS[analysis.priorityRank] ?? analysis.priorityRank)
          ),
          createElement(
            View,
            { style: [s.pill, { backgroundColor: C.primaryLight }] },
            createElement(Text, { style: [s.pillText, { color: C.primary }] }, `ROI ${analysis.roiRange}`)
          )
        )
      ),

      // Scores
      createElement(
        View,
        { style: s.section },
        createElement(Text, { style: s.sectionTitle }, "Overall Scores"),
        createElement(
          View,
          { style: s.scoreGrid },
          ...[
            { label: "Feasibility", value: analysis.feasibilityScore },
            { label: "Impact", value: analysis.impactScore },
            { label: "Complexity", value: analysis.complexityScore },
          ].map(({ label, value }) =>
            createElement(
              View,
              { key: label, style: s.scoreBox },
              createElement(Text, { style: s.scoreNumber }, String(Math.round(value))),
              createElement(Text, { style: s.scoreLabel }, label)
            )
          )
        )
      ),

      // Executive summary
      createElement(
        View,
        { style: s.section },
        createElement(Text, { style: s.sectionTitle }, "Executive Summary"),
        createElement(Text, { style: s.summaryText }, analysis.executiveSummary)
      ),

      // Footer
      createElement(
        View,
        { style: s.footer, fixed: true },
        createElement(Text, { style: s.footerText }, "AI Use Case Finder — Confidential"),
        createElement(Text, { style: s.footerText, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` })
      )
    ),

    // ── Page 2: Use cases ──────────────────────────────────────────────────────
    createElement(
      Page,
      { size: "A4", style: s.page },
      createElement(Text, { style: s.sectionTitle }, `Recommended AI Use Cases (${analysis.recommendations.length})`),
      ...analysis.recommendations.map((uc, i) =>
        createElement(
          View,
          { key: uc.id, style: s.ucCard, wrap: false },
          createElement(
            View,
            { style: s.ucHeader },
            createElement(Text, { style: s.ucTitle }, `${i + 1}. ${uc.title}`),
            createElement(
              View,
              { style: [s.pill, { backgroundColor: C.primaryLight }] },
              createElement(Text, { style: [s.pillText, { color: C.primary }] }, uc.category)
            )
          ),
          createElement(Text, { style: s.ucDesc }, uc.description),
          createElement(
            View,
            { style: s.ucScoreRow },
            ...[
              { label: "Feasibility", val: uc.feasibility },
              { label: "Impact", val: uc.impact },
              { label: "Complexity", val: uc.complexity },
            ].map(({ label, val }) =>
              createElement(
                View,
                { key: label, style: s.ucScore },
                createElement(Text, { style: s.ucScoreLabel }, `${label}: `),
                createElement(Text, { style: s.ucScoreVal }, String(val))
              )
            )
          ),
          createElement(
            View,
            { style: s.ucTimeRow },
            createElement(Text, { style: s.ucTimeLabel }, "Time to value: "),
            createElement(Text, { style: s.ucTimeVal }, uc.timeToValue)
          ),
          uc.benefits.length > 0 &&
            createElement(
              View,
              { style: { marginTop: 8 } },
              createElement(Text, { style: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.text, marginBottom: 3 } }, "Key Benefits"),
              ...uc.benefits.slice(0, 3).map((b, bi) =>
                createElement(
                  View,
                  { key: bi, style: s.bulletRow },
                  createElement(View, { style: s.bulletDot }),
                  createElement(Text, { style: s.bulletText }, b)
                )
              )
            )
        )
      ),
      createElement(
        View,
        { style: s.footer, fixed: true },
        createElement(Text, { style: s.footerText }, "AI Use Case Finder — Confidential"),
        createElement(Text, { style: s.footerText, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` })
      )
    ),

    // ── Page 3: Roadmap + Tech stack ──────────────────────────────────────────
    createElement(
      Page,
      { size: "A4", style: s.page },

      // Roadmap
      createElement(Text, { style: s.sectionTitle }, "90-Day Implementation Roadmap"),
      ...PHASE_LABELS.map(({ key, label, sub }) => {
        const phase = analysis.roadmap[key];
        const accent = phaseAccentColor(key);
        return createElement(
          View,
          { key, style: [s.roadmapPhase, { borderLeftColor: accent }], wrap: false },
          createElement(
            View,
            { style: s.phaseHeader },
            createElement(
              View,
              { style: [s.pill, { backgroundColor: accent + "20" }] },
              createElement(Text, { style: [s.pillText, { color: accent }] }, label)
            ),
            createElement(Text, { style: s.phaseSub }, sub)
          ),
          createElement(Text, { style: s.phaseTitle }, phase.title),
          ...phase.tasks.map((task, ti) =>
            createElement(
              View,
              { key: ti, style: s.bulletRow },
              createElement(View, { style: [s.bulletDot, { backgroundColor: accent }] }),
              createElement(Text, { style: s.bulletText }, task)
            )
          ),
          createElement(Text, { style: s.milestone }, `Milestone: ${phase.milestone}`)
        );
      }),

      // Tech recommendations
      createElement(Text, { style: [s.sectionTitle, { marginTop: 16 }] }, "Technology Recommendations"),
      ...analysis.techRecommendations.map((tech) => {
        const ts = tierStyle(tech.tier);
        return createElement(
          View,
          { key: tech.name, style: s.techCard, wrap: false },
          createElement(
            View,
            { style: { flex: 1 } },
            createElement(
              View,
              { style: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" } },
              createElement(
                View,
                null,
                createElement(Text, { style: s.techName }, tech.name),
                createElement(Text, { style: s.techCategory }, tech.category)
              ),
              createElement(
                View,
                { style: [s.tierPill, { backgroundColor: ts.bg }] },
                createElement(Text, { style: [s.tierText, { color: ts.text }] }, tech.tier.toUpperCase())
              )
            ),
            createElement(Text, { style: s.techDesc }, tech.rationale)
          )
        );
      }),

      createElement(
        View,
        { style: s.footer, fixed: true },
        createElement(Text, { style: s.footerText }, "AI Use Case Finder — Confidential"),
        createElement(Text, { style: s.footerText, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` })
      )
    )
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateAnalysisPdf(
  analysis: Analysis,
  projectTitle: string
): Promise<Buffer> {
  const doc = createElement(AnalysisPdfDoc, { analysis, projectTitle });
  return renderToBuffer(doc as Parameters<typeof renderToBuffer>[0]);
}
