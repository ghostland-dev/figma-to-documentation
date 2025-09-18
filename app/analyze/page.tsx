"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileText, Palette, Type, Layout, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AnalysisStep {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export default function AnalyzePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState("")
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const router = useRouter()

  const analysisSteps: AnalysisStep[] = [
    {
      id: "connect",
      name: "Connecting to Figma",
      description: "Establishing connection with your Figma file",
      icon: <FileText className="w-5 h-5" />,
      completed: false,
    },
    {
      id: "extract",
      name: "Extracting Design Tokens",
      description: "Analyzing colors, typography, and spacing",
      icon: <Palette className="w-5 h-5" />,
      completed: false,
    },
    {
      id: "components",
      name: "Identifying Components",
      description: "Cataloging reusable design components",
      icon: <Layout className="w-5 h-5" />,
      completed: false,
    },
    {
      id: "typography",
      name: "Analyzing Typography",
      description: "Extracting text styles and hierarchies",
      icon: <Type className="w-5 h-5" />,
      completed: false,
    },
    {
      id: "generate",
      name: "Generating Documentation",
      description: "Creating comprehensive design system docs",
      icon: <Sparkles className="w-5 h-5" />,
      completed: false,
    },
  ]

  const [steps, setSteps] = useState(analysisSteps)

  useEffect(() => {
    // Check if we have connection data
    const connectionData = localStorage.getItem("figmaConnection")
    const accessToken = localStorage.getItem("figmaAccessToken")

    if (!connectionData || !accessToken) {
      router.push("/connect")
      return
    }

    // Auto-start analysis
    startAnalysis()
  }, [])

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    setError("")

    try {
      const connectionData = JSON.parse(localStorage.getItem("figmaConnection") || "{}")
      const accessToken = localStorage.getItem("figmaAccessToken")

      // Simulate analysis steps
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)
        setProgress((i / steps.length) * 100)

        // Update step as completed
        setSteps((prev) => prev.map((step, index) => (index === i ? { ...step, completed: true } : step)))

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      // Perform actual Figma analysis
      const response = await fetch("/api/figma/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKey: connectionData.fileKey,
          accessToken: accessToken,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store analysis results
        localStorage.setItem("designSystemAnalysis", JSON.stringify(data.designSystem))
        localStorage.setItem("figmaFileInfo", JSON.stringify(data.fileInfo))

        setProgress(100)
        setAnalysisComplete(true)

        // Redirect to results after a short delay
        setTimeout(() => {
          router.push("/results")
        }, 2000)
      } else {
        setError(data.error || "Analysis failed")
      }
    } catch (err) {
      setError("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (analysisComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Analysis Complete!</CardTitle>
            <CardDescription>Your design system has been analyzed. Redirecting to results...</CardDescription>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Analyzing Your Design System</h1>
            <p className="text-muted-foreground">
              Our AI is extracting design tokens and generating comprehensive documentation
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Progress</CardTitle>
              <CardDescription>Processing your Figma file to extract design system information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      index === currentStep && isAnalyzing
                        ? "border-primary bg-primary/5"
                        : step.completed
                          ? "border-green-200 bg-green-50"
                          : "border-border bg-muted/30"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 ${
                        step.completed
                          ? "text-green-600"
                          : index === currentStep && isAnalyzing
                            ? "text-primary"
                            : "text-muted-foreground"
                      }`}
                    >
                      {index === currentStep && isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : step.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{step.name}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {step.completed && (
                      <div className="text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
