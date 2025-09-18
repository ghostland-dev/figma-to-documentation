import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: ownProjects, error: ownProjectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (ownProjectsError) {
    console.error("Error fetching own projects:", ownProjectsError)
  }

  const { data: collaborations, error: collaborationsError } = await supabase
    .from("project_collaborators")
    .select("project_id")
    .eq("user_id", user.id)

  if (collaborationsError) {
    console.error("Error fetching collaborations:", collaborationsError)
  }

  // In a future update, we can implement a more sophisticated collaboration system
  const allProjects = ownProjects || []

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const completedProjects = allProjects?.filter((p) => p.status === "completed") || []
  const processingProjects = allProjects?.filter((p) => p.status === "processing") || []

  const stats = {
    totalProjects: allProjects?.length || 0,
    completedProjects: completedProjects.length,
    processingProjects: processingProjects.length,
    avgProcessingTime: "2.3 min", // This could be calculated from actual data
  }

  return <DashboardClient user={user} profile={profile} projects={allProjects || []} stats={stats} />
}
