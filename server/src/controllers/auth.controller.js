/**
 * Auth Controller
 *
 * Handles all authentication endpoints by delegating to the appropriate
 * strategy from the registry. Feature flag checks happen at middleware level.
 */

import pool from "../config/database.js";
import { v4 as uuidv4 } from "uuid";
import { generateToken } from "../middleware/auth.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { getEnabledMethods, getAuthConfig } from "../services/authConfig.service.js";
import registry from "../services/auth/index.js";
import { AuthError } from "../services/auth/base.strategy.js";
import rateLimiter from "../utils/rateLimiter.js";

// ─── Helper: Log auth event ──────────────────────────────────────────────────

async function logAuthEvent(userId, eventType, method, req, metadata = {}) {
  try {
    await pool.execute(
      `INSERT INTO auth_logs (id, user_id, event_type, method, ip_address, user_agent, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        userId,
        eventType,
        method,
        req.ip || req.socket.remoteAddress || null,
        req.headers["user-agent"] || null,
        JSON.stringify(metadata),
      ],
    );
  } catch (err) {
    // Non-critical — don't fail the request if logging fails
    console.error("[Auth Log] Failed to write auth log:", err.message);
  }
}

// ─── Helper: Build response with token ───────────────────────────────────────

function buildAuthResponse(user, isNewUser = false) {
  const accessToken = generateToken(user);
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };

  const response = { user: userData, accessToken };
  if (isNewUser) response.isNewUser = true;

  return response;
}

// ─── GET /api/auth/methods ───────────────────────────────────────────────────

/**
 * Returns available (enabled) auth methods for the frontend to render.
 */
export async function getAvailableMethods(req, res, next) {
  try {
    const methods = await getEnabledMethods();

    // Strip sensitive config fields (secrets) before sending to client
    const sanitized = methods.map((m) => ({
      type: m.auth_method,
      priority: m.priority,
    }));

    return successResponse(res, { methods: sanitized });
  } catch (error) {
    next(error);
  }
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────

/**
 * Password-based login.
 * Feature flag + rate limit checked at middleware level.
 */
export async function login(req, res, next) {
  try {
    const strategy = registry.get("password");
    const result = await strategy.authenticate(req.body, req.authMethodConfig);

    // Reset rate limiter on success
    const email = (req.body.email || "").toLowerCase();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    rateLimiter.reset(`LOGIN_ATTEMPT:${email}:${ip}`);

    await logAuthEvent(result.user.id, "login_success", "password", req);

    const response = buildAuthResponse(result.user);
    return successResponse(res, response, "Login successful");
  } catch (error) {
    if (error instanceof AuthError) {
      // Log failed attempt
      await logAuthEvent(null, "login_failed", "password", req, {
        email: req.body.email,
        reason: error.code,
      });

      return errorResponse(res, error.message, error.statusCode, error.extra);
    }
    next(error);
  }
}

// ─── POST /api/auth/otp/request ──────────────────────────────────────────────

/**
 * Request an OTP code to be sent to email.
 */
export async function requestOtp(req, res, next) {
  try {
    const strategy = registry.get("otp");
    const result = await strategy.requestOtp(req.body.email, req.authMethodConfig);

    await logAuthEvent(null, "otp_requested", "otp", req, {
      email: req.body.email,
    });

    return successResponse(res, result);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(res, error.message, error.statusCode, error.extra);
    }
    next(error);
  }
}

// ─── POST /api/auth/otp/verify ───────────────────────────────────────────────

/**
 * Verify OTP code and login/register user.
 */
export async function verifyOtp(req, res, next) {
  try {
    const strategy = registry.get("otp");
    const result = await strategy.authenticate(req.body, req.authMethodConfig);

    // Reset OTP rate limiter on success
    const email = (req.body.email || "").toLowerCase();
    rateLimiter.reset(`OTP_VERIFY:${email}`);
    rateLimiter.reset(`OTP_REQUEST:${email}`);

    await logAuthEvent(result.user.id, "login_success", "otp", req, {
      is_new_user: result.isNewUser,
    });

    const response = buildAuthResponse(result.user, result.isNewUser);
    const message = result.isNewUser ? "Account created successfully" : "Login successful";
    return successResponse(res, response, message, result.isNewUser ? 201 : 200);
  } catch (error) {
    if (error instanceof AuthError) {
      await logAuthEvent(null, "otp_verify_failed", "otp", req, {
        email: req.body.email,
        reason: error.code,
      });
      return errorResponse(res, error.message, error.statusCode, error.extra);
    }
    next(error);
  }
}

// ─── GET /api/auth/social/:provider ──────────────────────────────────────────

/**
 * Initiate OAuth flow — redirect user to provider's authorization page.
 */
export async function socialRedirect(req, res, next) {
  try {
    const { provider } = req.params;
    const methodKey = `social_${provider}`;

    // Check feature flag manually here (since provider is dynamic)
    const config = await getAuthConfig(methodKey);
    if (!config || !config.enabled) {
      return errorResponse(res, `Social login with ${provider} is disabled`, 403);
    }

    const strategy = registry.get(methodKey);
    if (!strategy) {
      return errorResponse(res, `Unsupported provider: ${provider}`, 400);
    }

    const { url } = strategy.getAuthUrl(config.config);
    return res.redirect(url);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(res, error.message, error.statusCode, error.extra);
    }
    next(error);
  }
}

// ─── GET /api/auth/social/:provider/callback ─────────────────────────────────

/**
 * Handle OAuth callback — exchange code, find/create user, return token.
 */
export async function socialCallback(req, res, next) {
  try {
    const { provider } = req.params;
    const methodKey = `social_${provider}`;

    const config = await getAuthConfig(methodKey);
    if (!config || !config.enabled) {
      return errorResponse(res, `Social login with ${provider} is disabled`, 403);
    }

    const strategy = registry.get(methodKey);
    if (!strategy) {
      return errorResponse(res, `Unsupported provider: ${provider}`, 400);
    }

    const { code, state, error: oauthError } = req.query;

    // Provider returned an error (user denied, etc.)
    if (oauthError) {
      await logAuthEvent(null, "social_auth_denied", methodKey, req, {
        provider,
        error: oauthError,
      });
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/login?error=social_denied&provider=${provider}`);
    }

    const result = await strategy.authenticate({ code, state }, config.config);

    await logAuthEvent(result.user.id, "login_success", methodKey, req, {
      provider,
      is_new_user: result.isNewUser,
    });

    // For OAuth callback, redirect to frontend with token
    // (Can't return JSON directly since this is a browser redirect flow)
    const accessToken = generateToken(result.user);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const params = new URLSearchParams({
      token: accessToken,
      isNewUser: result.isNewUser ? "1" : "0",
    });

    return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  } catch (error) {
    if (error instanceof AuthError) {
      await logAuthEvent(null, "social_auth_failed", `social_${req.params.provider}`, req, {
        reason: error.code,
      });
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(
        `${frontendUrl}/login?error=${error.code}&provider=${req.params.provider}`,
      );
    }
    next(error);
  }
}

