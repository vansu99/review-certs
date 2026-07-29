/**
 * Rate Limiting Middleware
 *
 * Express middleware wrapping the in-memory sliding window rate limiter.
 * Adds standard rate limit headers to responses.
 *
 * Usage:
 *   router.post('/login', rateLimit('LOGIN_ATTEMPT', keyFromEmailAndIp), handler)
 *   router.post('/otp/request', rateLimit('OTP_REQUEST', keyFromEmail), handler)
 */

import rateLimiter, { AUTH_LIMITS } from "../utils/rateLimiter.js";
import { errorResponse } from "../utils/response.js";

/**
 * Create a rate limiting middleware.
 *
 * @param {keyof typeof AUTH_LIMITS} limitName - Pre-defined limit config name
 * @param {(req: import('express').Request) => string} keyFn - Function to extract rate limit key from request
 * @returns {import('express').RequestHandler}
 */
export function rateLimit(limitName, keyFn) {
  const config = AUTH_LIMITS[limitName];
  if (!config) {
    throw new Error(`Unknown rate limit config: ${limitName}`);
  }

  return (req, res, next) => {
    const key = `${limitName}:${keyFn(req)}`;
    const result = rateLimiter.check(key, config.limit, config.windowMs);

    // Always set rate limit headers
    res.set("X-RateLimit-Limit", String(result.total));
    res.set("X-RateLimit-Remaining", String(result.remaining));

    if (!result.allowed) {
      res.set("Retry-After", String(result.retryAfter));
      res.set("X-RateLimit-Reset", String(result.retryAfter));

      return errorResponse(
        res,
        "Too many requests. Please try again later.",
        429,
        { retry_after: result.retryAfter },
      );
    }

    next();
  };
}

// ─── Common key extractors ───────────────────────────────────────────────────

/**
 * Rate limit key from client IP address.
 * @param {import('express').Request} req
 * @returns {string}
 */
export function keyFromIp(req) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Rate limit key from request body email field.
 * @param {import('express').Request} req
 * @returns {string}
 */
export function keyFromEmail(req) {
  return (req.body?.email || "unknown").toLowerCase();
}

/**
 * Rate limit key combining email + IP (stricter, per-identity-per-location).
 * @param {import('express').Request} req
 * @returns {string}
 */
export function keyFromEmailAndIp(req) {
  const email = (req.body?.email || "unknown").toLowerCase();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  return `${email}:${ip}`;
}
