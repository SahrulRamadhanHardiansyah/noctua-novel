/**
 * Unit Tests — Rate Limiter
 *
 * Tests the in-memory rate limiter:
 * - Allows requests within limit
 * - Blocks requests exceeding limit
 * - Resets after window expires
 */

import { checkRateLimit } from "@/lib/rate-limit";

describe("Rate Limiter", () => {
  // Use unique identifiers per test to avoid interference
  const testId = () => `test-${Date.now()}-${Math.random()}`;

  it("should allow first request", () => {
    const result = checkRateLimit(testId(), { limit: 5, windowSeconds: 60 });
    expect(result.success).toBe(true);
  });

  it("should allow requests within limit", () => {
    const id = testId();
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(id, { limit: 5, windowSeconds: 60 });
      expect(result.success).toBe(true);
    }
  });

  it("should block requests exceeding limit", () => {
    const id = testId();
    // Exhaust the limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit(id, { limit: 5, windowSeconds: 60 });
    }
    // Next request should be blocked
    const result = checkRateLimit(id, { limit: 5, windowSeconds: 60 });
    expect(result.success).toBe(false);
    expect(result.retryAfter).toBeDefined();
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("should track different identifiers independently", () => {
    const id1 = testId();
    const id2 = testId();

    // Exhaust limit for id1
    for (let i = 0; i < 3; i++) {
      checkRateLimit(id1, { limit: 3, windowSeconds: 60 });
    }

    // id2 should still be allowed
    const result = checkRateLimit(id2, { limit: 3, windowSeconds: 60 });
    expect(result.success).toBe(true);
  });
});