// ─── POST /api/auth/logout ───────────────────────────────────────────────────

/**
 * Logout current user.
 * For JWT-based auth, client removes the token.
 * Server-side: log the event, could invalidate refresh tokens here.
 */
export async function logout(req, res) {
  await logAuthEvent(req.user.id, "logout", null, req);
  return successResponse(res, null, "Logout successful");
}

// ─── GET /api/auth/profile ───────────────────────────────────────────────────

/**
 * Get current user profile with linked auth methods.
 */
export async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, email, email_verified, name, role, avatar, phone, gender, 
              date_of_birth, country, facebook, created_at
       FROM users WHERE id = ? AND deleted_at IS NULL`,
      [req.user.id],
    );

    if (rows.length === 0) {
      return errorResponse(res, "User not found", 404);
    }

    const user = rows[0];

    // Get linked auth methods
    const [methods] = await pool.execute(
      "SELECT method_type, is_primary, last_used_at FROM authentication_methods WHERE user_id = ? AND enabled = TRUE",
      [req.user.id],
    );

    // Get linked social accounts
    const [socials] = await pool.execute(
      "SELECT provider, provider_email, provider_name, created_at FROM social_accounts WHERE user_id = ?",
      [req.user.id],
    );

    const userData = {
      id: user.id,
      email: user.email,
      emailVerified: Boolean(user.email_verified),
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.date_of_birth,
      country: user.country,
      facebook: user.facebook,
      createdAt: user.created_at,
      authMethods: methods.map((m) => ({
        type: m.method_type,
        isPrimary: Boolean(m.is_primary),
        lastUsedAt: m.last_used_at,
      })),
      socialAccounts: socials.map((s) => ({
        provider: s.provider,
        email: s.provider_email,
        name: s.provider_name,
        linkedAt: s.created_at,
      })),
    };

    return successResponse(res, userData);
  } catch (error) {
    next(error);
  }
}

// ─── PUT /api/auth/profile ───────────────────────────────────────────────────

/**
 * Update current user profile.
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, gender, dateOfBirth, country, facebook } = req.body;

    const name = `${firstName || ""} ${lastName || ""}`.trim();

    await pool.execute(
      `UPDATE users SET 
        name = ?,
        phone = ?,
        gender = ?,
        date_of_birth = ?,
        country = ?,
        facebook = ?
      WHERE id = ?`,
      [
        name,
        phone || null,
        gender || null,
        dateOfBirth || null,
        country || null,
        facebook || null,
        userId,
      ],
    );

    // Fetch updated user
    const [rows] = await pool.execute(
      `SELECT id, email, email_verified, name, role, avatar, phone, gender, 
              date_of_birth, country, facebook, created_at
       FROM users WHERE id = ? AND deleted_at IS NULL`,
      [userId],
    );

    if (rows.length === 0) {
      return errorResponse(res, "User not found", 404);
    }

    const user = rows[0];
    const userData = {
      id: user.id,
      email: user.email,
      emailVerified: Boolean(user.email_verified),
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.date_of_birth,
      country: user.country,
      facebook: user.facebook,
      createdAt: user.created_at,
    };

    return successResponse(res, userData, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
}
