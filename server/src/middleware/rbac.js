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

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        "You do not have permission to perform this action",
        403,
      );
    }

    next();
  };
}

/**
 * Permission definitions for each role
 */
export const PERMISSIONS = {
  Admin: [
    "MANAGE_USERS",
    "CRUD_CATEGORIES",
    "CRUD_EXAMS",
    "TAKE_EXAMS",
    "VIEW_ALL",
  ],
  Manager: ["CRUD_CATEGORIES", "CRUD_EXAMS", "TAKE_EXAMS", "VIEW_ALL"],
  User: ["TAKE_EXAMS"],
};

/**
 * Check if role has specific permission
 */
export function hasPermission(role, permission) {
  return PERMISSIONS[role]?.includes(permission) || false;
}
