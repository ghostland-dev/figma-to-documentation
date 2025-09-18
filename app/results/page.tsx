"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Share2,
  Palette,
  Code,
  Type,
  Layout,
  CheckCircle,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ExportFormat {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  size: string
}

interface DesignSystem {
  colors: { name: string; hex: string; usage: string }[]
  typography: { name: string; fontSize: number; fontFamily: string; fontWeight: number }[]
  spacing: { name: string; value: number }[]
  components: { name: string; type: string; description: string }[]
  effects: { name: string; type: string; properties: any }[]
}

export default function ResultsPage() {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["pdf"])
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null)
  const [fileInfo, setFileInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Load analysis results from localStorage
    const analysisData = localStorage.getItem("designSystemAnalysis")
    const figmaFileInfo = localStorage.getItem("figmaFileInfo")

    if (!analysisData) {
      // Redirect to connect page if no analysis data
      router.push("/connect")
      return
    }

    setDesignSystem(JSON.parse(analysisData))
    if (figmaFileInfo) {
      setFileInfo(JSON.parse(figmaFileInfo))
    }
  }, [router])

  const exportFormats: ExportFormat[] = [
    {
      id: "pdf",
      name: "PDF Document",
      description: "Complete documentation in PDF format",
      icon: <FileText className="w-4 h-4" />,
      size: "2.4 MB",
    },
    {
      id: "html",
      name: "HTML Website",
      description: "Interactive web documentation",
      icon: <Code className="w-4 h-4" />,
      size: "1.8 MB",
    },
    {
      id: "markdown",
      name: "Markdown Files",
      description: "Documentation in Markdown format",
      icon: <FileText className="w-4 h-4" />,
      size: "156 KB",
    },
    {
      id: "figma",
      name: "Figma Plugin",
      description: "Import back to Figma as documentation",
      icon: <Layout className="w-4 h-4" />,
      size: "892 KB",
    },
  ]

  const toggleFormat = (formatId: string) => {
    setSelectedFormats((prev) => (prev.includes(formatId) ? prev.filter((id) => id !== formatId) : [...prev, formatId]))
  }

  const handleDownload = () => {
    const downloadData = {
      designSystem,
      fileInfo,
      selectedFormats,
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `design-system-${fileInfo?.name || "documentation"}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!designSystem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/analyze">
              <Button variant="ghost" size="sm">
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
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/presentation">
                <Eye className="w-4 h-4 mr-2" />
                Present
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Success Message */}
        <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Documentation Generated Successfully!
                </h2>
                <p className="text-green-700 dark:text-green-300">
                  Your design system documentation is ready. Preview and download in your preferred formats.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Documentation Preview
                    </CardTitle>
                    <CardDescription>Preview of your generated design system documentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-border rounded-lg p-6 bg-muted/30">
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold mb-2">{fileInfo?.name || "Design System"} Documentation</h1>
                          <p className="text-muted-foreground">
                            Comprehensive guide to the design system extracted from your Figma file.
                          </p>
                        </div>

                        <Separator />

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Palette className="w-4 h-4" />
                              Color Palette ({designSystem.colors.length} colors)
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                              {designSystem.colors.slice(0, 8).map((color, index) => (
                                <div
                                  key={index}
                                  className="w-12 h-12 rounded-lg border border-border"
                                  style={{ backgroundColor: color.hex }}
                                  title={`${color.name}: ${color.hex}`}
                                ></div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Type className="w-4 h-4" />
                              Typography ({designSystem.typography.length} styles)
                            </h3>
                            <div className="space-y-2">
                              {designSystem.typography.slice(0, 3).map((typo, index) => (
                                <div
                                  key={index}
                                  style={{
                                    fontSize: `${Math.min(typo.fontSize, 24)}px`,
                                    fontFamily: typo.fontFamily,
                                    fontWeight: typo.fontWeight,
                                  }}
                                >
                                  {typo.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Layout className="w-4 h-4" />
                            Components ({designSystem.components.length} found)
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {designSystem.components.slice(0, 8).map((component, index) => (
                              <Badge key={index} variant="secondary" className="justify-center">
                                {component.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" asChild>
                        <Link href="/presentation">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Full Presentation
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="colors" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Color System
                    </CardTitle>
                    <CardDescription>Extracted colors and their usage guidelines</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">Extracted Colors</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {designSystem.colors.map((color, index) => (
                            <div key={index} className="text-center">
                              <div
                                className="w-16 h-16 rounded-lg mx-auto mb-2 border border-border"
                                style={{ backgroundColor: color.hex }}
                              ></div>
                              <p className="font-medium text-sm">{color.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                              <p className="text-xs text-muted-foreground mt-1">{color.usage}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-3">CSS Variables</h3>
                        <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                          <div className="space-y-1">
                            {designSystem.colors.slice(0, 10).map((color, index) => (
                              <div key={index}>
                                --{color.name.toLowerCase().replace(/\s+/g, "-")}: {color.hex};
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="typography" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="w-5 h-5" />
                      Typography System
                    </CardTitle>
                    <CardDescription>Font families, sizes, and usage guidelines</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">Text Styles</h3>
                        <div className="space-y-4">
                          {designSystem.typography.map((typo, index) => (
                            <div key={index} className="p-4 border border-border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">{typo.name}</h4>
                                <Badge variant="outline">{typo.fontSize}px</Badge>
                              </div>
                              <div
                                className="mb-2"
                                style={{
                                  fontSize: `${Math.min(typo.fontSize, 32)}px`,
                                  fontFamily: typo.fontFamily,
                                  fontWeight: typo.fontWeight,
                                }}
                              >
                                The quick brown fox jumps over the lazy dog
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {typo.fontFamily} • {typo.fontWeight} • {typo.fontSize}px
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="components" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="w-5 h-5" />
                      Components
                    </CardTitle>
                    <CardDescription>Identified components and their specifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {designSystem.components.map((component, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{component.name}</h4>
                            <Badge variant="outline">{component.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{component.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>Choose your preferred formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exportFormats.map((format) => (
                    <div
                      key={format.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFormats.includes(format.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleFormat(format.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {format.icon}
                          <div>
                            <p className="font-medium text-sm">{format.name}</p>
                            <p className="text-xs text-muted-foreground">{format.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {format.size}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-4" onClick={handleDownload} disabled={selectedFormats.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Selected ({selectedFormats.length})
                </Button>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source file:</span>
                    <span className="font-medium">{fileInfo?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Generated:</span>
                    <span className="font-medium">Just now</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Components:</span>
                    <span className="font-medium">{designSystem.components.length} found</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Colors:</span>
                    <span className="font-medium">{designSystem.colors.length} extracted</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Typography:</span>
                    <span className="font-medium">{designSystem.typography.length} styles</span>
                  </div>
                  {fileInfo?.version && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="font-medium">{fileInfo.version}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
