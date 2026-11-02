import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { monitoring } from "@/lib/monitoring"

export async function GET() {
  const startTime = Date.now()
  const health = {
    status: "healthy" as const,
    timestamp: new Date().toISOString(),
    services: {} as Record<string, any>,
    version: process.env.npm_package_version || "1.0.0",
  }

  try {
    // Check database connection
    const supabase = await createClient()
    const dbStart = Date.now()
    const { error: dbError } = await supabase.from("profiles").select("count").limit(1).single()
    const dbResponseTime = Date.now() - dbStart

    health.services.database = {
      status: dbError ? "down" : "healthy",
      responseTime: dbResponseTime,
      error: dbError?.message,
    }

    // Check Figma API (mock check)
    const figmaStart = Date.now()
    try {
      // This would be a real health check to Figma API
      const figmaResponseTime = Date.now() - figmaStart
      health.services.figma = {
        status: "healthy",
        responseTime: figmaResponseTime,
      }
    } catch (error) {
      health.services.figma = {
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }

    // Determine overall health
    const serviceStatuses = Object.values(health.services).map((s) => s.status)
    if (serviceStatuses.includes("down")) {
      health.status = "down"
    } else if (serviceStatuses.includes("degraded")) {
      health.status = "degraded"
    }

    // Log health status
    await monitoring.updateSystemHealth(
      "api",
      health.status,
      Date.now() - startTime,
      (serviceStatuses.filter((s) => s !== "healthy").length / serviceStatuses.length) * 100,
    )

    return NextResponse.json(health, {
      status: health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503,
    })
  } catch (error) {
    health.status = "down"
    health.services.api = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown error",
    }

    await monitoring.logError({
      error_type: "health_check_failed",
      error_message: error instanceof Error ? error.message : "Health check failed",
      stack_trace: error instanceof Error ? error.stack : undefined,
      request_url: "/api/health",
    })

    return NextResponse.json(health, { status: 503 })
  }
}
