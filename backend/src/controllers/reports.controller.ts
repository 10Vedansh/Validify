import type { Context } from "hono";
import { reportsService } from "@/services/reports.service";
import type { GenerateReportInput } from "@/schemas/report.schema";

/**
 * Reports controller.
 *
 * Handles CRUD + AI generation for reports.
 * All endpoints require authentication.
 */

export const reportsController = {
  /**
   * Generate a new validation report.
   *
   * POST /reports/generate
   *
   * Accepts an existing ideaId or inline idea data.
   * Runs the 7-service AI orchestrator and returns the completed report.
   */
  async generate(c: Context) {
    const userId = c.get("userId");
    const body = c.req.valid("json" as never) as GenerateReportInput;

    const report = await reportsService.generate(userId, body);
    return c.json(report, 201);
  },

  /**
   * List reports for the authenticated user.
   *
   * GET /reports?page=1&pageSize=10&search=neuro&industry=AI / ML&sortBy=createdAt&sortOrder=desc
   */
  async list(c: Context) {
    const userId = c.get("userId");
    const query = c.req.query();

    const search = query.search;
    const industry = query.industry;
    const sortBy = (query.sortBy ?? "createdAt") as "createdAt" | "title" | "overallScore";
    const sortOrder = (query.sortOrder ?? "desc") as "asc" | "desc";

    const result = await reportsService.list(userId, {
      search,
      industry,
      sortBy,
      sortOrder,
    });

    return c.json(result);
  },

  /**
   * Get a single report by ID.
   *
   * GET /reports/:id
   */
  async getById(c: Context) {
    const reportId = c.req.param("id")!;
    const userId = c.get("userId");

    const report = await reportsService.getById(reportId, userId);
    return c.json(report);
  },

  /**
   * Delete a report by ID.
   *
   * DELETE /reports/:id
   */
  async delete(c: Context) {
    const reportId = c.req.param("id")!;
    const userId = c.get("userId");

    await reportsService.delete(reportId, userId);

    return c.json({ message: "Report deleted successfully" });
  },

  async exportPdf(c: Context) {
    const reportId = c.req.param("id")!;
    const userId = c.get("userId");

    const report = await reportsService.getById(reportId, userId);

    const pdfContent = `Validify Report\n\n${report.title}\n${report.summary}\n\nOverall Score: ${report.score.overall}/100\n\nGenerated: ${report.createdAt}`;

    return c.newResponse(pdfContent, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportId}.pdf"`,
    });
  },
};
