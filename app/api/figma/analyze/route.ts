import { type NextRequest, NextResponse } from "next/server"
import { apiHandler, withAuth, withRateLimit, withValidation, ApiException } from "@/lib/api-utils"
import { figmaAnalyzeSchema } from "@/lib/validation"
import { logger } from "@/lib/logger"
import { analyzeDesignSystem } from "@/lib/figma-analyzer"

export async function POST(request: NextRequest) {
  return apiHandler(request, async (req, { requestId }) => {
    withRateLimit(req, 3, 60000) // 3 requests per minute for analysis

    const { user, supabase } = await withAuth(req)

    const { projectId, analysisType } = await withValidation(req, figmaAnalyzeSchema)

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (projectError || !project) {
      throw new ApiException("Project not found", 404, "PROJECT_NOT_FOUND")
    }

    await supabase.from("projects").update({ status: "processing" }).eq("id", projectId)

    logger.info("Starting Figma analysis", {
      requestId,
      userId: user.id,
      projectId,
      analysisType,
      fileKey: project.figma_file_key,
    })

    try {
      const accessToken = req.headers.get("x-figma-token")
      if (!accessToken) {
        throw new ApiException("Figma access token required", 400, "MISSING_ACCESS_TOKEN")
      }

      const [fileResponse, stylesResponse, componentsResponse] = await Promise.all([
        fetch(`https://api.figma.com/v1/files/${project.figma_file_key}`, {
          headers: { "X-Figma-Token": accessToken },
        }),
        fetch(`https://api.figma.com/v1/files/${project.figma_file_key}/styles`, {
          headers: { "X-Figma-Token": accessToken },
        }),
        fetch(`https://api.figma.com/v1/files/${project.figma_file_key}/components`, {
          headers: { "X-Figma-Token": accessToken },
        }),
      ])

      if (!fileResponse.ok) {
        const errorText = await fileResponse.text()
        logger.warn("Figma API error during analysis", {
          requestId,
          status: fileResponse.status,
          error: errorText,
        })
        throw new ApiException("Failed to fetch Figma file data", fileResponse.status, "FIGMA_API_ERROR")
      }

      const fileData = await fileResponse.json()
      const stylesData = stylesResponse.ok ? await stylesResponse.json() : { meta: { styles: {} } }
      const componentsData = componentsResponse.ok ? await componentsResponse.json() : { meta: { components: {} } }

      const analysisResult = await analyzeDesignSystem(fileData, stylesData, componentsData, analysisType)

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status: "completed",
          analysis_data: {
            ...project.analysis_data,
            designSystem: analysisResult,
            analyzedAt: new Date().toISOString(),
            analysisType,
          },
        })
        .eq("id", projectId)

      if (updateError) {
        logger.error("Failed to save analysis results", {
          requestId,
          projectId,
          error: updateError.message,
        })
        throw new ApiException("Failed to save analysis results", 500, "DATABASE_ERROR")
      }

      logger.info("Analysis completed successfully", {
        requestId,
        userId: user.id,
        projectId,
        componentsFound: analysisResult.components.length,
        colorsFound: analysisResult.colors.length,
      })

      return NextResponse.json({
        success: true,
        analysis: analysisResult,
        project: {
          id: project.id,
          name: project.name,
          status: "completed",
        },
        requestId,
      })
    } catch (error) {
      await supabase.from("projects").update({ status: "error" }).eq("id", projectId)

      if (error instanceof ApiException) {
        throw error
      }
      throw new ApiException("Analysis failed", 500, "ANALYSIS_ERROR")
    }
  })
}
