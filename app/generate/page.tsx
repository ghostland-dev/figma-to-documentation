"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, Palette, Code, Presentation, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface GenerationOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const router = useRouter()

  const [options, setOptions] = useState<GenerationOption[]>([
    {
      id: "design-system",
      title: "Design System Documentation",
      description: "Complete documentation of colors, typography, spacing, and components",
      icon: <Palette className="w-5 h-5" />,
      enabled: true,
    },
    {
      id: "dev-guidelines",
      title: "Developer Guidelines",
      description: "CSS variables, component specs, and implementation guides",
      icon: <Code className="w-5 h-5" />,
      enabled: true,
    },
    {
      id: "presentation",
      title: "Professional Presentation",
      description: "Client-ready presentation with design system overview",
      icon: <Presentation className="w-5 h-5" />,
      enabled: false,
    },
    {
      id: "style-guide",
      title: "Style Guide",
      description: "Visual style guide with usage examples and best practices",
      icon: <FileText className="w-5 h-5" />,
      enabled: true,
    },
  ])

  const toggleOption = (id: string) => {
    setOptions((prev) => prev.map((option) => (option.id === id ? { ...option, enabled: !option.enabled } : option)))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate generation progress
    const steps = [
      "Analyzing Figma file structure...",
      "Extracting design tokens...",
      "Processing components...",
      "Generating documentation...",
      "Creating developer guidelines...",
      "Finalizing output...",
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setGenerationProgress(((i + 1) / steps.length) * 100)
    }

    // Redirect to results
    router.push("/results")
  }

  const enabledOptions = options.filter((option) => option.enabled)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/upload">
              <Button variant="ghost" size="sm" disabled={isGenerating}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">FigmaDoc</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generate Documentation</h1>
          <p className="text-muted-foreground">Choose what you'd like to generate from your Figma design system</p>
        </div>

        {!isGenerating ? (
          <>
            {/* File Info */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Source File</CardTitle>
                <CardDescription>The Figma file that will be processed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">Design System v2.fig</p>
                    <p className="text-sm text-muted-foreground">2.4 MB • Uploaded 5 minutes ago</p>
                  </div>
                  <Badge className="ml-auto">Ready</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Generation Options */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>What would you like to generate?</CardTitle>
                <CardDescription>Select the documentation types you need</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {options.map((option) => (
                    <div key={option.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={option.id}
                        checked={option.enabled}
                        onCheckedChange={() => toggleOption(option.id)}
                      />
                      <div className="flex-1">
                        <label htmlFor={option.id} className="flex items-center gap-2 font-medium cursor-pointer">
                          {option.icon}
                          {option.title}
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Generation Summary</CardTitle>
                <CardDescription>Review what will be generated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Selected options:</span>
                    <span className="font-medium">{enabledOptions.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated time:</span>
                    <span className="font-medium">2-3 minutes</span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {enabledOptions.map((option) => (
                      <div key={option.id} className="flex items-center gap-2 text-sm">
                        {option.icon}
                        <span>{option.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button size="lg" onClick={handleGenerate} disabled={enabledOptions.length === 0} className="px-8">
                <Download className="w-5 h-5 mr-2" />
                Generate Documentation
              </Button>
            </div>
          </>
        ) : (
          /* Generation Progress */
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Generating Your Documentation</h2>
              <p className="text-muted-foreground mb-6">
                Our AI is analyzing your design system and creating comprehensive documentation...
              </p>
              <div className="w-full bg-secondary rounded-full h-3 mb-4">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{Math.round(generationProgress)}% complete</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
