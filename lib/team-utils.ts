import { createClient } from "@/lib/supabase/server"
import { ApiException } from "@/lib/api-utils"

export interface Team {
  id: string
  name: string
  description?: string
  avatar_url?: string
  owner_id: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: "owner" | "admin" | "editor" | "viewer"
  status: "pending" | "active" | "inactive"
  invited_by?: string
  joined_at?: string
  created_at: string
  profiles?: {
    full_name?: string
    email: string
    avatar_url?: string
  }
}

export interface TeamInvitation {
  id: string
  team_id: string
  email: string
  role: "admin" | "editor" | "viewer"
  invited_by: string
  token: string
  expires_at: string
  created_at: string
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      team_members!inner(role, status)
    `)
    .eq("team_members.user_id", userId)
    .eq("team_members.status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    throw new ApiException("Failed to fetch teams", 500, "DATABASE_ERROR")
  }

  return data || []
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("team_members")
    .select(`
      *,
      profiles(full_name, email, avatar_url)
    `)
    .eq("team_id", teamId)
    .order("created_at", { ascending: true })

  if (error) {
    throw new ApiException("Failed to fetch team members", 500, "DATABASE_ERROR")
  }

  return data || []
}

export async function createTeam(userId: string, teamData: { name: string; description?: string }): Promise<Team> {
  const supabase = await createClient()

  // Create team
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      name: teamData.name,
      description: teamData.description,
      owner_id: userId,
    })
    .select()
    .single()

  if (teamError) {
    throw new ApiException("Failed to create team", 500, "DATABASE_ERROR")
  }

  // Add owner as team member
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: userId,
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString(),
  })

  if (memberError) {
    // Rollback team creation
    await supabase.from("teams").delete().eq("id", team.id)
    throw new ApiException("Failed to create team membership", 500, "DATABASE_ERROR")
  }

  return team
}

export async function inviteTeamMember(
  teamId: string,
  invitedBy: string,
  email: string,
  role: "admin" | "editor" | "viewer",
): Promise<TeamInvitation> {
  const supabase = await createClient()

  // Check if user has permission to invite
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", invitedBy)
    .eq("status", "active")
    .single()

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new ApiException("Insufficient permissions to invite members", 403, "INSUFFICIENT_PERMISSIONS")
  }

  // Generate invitation token
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  const { data: invitation, error } = await supabase
    .from("team_invitations")
    .insert({
      team_id: teamId,
      email,
      role,
      invited_by: invitedBy,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new ApiException("User already invited to this team", 400, "ALREADY_INVITED")
    }
    throw new ApiException("Failed to create invitation", 500, "DATABASE_ERROR")
  }

  return invitation
}

export async function acceptTeamInvitation(token: string, userId: string): Promise<void> {
  const supabase = await createClient()

  // Find and validate invitation
  const { data: invitation, error: inviteError } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (inviteError || !invitation) {
    throw new ApiException("Invalid or expired invitation", 400, "INVALID_INVITATION")
  }

  // Get user email to verify
  const { data: user } = await supabase.auth.getUser()
  if (!user.user || user.user.email !== invitation.email) {
    throw new ApiException("Invitation email does not match user", 400, "EMAIL_MISMATCH")
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", invitation.team_id)
    .eq("user_id", userId)
    .single()

  if (existingMember) {
    throw new ApiException("User is already a team member", 400, "ALREADY_MEMBER")
  }

  // Add user to team
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: invitation.team_id,
    user_id: userId,
    role: invitation.role,
    status: "active",
    invited_by: invitation.invited_by,
    joined_at: new Date().toISOString(),
  })

  if (memberError) {
    throw new ApiException("Failed to join team", 500, "DATABASE_ERROR")
  }

  // Mark invitation as accepted
  await supabase.from("team_invitations").update({ accepted_at: new Date().toISOString() }).eq("id", invitation.id)
}

export async function shareProject(
  projectId: string,
  userId: string,
  collaboratorUserId: string,
  role: "editor" | "viewer",
): Promise<void> {
  const supabase = await createClient()

  // Verify user owns the project
  const { data: project } = await supabase.from("projects").select("user_id").eq("id", projectId).single()

  if (!project || project.user_id !== userId) {
    throw new ApiException("Project not found or access denied", 404, "PROJECT_NOT_FOUND")
  }

  // Add collaborator
  const { error } = await supabase.from("project_collaborators").insert({
    project_id: projectId,
    user_id: collaboratorUserId,
    role,
    invited_by: userId,
  })

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new ApiException("User is already a collaborator", 400, "ALREADY_COLLABORATOR")
    }
    throw new ApiException("Failed to add collaborator", 500, "DATABASE_ERROR")
  }
}

export async function addComment(projectId: string, userId: string, content: string, parentId?: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("comments").insert({
    project_id: projectId,
    user_id: userId,
    content,
    parent_id: parentId,
  })

  if (error) {
    throw new ApiException("Failed to add comment", 500, "DATABASE_ERROR")
  }
}

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  teamId?: string,
  projectId?: string,
  metadata?: Record<string, any>,
): Promise<void> {
  const supabase = await createClient()

  await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    team_id: teamId,
    project_id: projectId,
    metadata: metadata || {},
  })
}
