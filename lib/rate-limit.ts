interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(identifier: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const key = identifier

  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return true
  }

  if (store[key].count >= limit) {
    return false
  }

  store[key].count++
  return true
}

export function getRateLimitInfo(identifier: string) {
  const entry = store[identifier]
  if (!entry) {
    return { remaining: 10, resetTime: Date.now() + 60000 }
  }

  return {
    remaining: Math.max(0, 10 - entry.count),
    resetTime: entry.resetTime,
  }
}
