// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analysis/[id]/export — stream analysis as a PDF download
//
// Returns a binary PDF stream directly (no JSON envelope).
// The PDF is generated server-side on demand and not cached — it always
// reflects the latest analysis data at time of request.
//
// Phase 1 stub: returns a placeholder response.
// Full @react-pdf/renderer implementation is delivered in Phase 6.
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  withApiHandler,
  requireAuth,
  Errors,
} from "@/lib/errors";
import { validate, RouteIdSchema } from "@/lib/validations";
import { getAnalysisForUser } from "@/lib/services/analysis.service";
import type { RouteParams } from "@/types/api";

export const maxDuration = 60;

export const GET = withApiHandler(async (_req, { params }: RouteParams) => {
  const { userId } = await auth();
  requireAuth(userId);

  const { id } = validate(RouteIdSchema, await params);

  // Ownership check — throws 404/403 if not found or not owned
  const analysis = await getAnalysisForUser(id, userId);

  if (!analysis) throw Errors.analysisNotFound(id);

  // ── Phase 1 stub ────────────────────────────────────────────────────────────
  // Returns a minimal valid PDF so the ExportButton works end-to-end.
  // Replace this block with the full @react-pdf/renderer implementation
  // in Phase 6 (src/lib/pdf.ts).

  const stubPdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>>>> endobj
4 0 obj<</Length 44>>stream
BT /F1 16 Tf 50 750 Td (AI Analysis Export - Phase 6) Tj ET
endstream endobj
xref 0 5
trailer<</Root 1 0 R/Size 5>>
startxref 0
%%EOF`;

  return new NextResponse(stubPdfContent, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="analysis-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
});
