"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Download,
  Share2,
  Play,
  Pause,
  RotateCcw,
  Palette,
  Type,
  Layout,
  Code,
  FileText,
  Users,
} from "lucide-react"

interface Slide {
  id: number
  title: string
  type: "cover" | "overview" | "colors" | "typography" | "components" | "guidelines" | "summary"
  content: React.ReactNode
}

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const slides: Slide[] = [
    {
      id: 1,
      title: "Design System Overview",
      type: "cover",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-8">
            <Palette className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Design System v2</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Comprehensive design system documentation and guidelines for consistent user experiences
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Generated from Figma</span>
            <span>•</span>
            <span>January 2024</span>
            <span>•</span>
            <span>FigmaDoc</span>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "System Overview",
      type: "overview",
      content: (
        <div className="p-12">
          <h2 className="text-4xl font-bold mb-8">What's Inside</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Color System</h3>
                  <p className="text-muted-foreground">12 carefully selected colors with usage guidelines</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Type className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Typography</h3>
                  <p className="text-muted-foreground">Consistent type scale and font families</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Layout className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Components</h3>
                  <p className="text-muted-foreground">24 reusable UI components with specifications</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Developer Guidelines</h3>
                  <p className="text-muted-foreground">Implementation guides and code examples</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Documentation</h3>
                  <p className="text-muted-foreground">Complete usage documentation and best practices</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Team Guidelines</h3>
                  <p className="text-muted-foreground">Collaboration and workflow recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Color System",
      type: "colors",
      content: (
        <div className="p-12">
          <h2 className="text-4xl font-bold mb-8">Color System</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Primary Colors</h3>
              <div className="grid grid-cols-4 gap-6">
                {[
                  { name: "Primary", value: "#a16207", bg: "bg-primary", usage: "Main actions, links" },
                  { name: "Secondary", value: "#d97706", bg: "bg-secondary", usage: "Secondary actions" },
                  { name: "Accent", value: "#f59e0b", bg: "bg-accent", usage: "Highlights, CTAs" },
                  { name: "Muted", value: "#fefce8", bg: "bg-muted", usage: "Backgrounds, cards" },
                ].map((color) => (
                  <div key={color.name} className="text-center">
                    <div className={`w-24 h-24 ${color.bg} rounded-xl mx-auto mb-4 shadow-lg`}></div>
                    <h4 className="font-semibold mb-1">{color.name}</h4>
                    <p className="text-sm font-mono text-muted-foreground mb-2">{color.value}</p>
                    <p className="text-xs text-muted-foreground">{color.usage}</p>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-2xl font-semibold mb-4">Usage Guidelines</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">✓ Do</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Use primary color for main actions</li>
                    <li>• Maintain sufficient contrast ratios</li>
                    <li>• Use muted colors for backgrounds</li>
                    <li>• Follow the established hierarchy</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">✗ Don't</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Mix colors from different palettes</li>
                    <li>• Use colors with poor accessibility</li>
                    <li>• Override brand colors arbitrarily</li>
                    <li>• Use too many colors in one interface</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Typography",
      type: "typography",
      content: (
        <div className="p-12">
          <h2 className="text-4xl font-bold mb-8">Typography System</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Font Families</h3>
              <div className="grid grid-cols-2 gap-8">
                <Card className="p-6">
                  <h4 className="font-bold text-xl mb-2">Geist Sans</h4>
                  <p className="text-muted-foreground mb-4">Primary font for headings and UI elements</p>
                  <div className="space-y-2">
                    <div className="font-light">Light (300)</div>
                    <div className="font-normal">Regular (400)</div>
                    <div className="font-medium">Medium (500)</div>
                    <div className="font-semibold">Semibold (600)</div>
                    <div className="font-bold">Bold (700)</div>
                  </div>
                </Card>
                <Card className="p-6">
                  <h4 className="font-mono font-bold text-xl mb-2">Geist Mono</h4>
                  <p className="text-muted-foreground mb-4">Monospace font for code and technical content</p>
                  <div className="space-y-2 font-mono">
                    <div className="font-light">Light (300)</div>
                    <div className="font-normal">Regular (400)</div>
                    <div className="font-medium">Medium (500)</div>
                    <div className="font-semibold">Semibold (600)</div>
                    <div className="font-bold">Bold (700)</div>
                  </div>
                </Card>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-2xl font-semibold mb-6">Type Scale</h3>
              <div className="space-y-4">
                <div className="flex items-baseline gap-8">
                  <div className="text-4xl font-bold">Heading 1</div>
                  <div className="text-sm text-muted-foreground">36px / 2.25rem</div>
                </div>
                <div className="flex items-baseline gap-8">
                  <div className="text-3xl font-bold">Heading 2</div>
                  <div className="text-sm text-muted-foreground">30px / 1.875rem</div>
                </div>
                <div className="flex items-baseline gap-8">
                  <div className="text-2xl font-bold">Heading 3</div>
                  <div className="text-sm text-muted-foreground">24px / 1.5rem</div>
                </div>
                <div className="flex items-baseline gap-8">
                  <div className="text-xl font-semibold">Heading 4</div>
                  <div className="text-sm text-muted-foreground">20px / 1.25rem</div>
                </div>
                <div className="flex items-baseline gap-8">
                  <div className="text-base">Body Text</div>
                  <div className="text-sm text-muted-foreground">16px / 1rem</div>
                </div>
                <div className="flex items-baseline gap-8">
                  <div className="text-sm">Small Text</div>
                  <div className="text-sm text-muted-foreground">14px / 0.875rem</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Implementation Guidelines",
      type: "guidelines",
      content: (
        <div className="p-12">
          <h2 className="text-4xl font-bold mb-8">Implementation Guidelines</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6">CSS Variables</h3>
              <Card className="p-6 bg-muted/50">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code>{`:root {
  --primary: #a16207;
  --secondary: #d97706;
  --accent: #f59e0b;
  --muted: #fefce8;
  --background: #ffffff;
  --foreground: #4b5563;
  --border: #e5e7eb;
  --radius: 0.5rem;
}`}</code>
                </pre>
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Component Usage</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Use semantic HTML elements</li>
                  <li>• Follow accessibility guidelines</li>
                  <li>• Maintain consistent spacing</li>
                  <li>• Use design tokens for styling</li>
                  <li>• Test across different screen sizes</li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">Best Practices</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Keep components modular and reusable</li>
                  <li>• Document component APIs clearly</li>
                  <li>• Use consistent naming conventions</li>
                  <li>• Implement proper error handling</li>
                  <li>• Optimize for performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "Next Steps",
      type: "summary",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center p-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-bold mb-6">Ready to Implement</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Your design system documentation is complete and ready for your team to use. Download the full documentation
            or integrate with your existing workflow.
          </p>
          <div className="flex items-center gap-4">
            <Button size="lg">
              <Download className="w-5 h-5 mr-2" />
              Download Documentation
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="w-5 h-5 mr-2" />
              Share with Team
            </Button>
          </div>
        </div>
      ),
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Header */}
      {!isFullscreen && (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">FigmaDoc</span>
              </div>
              <Badge variant="secondary">Presentation Mode</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentSlide(0)}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize className="w-4 h-4" />
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Presentation Area */}
      <div className="flex h-screen">
        {/* Slide Navigation */}
        {!isFullscreen && (
          <div className="w-64 border-r border-border bg-muted/30 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Slides</h3>
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentSlide === index ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <div className="text-sm font-medium">
                    {slide.id}. {slide.title}
                  </div>
                  <div className="text-xs opacity-75 capitalize">{slide.type}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Slide Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-white text-gray-900 relative overflow-hidden">{slides[currentSlide].content}</div>

          {/* Controls */}
          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={prevSlide} disabled={currentSlide === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentSlide + 1} of {slides.length}
                </span>
                <Button variant="outline" size="sm" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentSlide === index ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {isFullscreen && (
                  <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
                    Exit Fullscreen
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
