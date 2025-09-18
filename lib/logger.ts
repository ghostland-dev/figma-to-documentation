type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  userId?: string
  requestId?: string
  metadata?: Record<string, any>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"

  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...metadata,
    }

    if (this.isDevelopment) {
      console.log(`[${level.toUpperCase()}] ${message}`, metadata || "")
    } else {
      // In production, you'd send this to a logging service like DataDog, LogRocket, etc.
      console.log(JSON.stringify(entry))
    }
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log("info", message, metadata)
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log("warn", message, metadata)
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log("error", message, metadata)
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log("debug", message, metadata)
  }
}

export const logger = new Logger()
