/**
 * Auth Feature Flag Guard Middleware
 *
 * Checks if the requested auth method is enabled in auth_configs
 * before allowing the request to proceed to the strategy handler.
 *
 * Usage:
 *   router.post('/login/password', authFeatureFlag('password'), handler)
 *   router.post('/otp/request', authFeatureFlag('otp'), handler)
 *   router.get('/social/google', authFeatureFlag('social_google'), handler)
 */

import { getAuthConfig } from "../services/authConfig.service.js";
import { errorResponse } from "../utils/response.js";

/**
 * Create a middleware that checks if a specific auth method is enabled.
 * @param {string} method - Auth method identifier (e.g. 'password', 'otp', 'social_google')
 * @returns {import('express').RequestHandler}
 */
export function authFeatureFlag(method) {
  return async (req, res, next) => {
    try {
      const config = await getAuthConfig(method);

      if (!config) {
        return errorResponse(
          res,
          `Authentication method '${method}' is not configured`,
          404,
        );
      }

      if (!config.enabled) {
        return errorResponse(
          res,
          `Authentication method '${method}' is currently disabled`,
          403,
        );
      }

      // Attach method config to request for downstream use by strategy
      req.authMethodConfig = config.config;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Dynamic version — reads method from route param :method.
 * Useful for generic endpoints like POST /auth/login/:method
 */
export function authFeatureFlagDynamic(req, res, next) {
  const method = req.params.method || req.params.provider;
  if (!method) {
    return errorResponse(res, "Auth method not specified", 400);
  }
  return authFeatureFlag(method)(req, res, next);
}
