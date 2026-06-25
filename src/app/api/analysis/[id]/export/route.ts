// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analysis/[id]/export — stream analysis as a PDF download
//
// Returns a binary PDF stream directly (no JSON envelope).
// Generated server-side on demand using @react-pdf/renderer.
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { withApiHandler, requireAuth, Errors } from "@/lib/errors";
import { validate, RouteIdSchema } from "@/lib/validations";
import { getAnalysisForUser } from "@/lib/services/analysis.service";
import { getProjectForUser } from "@/lib/services/project.service";
import { generateAnalysisPdf } from "@/lib/pdf";
import type { RouteParams } from "@/types/api";

export const maxDuration = 60;

export const GET = withApiHandler(async (_req, { params }: RouteParams) => {
  const { userId } = await auth();
  requireAuth(userId);

  const { id } = validate(RouteIdSchema, await params);

  const analysis = await getAnalysisForUser(id, userId);
  if (!analysis) throw Errors.analysisNotFound(id);

  const project = await getProjectForUser(analysis.projectId, userId);

  const pdfBuffer = await generateAnalysisPdf(analysis, project.title);

  const safeTitle = project.title.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeTitle}-analysis.pdf"`,
      "Cache-Control": "no-store",
    },
  });
});
