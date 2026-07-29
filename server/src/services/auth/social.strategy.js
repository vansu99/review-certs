/**
 * Social (OAuth2) Authentication Strategy
 *
 * Generic strategy that handles Google, Facebook, X (Twitter) via
 * a unified interface. Provider-specific logic is isolated in helper methods.
 *
 * Flow:
 * 1. getAuthUrl() — generate OAuth authorization URL with state/CSRF
 * 2. authenticate({ code, state }) — exchange code for tokens, get profile, find/create user
 *
 * Account linking rules:
 * - If social account already linked → login directly
 * - If email matches existing user (email_verified from provider) → auto-link
 * - If email not verified from provider → create new account (no auto-link)
 * - Otherwise → create new user
 */

import crypto from "crypto";
import pool from "../../config/database.js";
import { v4 as uuidv4 } from "uuid";
import { BaseAuthStrategy, AuthError } from "./base.strategy.js";

// In-memory state store for CSRF (dev only — use DB/Redis in production)
const pendingStates = new Map();

// Cleanup expired states every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of pendingStates.entries()) {
    if (now > data.expiresAt) pendingStates.delete(state);
  }
}, 5 * 60_000).unref();

/**
 * Provider-specific OAuth configuration.
 * Each provider has different endpoints and scopes.
 */
const PROVIDER_CONFIG = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scopes: ["openid", "email", "profile"],
    mapProfile: (data) => ({
      uid: data.id,
      email: data.email,
      emailVerified: data.verified_email ?? true,
      name: data.name,
      avatar: data.picture,
    }),
  },
  facebook: {
    authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    userInfoUrl: "https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)",
    scopes: ["email", "public_profile"],
    mapProfile: (data) => ({
      uid: data.id,
      email: data.email,
      emailVerified: !!data.email, // Facebook only returns verified emails
      name: data.name,
      avatar: data.picture?.data?.url || null,
    }),
  },
  x: {
    authorizeUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.x.com/2/oauth2/token",
    userInfoUrl: "https://api.x.com/2/users/me?user.fields=profile_image_url",
    scopes: ["users.read", "tweet.read"],
    mapProfile: (data) => ({
      uid: data.data?.id || data.id,
      email: data.data?.email || null, // X may not provide email
      emailVerified: false,
      name: data.data?.name || data.name,
      avatar: data.data?.profile_image_url || null,
    }),
  },
};

export class SocialStrategy extends BaseAuthStrategy {
  /**
   * @param {string} provider - 'google' | 'facebook' | 'x'
   */
  constructor(provider) {
    super(`social_${provider}`);
    this.provider = provider;
    this.providerConfig = PROVIDER_CONFIG[provider];

    if (!this.providerConfig) {
      throw new Error(`Unknown social provider: ${provider}`);
    }
  }

  /**
   * Generate OAuth authorization URL.
   * @param {object} config - { client_id, callback_url } from auth_configs
   * @returns {{ url: string, state: string }}
   */
  getAuthUrl(config) {
    const { client_id, callback_url } = config;

    if (!client_id) {
      throw new AuthError(
        `${this.provider} OAuth not configured`,
        503,
        "PROVIDER_NOT_CONFIGURED",
      );
    }

    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString("hex");
    pendingStates.set(state, {
      provider: this.provider,
      expiresAt: Date.now() + 10 * 60_000, // 10 min
    });

    const params = new URLSearchParams({
      client_id,
      redirect_uri: callback_url,
      response_type: "code",
      scope: this.providerConfig.scopes.join(" "),
      state,
      access_type: "offline", // Google-specific, ignored by others
    });

    // X (Twitter) uses PKCE
    if (this.provider === "x") {
      const codeVerifier = crypto.randomBytes(32).toString("base64url");
      const codeChallenge = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64url");
      params.set("code_challenge", codeChallenge);
      params.set("code_challenge_method", "S256");
      // Store verifier for token exchange
      pendingStates.get(state).codeVerifier = codeVerifier;
    }

    const url = `${this.providerConfig.authorizeUrl}?${params.toString()}`;
    return { url, state };
  }

  /**
   * Handle OAuth callback — exchange code, fetch profile, find/create user.
   * @param {{ code: string, state: string }} payload
   * @param {object} config - { client_id, client_secret, callback_url }
   * @returns {Promise<{ user: object, isNewUser: boolean }>}
   */
  async authenticate(payload, config) {
    const { code, state } = payload;

    if (!code || !state) {
      throw new AuthError("Missing authorization code or state", 400, "MISSING_OAUTH_PARAMS");
    }

    // Validate CSRF state
    const stateData = pendingStates.get(state);
    if (!stateData) {
      throw new AuthError("Invalid or expired OAuth state", 401, "INVALID_STATE");
    }
    if (stateData.provider !== this.provider) {
      throw new AuthError("State/provider mismatch", 401, "STATE_MISMATCH");
    }
    pendingStates.delete(state); // Single-use

    // Exchange code for tokens
    const tokens = await this.exchangeCode(code, config, stateData.codeVerifier);

    // Fetch user profile from provider
    const profile = await this.fetchProfile(tokens.access_token);

    // Find or create user + link social account
    return this.findOrCreateUser(profile, tokens);
  }

