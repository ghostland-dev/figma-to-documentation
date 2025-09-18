import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export interface AnalyticsEvent {
  event_type: string
  event_data?: Record<string, any>
  user_id?: string
}

export interface PerformanceMetric {
  metric_type: string
  metric_value: number
  metadata?: Record<string, any>
  user_id?: string
}

export interface ErrorLog {
  error_type: string
  error_message: string
  stack_trace?: string
  request_url?: string
  metadata?: Record<string, any>
  user_id?: string
}

export class MonitoringService {
  private supabase = createClient()

  async trackEvent(event: AnalyticsEvent) {
    try {
      const headersList = headers()
      const userAgent = headersList.get("user-agent")
      const forwardedFor = headersList.get("x-forwarded-for")
      const realIp = headersList.get("x-real-ip")
      const ip = forwardedFor?.split(",")[0] || realIp

      await this.supabase.from("analytics_events").insert({
        event_type: event.event_type,
        event_data: event.event_data || {},
        user_id: event.user_id,
        user_agent: userAgent,
        ip_address: ip,
        session_id: this.generateSessionId(),
      })
    } catch (error) {
      console.error("Failed to track event:", error)
    }
  }

  async recordPerformanceMetric(metric: PerformanceMetric) {
    try {
      await this.supabase.from("performance_metrics").insert({
        metric_type: metric.metric_type,
        metric_value: metric.metric_value,
        metadata: metric.metadata || {},
        user_id: metric.user_id,
      })
    } catch (error) {
      console.error("Failed to record performance metric:", error)
    }
  }

  async logError(errorLog: ErrorLog) {
    try {
      const headersList = headers()
      const userAgent = headersList.get("user-agent")
      const referer = headersList.get("referer")

      await this.supabase.from("error_logs").insert({
        error_type: errorLog.error_type,
        error_message: errorLog.error_message,
        stack_trace: errorLog.stack_trace,
        request_url: errorLog.request_url || referer,
        user_agent: userAgent,
        metadata: errorLog.metadata || {},
        user_id: errorLog.user_id,
      })
    } catch (error) {
      console.error("Failed to log error:", error)
    }
  }

  async updateSystemHealth(
    serviceName: string,
    status: "healthy" | "degraded" | "down",
    responseTime?: number,
    errorRate?: number,
  ) {
    try {
      await this.supabase.from("system_health").insert({
        service_name: serviceName,
        status,
        response_time_ms: responseTime,
        error_rate: errorRate,
        metadata: {
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || "1.0.0",
        },
      })
    } catch (error) {
      console.error("Failed to update system health:", error)
    }
  }

  async getAnalytics(userId: string, timeRange: "1h" | "24h" | "7d" | "30d" = "24h") {
    const timeMap = {
      "1h": "1 hour",
      "24h": "24 hours",
      "7d": "7 days",
      "30d": "30 days",
    }

    try {
      const { data: events } = await this.supabase
        .from("analytics_events")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", `now() - interval '${timeMap[timeRange]}'`)
        .order("created_at", { ascending: false })

      const { data: metrics } = await this.supabase
        .from("performance_metrics")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", `now() - interval '${timeMap[timeRange]}'`)
        .order("created_at", { ascending: false })

      const { data: errors } = await this.supabase
        .from("error_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", `now() - interval '${timeMap[timeRange]}'`)
        .order("created_at", { ascending: false })

      return { events, metrics, errors }
    } catch (error) {
      console.error("Failed to get analytics:", error)
      return { events: [], metrics: [], errors: [] }
    }
  }

  async getSystemHealth() {
    try {
      const { data } = await this.supabase
        .from("system_health")
        .select("*")
        .gte("created_at", `now() - interval '5 minutes'`)
        .order("created_at", { ascending: false })

      return data || []
    } catch (error) {
      console.error("Failed to get system health:", error)
      return []
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const monitoring = new MonitoringService()
