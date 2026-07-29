/**
 * Password Authentication Strategy
 *
 * Handles email/password login with:
 * - Constant-time comparison (bcrypt handles this)
 * - Failed attempt tracking + account lockout
 * - Timing attack mitigation (hash even when user not found)
 */

import bcrypt from "bcryptjs";
import pool from "../../config/database.js";
import { BaseAuthStrategy, AuthError } from "./base.strategy.js";

// Pre-computed hash for timing attack mitigation when user doesn't exist
const DUMMY_HASH = "$2a$12$LJ3m9blCPZwbG.PoN2cxqOGNAJvFDfHFn1g7rGyJEsYSfl6/6M.s2";

export class PasswordStrategy extends BaseAuthStrategy {
  constructor() {
    super("password");
  }

  /**
   * Authenticate with email + password.
   * @param {{ email: string, password: string }} payload
   * @param {object} config - { max_failed_attempts, lockout_duration_min }
   * @returns {Promise<{ user: object }>}
   */
  async authenticate(payload, config) {
    const { email, password } = payload;

    if (!email || !password) {
      throw new AuthError("Email and password are required", 400, "MISSING_CREDENTIALS");
    }

    // Find user
    const [rows] = await pool.execute(
      `SELECT id, email, email_verified, password_hash, name, role, avatar,
              failed_login_attempts, locked_until, created_at
       FROM users WHERE email = ? AND deleted_at IS NULL`,
      [email],
    );

    const user = rows[0] || null;

    // Check account lock BEFORE password verify
    if (user && user.locked_until) {
      const lockExpiry = new Date(user.locked_until);
      if (lockExpiry > new Date()) {
        const retryAfter = Math.ceil((lockExpiry - Date.now()) / 1000);
        throw new AuthError(
          "Account temporarily locked due to too many failed attempts",
          423,
          "ACCOUNT_LOCKED",
          { retry_after: retryAfter },
        );
      }
      // Lock expired — reset it
      await pool.execute(
        "UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = ?",
        [user.id],
      );
      user.failed_login_attempts = 0;
    }

    // Constant-time password check (use dummy hash if user not found)
    const hashToCompare = user?.password_hash || DUMMY_HASH;
    const isValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isValid) {
      // Track failed attempt if user exists
      if (user) {
        await this.handleFailedAttempt(user, config);
      }
      throw new AuthError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    // Success — reset failed attempts
    if (user.failed_login_attempts > 0) {
      await pool.execute(
        "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?",
        [user.id],
      );
    }

    // Update authentication_methods last_used_at
    await pool.execute(
      `INSERT INTO authentication_methods (id, user_id, method_type, is_primary, last_used_at)
       VALUES (UUID(), ?, 'password', TRUE, NOW())
       ON DUPLICATE KEY UPDATE last_used_at = NOW()`,
      [user.id],
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
    };
  }

  /**
   * Handle a failed login attempt — increment counter, possibly lock.
   * @param {object} user
   * @param {object} config
   */
  async handleFailedAttempt(user, config) {
    const maxAttempts = config?.max_failed_attempts || 10;
    const lockoutMinutes = config?.lockout_duration_min || 30;
    const newCount = (user.failed_login_attempts || 0) + 1;

    if (newCount >= maxAttempts) {
      // Lock the account
      const lockUntil = new Date(Date.now() + lockoutMinutes * 60_000);
      await pool.execute(
        "UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?",
        [newCount, lockUntil, user.id],
      );
    } else {
      await pool.execute(
        "UPDATE users SET failed_login_attempts = ? WHERE id = ?",
        [newCount, user.id],
      );
    }
  }
}
