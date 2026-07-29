/**
 * Auth Config Service (Feature Flag management)
 *
 * Loads auth method configurations from DB, caches in memory,
 * and exposes simple check/get methods for the rest of the app.
 */

import pool from "../config/database.js";
import cache from "../utils/cache.js";

const CACHE_PREFIX = "auth_config:";
const CACHE_TTL = 60_000; // 60s — short enough to pick up admin changes quickly

/**
 * Get config for a specific auth method.
 * @param {string} method - e.g. 'password', 'otp', 'social_google'
 * @returns {Promise<{ auth_method: string, enabled: boolean, config: object, priority: number } | null>}
 */
export async function getAuthConfig(method) {
  const cacheKey = `${CACHE_PREFIX}${method}`;

  return cache.getOrSet(
    cacheKey,
    async () => {
      const [rows] = await pool.execute(
        "SELECT auth_method, enabled, config, priority FROM auth_configs WHERE auth_method = ?",
        [method],
      );
      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        auth_method: row.auth_method,
        enabled: Boolean(row.enabled),
        config: typeof row.config === "string" ? JSON.parse(row.config) : row.config || {},
        priority: row.priority,
      };
    },
    CACHE_TTL,
  );
}

/**
 * Check if a specific auth method is enabled.
 * @param {string} method
 * @returns {Promise<boolean>}
 */
export async function isMethodEnabled(method) {
  const config = await getAuthConfig(method);
  return config?.enabled ?? false;
}

/**
 * Get all enabled auth methods (for frontend to render login options).
 * @returns {Promise<Array<{ auth_method: string, priority: number, config: object }>>}
 */
export async function getEnabledMethods() {
  const cacheKey = `${CACHE_PREFIX}all_enabled`;

  return cache.getOrSet(
    cacheKey,
    async () => {
      const [rows] = await pool.execute(
        "SELECT auth_method, config, priority FROM auth_configs WHERE enabled = TRUE ORDER BY priority ASC",
      );

      return rows.map((row) => ({
        auth_method: row.auth_method,
        priority: row.priority,
        config: typeof row.config === "string" ? JSON.parse(row.config) : row.config || {},
      }));
    },
    CACHE_TTL,
  );
}

/**
 * Get all auth configs (for admin panel).
 * @returns {Promise<Array>}
 */
export async function getAllConfigs() {
  const [rows] = await pool.execute(
    "SELECT id, auth_method, enabled, config, priority, created_at, updated_at FROM auth_configs ORDER BY priority ASC",
  );

  return rows.map((row) => ({
    ...row,
    enabled: Boolean(row.enabled),
    config: typeof row.config === "string" ? JSON.parse(row.config) : row.config || {},
  }));
}

/**
 * Update an auth method's enabled state and/or config.
 * Invalidates cache after update.
 * @param {string} method
 * @param {{ enabled?: boolean, config?: object }} updates
 */
export async function updateAuthConfig(method, updates) {
  const fields = [];
  const values = [];

  if (updates.enabled !== undefined) {
    fields.push("enabled = ?");
    values.push(updates.enabled ? 1 : 0);
  }

  if (updates.config !== undefined) {
    fields.push("config = ?");
    values.push(JSON.stringify(updates.config));
  }

  if (fields.length === 0) return;

  values.push(method);

  await pool.execute(
    `UPDATE auth_configs SET ${fields.join(", ")} WHERE auth_method = ?`,
    values,
  );

  // Invalidate related cache entries
  cache.delete(`${CACHE_PREFIX}${method}`);
  cache.delete(`${CACHE_PREFIX}all_enabled`);
}

/**
 * Invalidate all auth config caches.
 * Call this after bulk admin changes.
 */
export function invalidateCache() {
  cache.deleteByPrefix(CACHE_PREFIX);
}
