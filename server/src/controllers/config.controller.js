/**
 * Feature Config Controller
 *
 * Handles CRUD operations for system feature configurations.
 * All routes are protected by superAdminOnly middleware.
 */

import {
  getAllConfigs,
  getAuthConfig,
  updateAuthConfig,
  invalidateCache,
} from "../services/authConfig.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * GET /api/admin/config/auth
 * List all auth method configurations with their status.
 */
export async function listAuthConfigs(req, res, next) {
  try {
    const configs = await getAllConfigs();
    return successResponse(res, { configs });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/config/auth/:method
 * Get a single auth method configuration.
 */
export async function getAuthConfigDetail(req, res, next) {
  try {
    const { method } = req.params;
    const config = await getAuthConfig(method);

    if (!config) {
      return errorResponse(res, `Auth method '${method}' not found`, 404);
    }

    return successResponse(res, config);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/config/auth/:method
 * Update an auth method's enabled state and/or config.
 *
 * Body: { enabled?: boolean, config?: object }
 */
export async function updateAuthConfigHandler(req, res, next) {
  try {
    const { method } = req.params;
    const { enabled, config } = req.body;

    // Validate the method exists
    const existing = await getAuthConfig(method);
    if (!existing) {
      return errorResponse(res, `Auth method '${method}' not found`, 404);
    }

    // Build update payload
    const updates = {};
    if (typeof enabled === "boolean") {
      updates.enabled = enabled;
    }
    if (config && typeof config === "object") {
      // Merge with existing config to allow partial updates
      updates.config = { ...existing.config, ...config };
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(res, "No valid fields to update", 400);
    }

    await updateAuthConfig(method, updates);

    // Fetch the updated record
    invalidateCache();
    const updated = await getAuthConfig(method);

    return successResponse(res, updated, `Auth method '${method}' updated successfully`);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/config/auth/:method/toggle
 * Quick toggle (enable/disable) an auth method.
 */
export async function toggleAuthConfig(req, res, next) {
  try {
    const { method } = req.params;

    const existing = await getAuthConfig(method);
    if (!existing) {
      return errorResponse(res, `Auth method '${method}' not found`, 404);
    }

    const newState = !existing.enabled;
    await updateAuthConfig(method, { enabled: newState });

    invalidateCache();

    return successResponse(
      res,
      { auth_method: method, enabled: newState },
      `Auth method '${method}' ${newState ? "enabled" : "disabled"}`,
    );
  } catch (error) {
    next(error);
  }
}
