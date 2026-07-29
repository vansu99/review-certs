import { errorResponse } from "../utils/response.js";

/**
 * Role-Based Access Control Middleware
 * Checks if user has one of the allowed roles
 *
 * @param {string[]} allowedRoles - Array of roles that can access the route
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    // Super Admin bypasses all role checks
    if (req.user.role === "Super Admin") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, "You do not have permission to perform this action", 403);
    }

    next();
  };
}

/**
 * Restrict to Super Admin only.
 * Shortcut for routes that only Super Admin can access.
 */
export function superAdminOnly(req, res, next) {
  if (!req.user) {
    return errorResponse(res, "Authentication required", 401);
  }

  if (req.user.role !== "Super Admin") {
    return errorResponse(res, "This action requires Super Admin privileges", 403);
  }

  next();
}

/**
 * Permission definitions for each role
 */
export const PERMISSIONS = {
  "Super Admin": [
    "MANAGE_SYSTEM",
    "MANAGE_USERS",
    "CRUD_CATEGORIES",
    "CRUD_EXAMS",
    "TAKE_EXAMS",
    "VIEW_ALL",
  ],
  Admin: ["MANAGE_USERS", "CRUD_CATEGORIES", "CRUD_EXAMS", "TAKE_EXAMS", "VIEW_ALL"],
  Manager: ["CRUD_CATEGORIES", "CRUD_EXAMS", "TAKE_EXAMS", "VIEW_ALL"],
  User: ["TAKE_EXAMS"],
};

/**
 * Check if role has specific permission
 */
export function hasPermission(role, permission) {
  return PERMISSIONS[role]?.includes(permission) || false;
}
