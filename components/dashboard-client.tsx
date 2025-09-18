"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Search,
  MoreHorizontal,
  Calendar,
  Download,
  Eye,
  Trash2,
  Plus,
  TrendingUp,
  Clock,
  ExternalLink,
  LogOut,
  Users,
  Settings,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { TeamSelector } from "@/components/team-selector"

interface Project {
  id: string
  name: string
  figma_url: string
  figma_file_key: string
  status: "pending" | "processing" | "completed" | "error"
  analysis_data: any
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

interface Stats {
  totalProjects: number
  completedProjects: number
  processingProjects: number
  avgProcessingTime: string
}

interface Team {
  id: string
  name: string
  member_count: number
  project_count: number
}

interface DashboardClientProps {
  user: SupabaseUser
  profile: Profile | null
  projects: Project[]
  stats: Stats
}

export function DashboardClient({ user, profile, projects, stats }: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await supabase
        .from("team_members")
        .select(`
          team:teams(*)
        `)
        .eq("user_id", user.id)

      if (data) {
        setTeams(data.map((item) => item.team))
      }
    }

    fetchTeams()
  }, [user.id, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", projectId)
    if (!error) {
      router.refresh()
    }
  }

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Less than an hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  const dashboardStats = [
    {
      title: "Total Projects",
      value: stats.totalProjects.toString(),
      change: "+2 this month",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      title: "Documentation Generated",
      value: stats.completedProjects.toString(),
      change: "+3 this week",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      title: "Team Members",
      value: teams.reduce((acc, team) => acc + (team.member_count || 0), 0).toString(),
      change: `${teams.length} teams`,
      icon: <Users className="w-4 h-4" />,
    },
    {
      title: "Processing Time",
      value: stats.avgProcessingTime,
      change: "-30s avg",
      icon: <Clock className="w-4 h-4" />,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FigmaDoc</span>
          </Link>
          <div className="flex items-center gap-3">
            <TeamSelector teams={teams} selectedTeam={selectedTeam} onTeamChange={setSelectedTeam} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/connect" className="flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect to Figma
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  {profile?.full_name || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/teams" className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Teams
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || user.email?.split("@")[0]}! Manage your design system documentation
            projects
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="collaboration">Team Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Projects</CardTitle>
                    <CardDescription>Manage and access your design system documentation</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button asChild>
                      <Link href="/connect">
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">Get started by connecting your first Figma file</p>
                    <Button asChild>
                      <Link href="/connect">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Connect to Figma
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{project.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(project.created_at)}
                              </span>
                              <span>Last updated {getTimeAgo(project.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(project.status)}
                          {project.status === "completed" && (
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/results?project=${project.id}`}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/results?project=${project.id}`} className="flex items-center">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions and updates on your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          project.status === "completed"
                            ? "bg-green-500"
                            : project.status === "processing"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {project.status === "completed"
                            ? "Documentation generated"
                            : project.status === "processing"
                              ? "Processing started"
                              : "Project created"}
                        </p>
                        <p className="text-sm text-muted-foreground">{project.name}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{getTimeAgo(project.updated_at)}</span>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaboration" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>Recent team activity and shared projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teams.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
                      <p className="text-muted-foreground mb-4">Create or join a team to collaborate on projects</p>
                      <Button asChild>
                        <Link href="/teams">
                          <Users className="w-4 h-4 mr-2" />
                          Manage Teams
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {teams.map((team) => (
                        <Card key={team.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">{team.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {team.member_count || 0} members • {team.project_count || 0} projects
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Activity
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/teams/${team.id}`}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
