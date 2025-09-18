import { type NextRequest, NextResponse } from "next/server"
import { apiHandler, withAuth, withRateLimit, withValidation } from "@/lib/api-utils"
import { logger } from "@/lib/logger"
import { getTeamMembers, inviteTeamMember } from "@/lib/team-utils"
import { z } from "zod"

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "editor", "viewer"]),
})

export async function GET(request: NextRequest, { params }: { params: { teamId: string } }) {
  return apiHandler(request, async (req, { requestId }) => {
    withRateLimit(req, 20, 60000)
    const { user } = await withAuth(req)
    const { teamId } = params

    logger.info("Fetching team members", {
      requestId,
      userId: user.id,
      teamId,
    })

    const members = await getTeamMembers(teamId)

    return NextResponse.json({
      success: true,
      members,
      requestId,
    })
  })
}

export async function POST(request: NextRequest, { params }: { params: { teamId: string } }) {
  return apiHandler(request, async (req, { requestId }) => {
    withRateLimit(req, 10, 60000) // 10 invitations per minute
    const { user } = await withAuth(req)
    const { teamId } = params
    const { email, role } = await withValidation(req, inviteMemberSchema)

    logger.info("Inviting team member", {
      requestId,
      userId: user.id,
      teamId,
      email,
      role,
    })

    const invitation = await inviteTeamMember(teamId, user.id, email, role)

    // TODO: Send invitation email
    logger.info("Team invitation created", {
      requestId,
      userId: user.id,
      teamId,
      invitationId: invitation.id,
      email,
    })

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expires_at,
      },
      requestId,
    })
  })
}
