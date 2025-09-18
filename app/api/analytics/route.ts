import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { monitoring } from "@/lib/monitoring"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { event_type, event_data } = body

    if (!event_type) {
      return NextResponse.json({ error: "event_type is required" }, { status: 400 })
    }

    await monitoring.trackEvent({
      event_type,
      event_data: event_data || {},
      user_id: user.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    await monitoring.logError({
      error_type: "analytics_api_error",
      error_message: error instanceof Error ? error.message : "Analytics API error",
      stack_trace: error instanceof Error ? error.stack : undefined,
      request_url: "/api/analytics",
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = (searchParams.get("timeRange") as "1h" | "24h" | "7d" | "30d") || "24h"

    const analytics = await monitoring.getAnalytics(user.id, timeRange)

    return NextResponse.json(analytics)
  } catch (error) {
    await monitoring.logError({
      error_type: "analytics_get_error",
      error_message: error instanceof Error ? error.message : "Analytics GET error",
      stack_trace: error instanceof Error ? error.stack : undefined,
      request_url: "/api/analytics",
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