  /**
   * Exchange authorization code for access/refresh tokens.
   * @param {string} code
   * @param {object} config
   * @param {string} [codeVerifier] - For PKCE (X/Twitter)
   * @returns {Promise<{ access_token: string, refresh_token?: string, expires_in?: number }>}
   */
  async exchangeCode(code, config, codeVerifier) {
    const { client_id, client_secret, callback_url } = config;

    const body = {
      client_id,
      client_secret,
      code,
      redirect_uri: callback_url,
      grant_type: "authorization_code",
    };

    if (codeVerifier) {
      body.code_verifier = codeVerifier;
    }

    const response = await fetch(this.providerConfig.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Social Auth] Token exchange failed for ${this.provider}:`, error);
      throw new AuthError("Failed to authenticate with provider", 502, "PROVIDER_TOKEN_ERROR");
    }

    return response.json();
  }

  /**
   * Fetch user profile from the OAuth provider.
   * @param {string} accessToken
   * @returns {Promise<{ uid: string, email: string|null, emailVerified: boolean, name: string, avatar: string|null }>}
   */
  async fetchProfile(accessToken) {
    const response = await fetch(this.providerConfig.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new AuthError("Failed to fetch profile from provider", 502, "PROVIDER_PROFILE_ERROR");
    }

    const data = await response.json();
    return this.providerConfig.mapProfile(data);
  }

  /**
   * Find existing user by social link or email, or create a new one.
   * Implements account collision resolution rules.
   *
   * @param {object} profile - Normalized profile from provider
   * @param {object} tokens - OAuth tokens to store
   * @returns {Promise<{ user: object, isNewUser: boolean }>}
   */
  async findOrCreateUser(profile, tokens) {
    const { uid, email, emailVerified, name, avatar } = profile;

    // 1. Check if this social account is already linked
    const [existingLink] = await pool.execute(
      `SELECT sa.user_id, u.id, u.email, u.name, u.role, u.avatar, u.created_at
       FROM social_accounts sa
       JOIN users u ON sa.user_id = u.id
       WHERE sa.provider = ? AND sa.provider_uid = ? AND u.deleted_at IS NULL`,
      [this.provider, uid],
    );

    if (existingLink.length > 0) {
      const user = existingLink[0];
      // Update tokens
      await this.updateSocialTokens(user.user_id, tokens);
      await this.touchAuthMethod(user.user_id);

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

    // 2. Check if a user with this email already exists (auto-link candidate)
    if (email && emailVerified) {
      const [existingUser] = await pool.execute(
        `SELECT id, email, name, role, avatar, created_at
         FROM users WHERE email = ? AND deleted_at IS NULL`,
        [email],
      );

      if (existingUser.length > 0) {
        const user = existingUser[0];
        // Auto-link: email verified by provider = proof of ownership
        await this.createSocialAccount(user.id, profile, tokens);
        await this.touchAuthMethod(user.id);

        // Also mark email as verified
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
            avatar: user.avatar || avatar,
            createdAt: user.created_at,
          },
          isNewUser: false,
        };
      }
    }

    // 3. Create new user
    const userId = uuidv4();
    const userEmail = email || `${this.provider}_${uid}@placeholder.local`;

    await pool.execute(
      `INSERT INTO users (id, email, email_verified, password_hash, name, role, avatar)
       VALUES (?, ?, ?, '', ?, 'User', ?)`,
      [userId, userEmail, emailVerified ? 1 : 0, name || "User", avatar || null],
    );

    await this.createSocialAccount(userId, profile, tokens);
    await this.touchAuthMethod(userId);

    return {
      user: {
        id: userId,
        email: userEmail,
        name: name || "User",
        role: "User",
        avatar,
        createdAt: new Date(),
      },
      isNewUser: true,
    };
  }

  /**
   * Create a social_accounts record.
   */
  async createSocialAccount(userId, profile, tokens) {
    await pool.execute(
      `INSERT INTO social_accounts 
       (id, user_id, provider, provider_uid, provider_email, provider_name, provider_avatar, access_token, refresh_token, token_expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        userId,
        this.provider,
        profile.uid,
        profile.email || null,
        profile.name || null,
        profile.avatar || null,
        tokens.access_token || null,
        tokens.refresh_token || null,
        tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      ],
    );
  }

  /**
   * Update stored OAuth tokens for an existing social link.
   */
  async updateSocialTokens(userId, tokens) {
    await pool.execute(
      `UPDATE social_accounts 
       SET access_token = ?, refresh_token = COALESCE(?, refresh_token), 
           token_expires_at = ?, updated_at = NOW()
       WHERE user_id = ? AND provider = ?`,
      [
        tokens.access_token || null,
        tokens.refresh_token || null,
        tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        userId,
        this.provider,
      ],
    );
  }

  /**
   * Update authentication_methods last_used_at.
   */
  async touchAuthMethod(userId) {
    await pool.execute(
      `INSERT INTO authentication_methods (id, user_id, method_type, last_used_at)
       VALUES (UUID(), ?, ?, NOW())
       ON DUPLICATE KEY UPDATE last_used_at = NOW()`,
      [userId, this.methodType],
    );
  }
}
