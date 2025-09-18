import { type NextRequest, NextResponse } from "next/server"
import { apiHandler, withAuth, withRateLimit, withValidation, ApiException } from "@/lib/api-utils"
import { logger } from "@/lib/logger"
import { addComment } from "@/lib/team-utils"
import { z } from "zod"

const addCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment too long"),
  parentId: z.string().uuid().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  return apiHandler(request, async (req, { requestId }) => {
    withRateLimit(req, 30, 60000) // 30 requests per minute
    const { user, supabase } = await withAuth(req)
    const { projectId } = params

    logger.info("Fetching project comments", {
      requestId,
      userId: user.id,
      projectId,
    })

    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles(full_name, avatar_url)
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })

    if (error) {
      throw new ApiException("Failed to fetch comments", 500, "DATABASE_ERROR")
    }

    return NextResponse.json({
      success: true,
      comments: comments || [],
      requestId,
    })
  })
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  return apiHandler(request, async (req, { requestId }) => {
    withRateLimit(req, 15, 60000) // 15 comments per minute
    const { user } = await withAuth(req)
    const { projectId } = params
    const { content, parentId } = await withValidation(req, addCommentSchema)

    logger.info("Adding project comment", {
      requestId,
      userId: user.id,
      projectId,
      hasParent: !!parentId,
    })

    await addComment(projectId, user.id, content, parentId)

    logger.info("Comment added successfully", {
      requestId,
      userId: user.id,
      projectId,
    })

    return NextResponse.json({
      success: true,
      message: "Comment added successfully",
      requestId,
    })
  })
}
