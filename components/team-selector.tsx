"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, Settings } from "lucide-react"
import Link from "next/link"

interface Team {
  id: string
  name: string
  description?: string
  avatar_url?: string
  role: string
  member_count?: number
}

interface TeamSelectorProps {
  selectedTeamId?: string
  onTeamChange?: (teamId: string) => void
  showCreateButton?: boolean
}

export function TeamSelector({ selectedTeamId, onTeamChange, showCreateButton = true }: TeamSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams")
      const data = await response.json()

      if (data.success) {
        setTeams(data.teams)
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Workspace
        </CardTitle>
        <CardDescription>Select a team to collaborate on projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teams.length > 0 ? (
          <>
            <Select value={selectedTeamId} onValueChange={onTeamChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <span>Personal Workspace</span>
                  </div>
                </SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={team.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{team.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{team.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {team.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTeamId && selectedTeamId !== "personal" && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/teams/${selectedTeamId}/settings`}>
                    <Settings className="w-4 h-4 mr-2" />
                    Team Settings
                  </Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No teams yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a team to collaborate with others on design system documentation.
            </p>
          </div>
        )}

        {showCreateButton && (
          <Button className="w-full" asChild>
            <Link href="/teams/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
