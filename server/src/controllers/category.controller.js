import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get all categories with test count
 * GET /api/categories
 */
export async function getCategories(req, res, next) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        c.id, c.name, c.description, c.icon, c.created_at, c.updated_at,
        COUNT(t.id) as testCount
      FROM categories c
      LEFT JOIN tests t ON t.category_id = c.id AND t.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    const categories = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      testCount: parseInt(row.testCount) || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return successResponse(res, categories);
  } catch (error) {
    next(error);
  }
}

/**
 * Get category by ID
 * GET /api/categories/:id
 */
export async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        c.id, c.name, c.description, c.icon, c.created_at, c.updated_at,
        COUNT(t.id) as testCount
      FROM categories c
      LEFT JOIN tests t ON t.category_id = c.id AND t.deleted_at IS NULL
      WHERE c.id = ? AND c.deleted_at IS NULL
      GROUP BY c.id
    `,
      [id],
    );

    if (rows.length === 0) {
      return errorResponse(res, "Category not found", 404);
    }

    const row = rows[0];
    const category = {
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      testCount: parseInt(row.testCount) || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return successResponse(res, category);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new category
 * POST /api/categories
 */
export async function createCategory(req, res, next) {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return errorResponse(res, "Category name is required", 400);
    }

    const id = uuidv4();

    await pool.execute(
      "INSERT INTO categories (id, name, description, icon) VALUES (?, ?, ?, ?)",
      [id, name, description || "", icon || "📚"],
    );

    const category = {
      id,
      name,
      description: description || "",
      icon: icon || "📚",
      testCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return successResponse(res, category, "Category created successfully", 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a category
 * PUT /api/categories/:id
 */
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    // Check if category exists
    const [existing] = await pool.execute(
      "SELECT id FROM categories WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    if (existing.length === 0) {
      return errorResponse(res, "Category not found", 404);
    }

    await pool.execute(
      "UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description), icon = COALESCE(?, icon), updated_at = NOW() WHERE id = ?",
      [name, description, icon, id],
    );

    // Get updated category
    const [rows] = await pool.execute(
      `
      SELECT 
        c.id, c.name, c.description, c.icon, c.created_at, c.updated_at,
        COUNT(t.id) as testCount
      FROM categories c
      LEFT JOIN tests t ON t.category_id = c.id AND t.deleted_at IS NULL
      WHERE c.id = ? AND c.deleted_at IS NULL
      GROUP BY c.id
    `,
      [id],
    );

    const row = rows[0];
    const category = {
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      testCount: parseInt(row.testCount) || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return successResponse(res, category, "Category updated successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a category
 * DELETE /api/categories/:id
 */
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existing] = await pool.execute(
      "SELECT id FROM categories WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    if (existing.length === 0) {
      return errorResponse(res, "Category not found", 404);
    }

    // Soft delete category and its tests
    await pool.execute(
      "UPDATE categories SET deleted_at = NOW() WHERE id = ?",
      [id],
    );
    await pool.execute(
      "UPDATE tests SET deleted_at = NOW() WHERE category_id = ? AND deleted_at IS NULL",
      [id],
    );

    return successResponse(res, null, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
}
