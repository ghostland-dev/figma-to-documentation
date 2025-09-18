import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import type { ZodSchema } from "zod"

export interface ApiError {
  message: string
  code: string
  statusCode: number
}

export class ApiException extends Error {
  constructor(
    public message: string,
    public statusCode = 500,
    public code = "INTERNAL_ERROR",
  ) {
    super(message)
    this.name = "ApiException"
  }
}

export function createErrorResponse(error: ApiException | Error, requestId?: string) {
  const isDevelopment = process.env.NODE_ENV === "development"

  if (error instanceof ApiException) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          ...(isDevelopment && { stack: error.stack }),
        },
        requestId,
      },
      { status: error.statusCode },
    )
  }

  // Don't expose internal errors in production
  const message = isDevelopment ? error.message : "Internal server error"
  return NextResponse.json(
    {
      error: {
        message,
        code: "INTERNAL_ERROR",
        ...(isDevelopment && { stack: error.stack }),
      },
      requestId,
    },
    { status: 500 },
  )
}

export async function withAuth(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApiException("Authentication required", 401, "UNAUTHORIZED")
  }

  return { user, supabase }
}

export function withRateLimit(request: NextRequest, limit = 10, windowMs = 60000) {
  const identifier = request.ip || request.headers.get("x-forwarded-for") || "anonymous"

  if (!rateLimit(identifier, limit, windowMs)) {
    throw new ApiException("Too many requests", 429, "RATE_LIMIT_EXCEEDED")
  }

  return identifier
}

export async function withValidation<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiException(`Validation error: ${error.message}`, 400, "VALIDATION_ERROR")
    }
    throw new ApiException("Invalid request body", 400, "VALIDATION_ERROR")
  }
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function apiHandler(
  request: NextRequest,
  handler: (request: NextRequest, context: { requestId: string }) => Promise<NextResponse>,
) {
  const requestId = generateRequestId()

  try {
    logger.info("API request started", {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get("user-agent"),
    })

    const response = await handler(request, { requestId })

    logger.info("API request completed", {
      requestId,
      status: response.status,
    })

    return response
  } catch (error) {
    logger.error("API request failed", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    return createErrorResponse(error as Error, requestId)
  }
}
