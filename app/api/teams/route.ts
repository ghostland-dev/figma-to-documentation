import { type NextRequest, NextResponse } from "next/server"
import { apiHandler, withAuth, withRateLimit, withValidation } from "@/lib/api-utils"
import { logger } from "@/lib/logger"
import { getUserTeams, createTeam } from "@/lib/team-utils"
import { z } from "zod"

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name too long"),
  description: z.string().max(500, "Description too long").optional(),
})

export async function GET(request: NextRequest) {
  return apiHandler(request, async (req, { requestId }) => {
    withRateLimit(req, 20, 60000) // 20 requests per minute
    const { user } = await withAuth(req)

    logger.info("Fetching user teams", {
      requestId,
      userId: user.id,
    })

    const teams = await getUserTeams(user.id)

    return NextResponse.json({
      success: true,
      teams,
      requestId,
    })
  })
}

export async function POST(request: NextRequest) {
  return apiHandler(request, async (req, { requestId }) => {
    withRateLimit(req, 5, 60000) // 5 team creations per minute
    const { user } = await withAuth(req)
    const { name, description } = await withValidation(req, createTeamSchema)

    logger.info("Creating new team", {
      requestId,
      userId: user.id,
      teamName: name,
    })

    const team = await createTeam(user.id, { name, description })

    logger.info("Team created successfully", {
      requestId,
      userId: user.id,
      teamId: team.id,
      teamName: team.name,
    })

    return NextResponse.json({
      success: true,
      team,
      requestId,
    })
  })
}
