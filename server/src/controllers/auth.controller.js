import bcrypt from "bcryptjs";
import pool from "../config/database.js";
import { generateToken } from "../middleware/auth.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * Login with email and password
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required", 400);
    }

    // Find user by email
    const [rows] = await pool.execute(
      "SELECT id, email, password_hash, name, role, avatar, created_at FROM users WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const user = rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Generate token
    const accessToken = generateToken(user);

    // Return user data (without password) and token
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.created_at,
    };

    return successResponse(
      res,
      { user: userData, accessToken },
      "Login successful",
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Logout current user
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  // For JWT-based auth, logout is handled client-side by removing the token
  // Here we just return success
  return successResponse(res, null, "Logout successful");
}

/**
 * Get current user profile
 * GET /api/auth/profile
 */
export async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, email, name, role, avatar, phone, gender, date_of_birth, country, facebook, created_at FROM users WHERE id = ?",
      [req.user.id],
    );

    if (rows.length === 0) {
      return errorResponse(res, "User not found", 404);
    }

    const user = rows[0];
    const userData = {
      id: user.id,
      email: user.email,
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

    return successResponse(res, userData);
  } catch (error) {
    next(error);
  }
}

/**
 * Update current user profile
 * PUT /api/auth/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phone,
      gender,
      dateOfBirth,
      country,
      facebook,
    } = req.body;

    // Combine first and last name
    const name = `${firstName} ${lastName}`.trim();

    // Update user profile
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
      "SELECT id, email, name, role, avatar, phone, gender, date_of_birth, country, facebook, created_at FROM users WHERE id = ?",
      [userId],
    );

    if (rows.length === 0) {
      return errorResponse(res, "User not found", 404);
    }

    const user = rows[0];
    const userData = {
      id: user.id,
      email: user.email,
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
