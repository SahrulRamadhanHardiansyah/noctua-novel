/**
 * Simple in-memory rate limiter for API routes.
 * For production, swap with Redis-backed implementation.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

export interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

/**
 * Check if a request should be rate-limited.
 * Returns { success: true } if allowed, { success: false, retryAfter } if limited.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = `${identifier}`;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return { success: true };
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { success: false, retryAfter };
  }

  entry.count++;
  return { success: true };
}

/** Rate limit presets for different endpoint types */
export const RATE_LIMITS = {
  /** Comment/review creation: 10 per minute */
  create: { limit: 10, windowSeconds: 60 },
  /** Authenticated reads: 60 per minute */
  read: { limit: 60, windowSeconds: 60 },
  /** Daily check-in: 3 per minute (prevent spam) */
  checkin: { limit: 3, windowSeconds: 60 },
  /** Achievement/gamification: 30 per minute */
  gamification: { limit: 30, windowSeconds: 60 },
} as const;
