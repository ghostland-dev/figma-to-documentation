import { type NextRequest, NextResponse } from "next/server"
import { apiHandler, withAuth, withRateLimit, withValidation, ApiException } from "@/lib/api-utils"
import { figmaConnectSchema } from "@/lib/validation"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  return apiHandler(request, async (req, { requestId }) => {
    withRateLimit(req, 5, 60000) // 5 requests per minute

    const { user, supabase } = await withAuth(req)

    const { figmaUrl, accessToken, projectName } = await withValidation(req, figmaConnectSchema)

    const fileKeyMatch = figmaUrl.match(/\/(?:file|design)\/([a-zA-Z0-9_-]+)/)
    if (!fileKeyMatch) {
      throw new ApiException("Invalid Figma URL format", 400, "INVALID_FIGMA_URL")
    }

    const fileKey = fileKeyMatch[1]

    logger.info("Connecting to Figma", {
      requestId,
      userId: user.id,
      fileKey,
      projectName,
    })

    // Fetch file data from Figma API
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        "X-Figma-Token": accessToken,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.warn("Figma API error", {
        requestId,
        status: response.status,
        error: errorText,
      })

      let errorMessage = "Failed to connect to Figma."
      let errorCode = "FIGMA_API_ERROR"

      if (response.status === 403) {
        errorMessage = "Access denied. Please check your access token permissions."
        errorCode = "FIGMA_ACCESS_DENIED"
      } else if (response.status === 404) {
        errorMessage = "File not found. Please check the Figma URL and ensure the file is accessible."
        errorCode = "FIGMA_FILE_NOT_FOUND"
      } else if (response.status === 401) {
        errorMessage = "Invalid access token. Please check your Figma personal access token."
        errorCode = "FIGMA_INVALID_TOKEN"
      }

      throw new ApiException(errorMessage, response.status, errorCode)
    }

    const figmaData = await response.json()

    const { data: project, error: dbError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: projectName || figmaData.name || "Untitled Project",
        figma_url: figmaUrl,
        figma_file_key: fileKey,
        analysis_data: {
          fileName: figmaData.name,
          lastModified: figmaData.lastModified,
          thumbnailUrl: figmaData.thumbnailUrl,
          version: figmaData.version,
          connectedAt: new Date().toISOString(),
        },
        status: "pending",
      })
      .select()
      .single()

    if (dbError) {
      logger.error("Database error", {
        requestId,
        userId: user.id,
        error: dbError.message,
      })
      throw new ApiException("Failed to save project", 500, "DATABASE_ERROR")
    }

    logger.info("Project created successfully", {
      requestId,
      userId: user.id,
      projectId: project.id,
      projectName: project.name,
    })

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        createdAt: project.created_at,
      },
      message: "Successfully connected to Figma file and saved project",
      requestId,
    })
  })
}
