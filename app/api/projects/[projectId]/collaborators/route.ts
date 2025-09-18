import { type NextRequest, NextResponse } from "next/server"
import { apiHandler, withAuth, withRateLimit, withValidation } from "@/lib/api-utils"
import { logger } from "@/lib/logger"
import { shareProject } from "@/lib/team-utils"
import { z } from "zod"

const shareProjectSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.enum(["editor", "viewer"]),
})

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  return apiHandler(request, async (req, { requestId }) => {
    withRateLimit(req, 10, 60000) // 10 shares per minute
    const { user } = await withAuth(req)
    const { projectId } = params
    const { userId: collaboratorUserId, role } = await withValidation(req, shareProjectSchema)

    logger.info("Sharing project", {
      requestId,
      userId: user.id,
      projectId,
      collaboratorUserId,
      role,
    })

    await shareProject(projectId, user.id, collaboratorUserId, role)

    logger.info("Project shared successfully", {
      requestId,
      userId: user.id,
      projectId,
      collaboratorUserId,
    })

    return NextResponse.json({
      success: true,
      message: "Project shared successfully",
      requestId,
    })
  })
}
