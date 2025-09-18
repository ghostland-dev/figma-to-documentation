import { type NextRequest, NextResponse } from "next/server"
import { apiHandler, withAuth, withRateLimit, withValidation, ApiException } from "@/lib/api-utils"
import { exportSchema } from "@/lib/validation"
import { logger } from "@/lib/logger"
import { generateExport } from "@/lib/export-generator"

export async function POST(request: NextRequest) {
  return apiHandler(request, async (req, { requestId }) => {
    withRateLimit(req, 5, 60000) // 5 exports per minute

    const { user, supabase } = await withAuth(req)

    const { projectId, exportType, options } = await withValidation(req, exportSchema)

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (projectError || !project) {
      throw new ApiException("Project not found", 404, "PROJECT_NOT_FOUND")
    }

    if (!project.analysis_data?.designSystem) {
      throw new ApiException("Project analysis not completed", 400, "ANALYSIS_NOT_COMPLETED")
    }

    logger.info("Starting export generation", {
      requestId,
      userId: user.id,
      projectId,
      exportType,
      options,
    })

    try {
      const exportResult = await generateExport({
        designSystem: project.analysis_data.designSystem,
        projectInfo: {
          id: project.id,
          name: project.name,
          figmaUrl: project.figma_url,
          createdAt: project.created_at,
          analyzedAt: project.analysis_data.analyzedAt,
        },
        exportType,
        options: options || {},
      })

      await supabase.from("export_logs").insert({
        user_id: user.id,
        project_id: projectId,
        export_type: exportType,
        options,
        created_at: new Date().toISOString(),
      })

      logger.info("Export generated successfully", {
        requestId,
        userId: user.id,
        projectId,
        exportType,
        size: exportResult.content.length,
      })

      return new NextResponse(exportResult.content, {
        headers: {
          "Content-Type": exportResult.contentType,
          "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
          "X-Export-Size": exportResult.content.length.toString(),
          "X-Request-ID": requestId,
        },
      })
    } catch (error) {
      logger.error("Export generation failed", {
        requestId,
        userId: user.id,
        projectId,
        error: error instanceof Error ? error.message : "Unknown error",
      })

      if (error instanceof ApiException) {
        throw error
      }
      throw new ApiException("Export generation failed", 500, "EXPORT_ERROR")
    }
  })
}
