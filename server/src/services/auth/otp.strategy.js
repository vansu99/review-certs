/**
 * OTP (One-Time Password) Authentication Strategy
 *
 * Two-phase flow:
 * 1. requestOtp(email) — generate code, store hash, send email
 * 2. authenticate({ email, code }) — verify code, return user
 *
 * Security:
 * - Code stored as SHA-256 hash (not plaintext)
 * - Max attempts per OTP session
 * - TTL expiration
 * - Rate limiting handled at middleware level
 */

import crypto from "crypto";
import pool from "../../config/database.js";
import { v4 as uuidv4 } from "uuid";
import { BaseAuthStrategy, AuthError } from "./base.strategy.js";

export class OtpStrategy extends BaseAuthStrategy {
  constructor() {
    super("otp");
  }

  /**
   * Generate and store an OTP for the given email.
   * In dev, logs the code to console. In production, integrate email service.
   *
   * @param {string} email
   * @param {object} config - { code_length, ttl_seconds, max_attempts }
   * @returns {Promise<{ message: string, expires_in: number, dev_code?: string }>}
   */
  async requestOtp(email, config) {
    if (!email) {
      throw new AuthError("Email is required", 400, "MISSING_EMAIL");
    }

    const codeLength = config?.code_length || 6;
    const ttlSeconds = config?.ttl_seconds || 300;
    const maxAttempts = config?.max_attempts || 5;

    // Generate secure random numeric code
    const code = this.generateSecureCode(codeLength);
    const codeHash = this.hashCode(code);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // Invalidate any existing active OTPs for this email
    await pool.execute(
      "UPDATE otp_tokens SET used_at = NOW() WHERE email = ? AND used_at IS NULL AND expires_at > NOW()",
      [email],
    );

    // Store new OTP
    await pool.execute(
      `INSERT INTO otp_tokens (id, email, code_hash, max_attempts, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), email, codeHash, maxAttempts, expiresAt],
    );

    // TODO: Integrate email service (nodemailer, SendGrid, etc.)
    // For development, log the code
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      console.log(`\n📧 [DEV] OTP for ${email}: ${code}\n`);
    }

    const result = {
      message: "OTP sent to your email",
      expires_in: ttlSeconds,
    };

    // Only include code in dev mode for testing convenience
    if (isDev) {
      result.dev_code = code;
    }

    return result;
  }

  /**
   * Verify OTP code and authenticate user.
   * @param {{ email: string, code: string }} payload
   * @param {object} config
   * @returns {Promise<{ user: object, isNewUser: boolean }>}
   */
  async authenticate(payload, config) {
    const { email, code } = payload;

    if (!email || !code) {
      throw new AuthError("Email and code are required", 400, "MISSING_FIELDS");
    }

    // Find active OTP for this email
    const [otpRows] = await pool.execute(
      `SELECT id, code_hash, attempts, max_attempts, expires_at
       FROM otp_tokens
       WHERE email = ? AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email],
    );

    if (otpRows.length === 0) {
      throw new AuthError("OTP expired or not found. Please request a new code.", 401, "OTP_EXPIRED");
    }

    const otp = otpRows[0];

    // Check max attempts
    if (otp.attempts >= otp.max_attempts) {
      // Invalidate this OTP
      await pool.execute("UPDATE otp_tokens SET used_at = NOW() WHERE id = ?", [otp.id]);
      throw new AuthError("Too many attempts. Please request a new code.", 401, "OTP_MAX_ATTEMPTS");
    }

    // Verify code
    const codeHash = this.hashCode(code);
    if (codeHash !== otp.code_hash) {
      // Increment attempts
      await pool.execute(
        "UPDATE otp_tokens SET attempts = attempts + 1 WHERE id = ?",
        [otp.id],
      );
      const remaining = otp.max_attempts - otp.attempts - 1;
      throw new AuthError(
        "Invalid code",
        401,
        "INVALID_OTP",
        { remaining_attempts: remaining },
      );
    }

    // Mark OTP as used
    await pool.execute("UPDATE otp_tokens SET used_at = NOW() WHERE id = ?", [otp.id]);

    // Find or create user
    const { user, isNewUser } = await this.findOrCreateUser(email);

    // Update authentication_methods
    await pool.execute(
      `INSERT INTO authentication_methods (id, user_id, method_type, last_used_at)
       VALUES (UUID(), ?, 'otp', NOW())
       ON DUPLICATE KEY UPDATE last_used_at = NOW()`,
      [user.id],
    );

    return { user, isNewUser };
  }

  /**
   * Find existing user by email or create a new one for OTP-first signup.
   * @param {string} email
   * @returns {Promise<{ user: object, isNewUser: boolean }>}
   */
  async findOrCreateUser(email) {
    // Try to find existing user
    const [existing] = await pool.execute(
      `SELECT id, email, name, role, avatar, created_at
       FROM users WHERE email = ? AND deleted_at IS NULL`,
      [email],
    );

    if (existing.length > 0) {
      const user = existing[0];
      // Mark email as verified (they proved ownership via OTP)
      await pool.execute(
        "UPDATE users SET email_verified = TRUE WHERE id = ? AND email_verified = FALSE",
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
        isNewUser: false,
      };
    }

    // Create new user (OTP-first registration)
    const userId = uuidv4();
    const name = email.split("@")[0]; // Default name from email prefix

    await pool.execute(
      `INSERT INTO users (id, email, email_verified, password_hash, name, role)
       VALUES (?, ?, TRUE, '', ?, 'User')`,
      [userId, email, name],
    );

    return {
      user: {
        id: userId,
        email,
        name,
        role: "User",
        avatar: null,
        createdAt: new Date(),
      },
      isNewUser: true,
    };
  }

  /**
   * Generate a cryptographically secure numeric code.
   * @param {number} length
   * @returns {string}
   */
  generateSecureCode(length) {
    const max = Math.pow(10, length);
    const randomBytes = crypto.randomBytes(4);
    const num = randomBytes.readUInt32BE(0) % max;
    return num.toString().padStart(length, "0");
  }

  /**
   * Hash a code with SHA-256.
   * @param {string} code
   * @returns {string}
   */
  hashCode(code) {
    return crypto.createHash("sha256").update(code).digest("hex");
  }
}
