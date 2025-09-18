"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ExternalLink, CheckCircle, AlertCircle, Info, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface ConnectClientProps {
  user: SupabaseUser
}

export function ConnectClient({ user }: ConnectClientProps) {
  const [figmaUrl, setFigmaUrl] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [projectName, setProjectName] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const isValidFigmaUrl = (url: string) => {
    return /\/(?:file|design)\/([a-zA-Z0-9_-]+)/.test(url)
  }

  const handleConnect = async () => {
    if (!figmaUrl || !accessToken) {
      setError("Please provide both Figma URL and access token")
      return
    }

    if (!isValidFigmaUrl(figmaUrl)) {
      setError("Please enter a valid Figma file or design URL (e.g., https://www.figma.com/design/...)")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      const response = await fetch("/api/figma/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          figmaUrl,
          accessToken,
          projectName: projectName || "Untitled Project",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(data.error || "Failed to connect to Figma")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Connected Successfully!</CardTitle>
            <CardDescription>Your Figma file has been connected and saved. Redirecting to dashboard...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">F</span>
            </div>
            <span className="text-xl font-bold">FigmaDoc</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Connect Your Figma File</h1>
            <p className="text-muted-foreground">
              Connect directly to your Figma workspace to analyze your design system
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Figma Connection</CardTitle>
              <CardDescription>Provide your Figma file URL and personal access token to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name (Optional)</Label>
                <Input
                  id="project-name"
                  placeholder="My Design System"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Give your project a custom name for easy identification</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="figma-url">Figma File URL</Label>
                <Input
                  id="figma-url"
                  placeholder="https://www.figma.com/design/VqvQEszLtkF9kWStHPqLn6/..."
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className={!isValidFigmaUrl(figmaUrl) && figmaUrl ? "border-destructive" : ""}
                />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Copy the URL from your Figma file's address bar</p>
                  {figmaUrl && !isValidFigmaUrl(figmaUrl) && (
                    <p className="text-sm text-destructive">Please enter a valid Figma URL</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-token">Personal Access Token</Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="figd_..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Generate a token in your{" "}
                  <Link
                    href="https://www.figma.com/developers/api#access-tokens"
                    target="_blank"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Figma account settings
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Supported URL formats:</strong>
                  <br />• https://www.figma.com/file/[file-key]/[file-name]
                  <br />• https://www.figma.com/design/[file-key]/[file-name]
                </AlertDescription>
              </Alert>

              <Button onClick={handleConnect} disabled={isConnecting || !figmaUrl || !accessToken} className="w-full">
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect to Figma"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
