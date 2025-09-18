import { monitoring } from "./monitoring"

export class PerformanceTracker {
  private startTimes: Map<string, number> = new Map()

  startTimer(label: string) {
    this.startTimes.set(label, performance.now())
  }

  endTimer(label: string, userId?: string, metadata?: Record<string, any>) {
    const startTime = this.startTimes.get(label)
    if (startTime) {
      const duration = performance.now() - startTime
      this.startTimes.delete(label)

      monitoring.recordPerformanceMetric({
        metric_type: label,
        metric_value: duration,
        metadata: {
          ...metadata,
          unit: "milliseconds",
        },
        user_id: userId,
      })

      return duration
    }
    return 0
  }

  measureAsync<T>(label: string, fn: () => Promise<T>, userId?: string, metadata?: Record<string, any>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startTimer(label)
      try {
        const result = await fn()
        this.endTimer(label, userId, metadata)
        resolve(result)
      } catch (error) {
        this.endTimer(label, userId, { ...metadata, error: true })
        reject(error)
      }
    })
  }

  measureSync<T>(label: string, fn: () => T, userId?: string, metadata?: Record<string, any>): T {
    this.startTimer(label)
    try {
      const result = fn()
      this.endTimer(label, userId, metadata)
      return result
    } catch (error) {
      this.endTimer(label, userId, { ...metadata, error: true })
      throw error
    }
  }
}

export const performance = new PerformanceTracker()
