/**
 * In-Memory Sliding Window Rate Limiter
 * Replacement for Redis-based rate limiting in development.
 *
 * NOTE: This is process-local — does not work across multiple instances.
 * Swap to Redis implementation for production clustering.
 */

class SlidingWindowCounter {
  constructor() {
    /** @type {Map<string, number[]>} key -> sorted array of timestamps */
    this.windows = new Map();
    // Cleanup stale entries every 60s to prevent memory leaks
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
    this.cleanupInterval.unref(); // Don't keep process alive
  }

  /**
   * Check if a request is allowed under the rate limit.
   * @param {string} key - Unique identifier (e.g. "login:ip:127.0.0.1")
   * @param {number} limit - Maximum requests allowed in window
   * @param {number} windowMs - Window duration in milliseconds
   * @returns {{ allowed: boolean, remaining: number, retryAfter: number|null }}
   */
  check(key, limit, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or initialize timestamps array
    let timestamps = this.windows.get(key);
    if (!timestamps) {
      timestamps = [];
      this.windows.set(key, timestamps);
    }

    // Remove expired entries (before window start)
    while (timestamps.length > 0 && timestamps[0] <= windowStart) {
      timestamps.shift();
    }

    const currentCount = timestamps.length;

    if (currentCount >= limit) {
      // Calculate when the oldest request in window expires
      const oldestInWindow = timestamps[0];
      const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
        total: limit,
      };
    }

    // Record this request
    timestamps.push(now);

    return {
      allowed: true,
      remaining: limit - currentCount - 1,
      retryAfter: null,
      total: limit,
    };
  }

  /**
   * Consume a slot without checking (for manual tracking like failed attempts).
   * @param {string} key
   * @param {number} windowMs
   */
  record(key, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = this.windows.get(key);
    if (!timestamps) {
      timestamps = [];
      this.windows.set(key, timestamps);
    }

    // Clean expired
    while (timestamps.length > 0 && timestamps[0] <= windowStart) {
      timestamps.shift();
    }

    timestamps.push(now);
  }

  /**
   * Get current count for a key within window.
   * @param {string} key
   * @param {number} windowMs
   * @returns {number}
   */
  count(key, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = this.windows.get(key);
    if (!timestamps) return 0;

    // Clean expired
    while (timestamps.length > 0 && timestamps[0] <= windowStart) {
      timestamps.shift();
    }

    return timestamps.length;
  }

  /**
   * Reset a specific key (e.g., after successful login).
   * @param {string} key
   */
  reset(key) {
    this.windows.delete(key);
  }

  /**
   * Remove all stale entries older than 30 minutes.
   */
  cleanup() {
    const cutoff = Date.now() - 30 * 60 * 1000;
    for (const [key, timestamps] of this.windows.entries()) {
      // Remove expired timestamps
      while (timestamps.length > 0 && timestamps[0] <= cutoff) {
        timestamps.shift();
      }
      // Remove empty keys
      if (timestamps.length === 0) {
        this.windows.delete(key);
      }
    }
  }

  /**
   * Destroy the limiter and clear the cleanup interval.
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.windows.clear();
  }
}

// Singleton instance — shared across the app
const rateLimiter = new SlidingWindowCounter();

export default rateLimiter;

/**
 * Pre-defined limit configurations for auth endpoints.
 * Centralized here for easy tuning.
 */
export const AUTH_LIMITS = {
  // Global per-IP limit for all auth endpoints
  AUTH_GLOBAL: { limit: 30, windowMs: 60_000 }, // 30 req/min

  // Login attempts per email+ip combo
  LOGIN_ATTEMPT: { limit: 5, windowMs: 15 * 60_000 }, // 5 fails/15min

  // OTP request per email
  OTP_REQUEST: { limit: 3, windowMs: 15 * 60_000 }, // 3 requests/15min

  // OTP verify per email (per session)
  OTP_VERIFY: { limit: 5, windowMs: 5 * 60_000 }, // 5 attempts/5min

  // Social login per IP (generous, mostly for abuse prevention)
  SOCIAL_LOGIN: { limit: 10, windowMs: 5 * 60_000 }, // 10 req/5min
};
