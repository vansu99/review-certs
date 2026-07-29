import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_CATEGORY = {
  icon: "CERT",
  level: "Foundation",
  status: "draft",
  displayOrder: 0,
  defaultPassingScore: 70,
  estimatedHours: 0,
};

const LEVELS = ["Foundation", "Associate", "Professional", "Specialty"];
const STATUSES = ["draft", "published", "archived"];

function canManageCatalog(user) {
  return ["Super Admin", "Admin", "Manager"].includes(user?.role);
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function createSlug(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function mapCategory(row) {
  return {
    id: row.id,
    slug: row.slug || createSlug(row.name),
    name: row.name,
    description: row.description || "",
    icon: row.icon || DEFAULT_CATEGORY.icon,
    provider: row.provider || "",
    certificationCode: row.certification_code || "",
    level: row.level || DEFAULT_CATEGORY.level,
    version: row.version || "",
    status: row.status || DEFAULT_CATEGORY.status,
    displayOrder: toInt(row.display_order, DEFAULT_CATEGORY.displayOrder),
    defaultPassingScore: toInt(
      row.default_passing_score,
      DEFAULT_CATEGORY.defaultPassingScore,
    ),
    estimatedHours: toInt(row.estimated_hours, DEFAULT_CATEGORY.estimatedHours),
    testCount: toInt(row.testCount, 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildCategoryPayload(body, existing = {}) {
  const name = normalizeText(body.name ?? existing.name);
  const slug = createSlug(body.slug || name);
  const level = LEVELS.includes(body.level) ? body.level : existing.level || DEFAULT_CATEGORY.level;
  const status = STATUSES.includes(body.status)
    ? body.status
    : existing.status || DEFAULT_CATEGORY.status;

  return {
    slug,
    name,
    description: normalizeText(body.description ?? existing.description),
    icon: normalizeText(body.icon ?? existing.icon) || DEFAULT_CATEGORY.icon,
    provider: normalizeText(body.provider ?? existing.provider),
    certificationCode: normalizeText(
      body.certificationCode ?? existing.certification_code,
    ),
    level,
    version: normalizeText(body.version ?? existing.version),
    status,
    displayOrder: toInt(body.displayOrder, existing.display_order ?? DEFAULT_CATEGORY.displayOrder),
    defaultPassingScore: toInt(
      body.defaultPassingScore,
      existing.default_passing_score ?? DEFAULT_CATEGORY.defaultPassingScore,
    ),
    estimatedHours: toInt(
      body.estimatedHours,
      existing.estimated_hours ?? DEFAULT_CATEGORY.estimatedHours,
    ),
  };
}

async function assertUniqueSlug(slug, currentId) {
  const [rows] = await pool.execute(
    `SELECT id FROM categories
     WHERE slug = ? AND deleted_at IS NULL AND (? IS NULL OR id <> ?)
     LIMIT 1`,
    [slug, currentId || null, currentId || null],
  );

  return rows.length === 0;
}

function validatePayload(payload) {
  if (!payload.name) return "Category name is required";
  if (!payload.slug) return "Category slug is required";
  if (payload.defaultPassingScore < 1 || payload.defaultPassingScore > 100) {
    return "Default passing score must be between 1 and 100";
  }
  if (payload.estimatedHours < 0) return "Estimated hours cannot be negative";
  return null;
}

export async function getCategories(req, res, next) {
  try {
    const params = [];
    let visibility = "WHERE c.deleted_at IS NULL";

    if (!canManageCatalog(req.user)) {
      visibility += " AND c.status = ?";
      params.push("published");
    }

    const [rows] = await pool.execute(
      `
      SELECT
        c.id, c.slug, c.name, c.description, c.icon, c.provider,
        c.certification_code, c.level, c.version, c.status, c.display_order,
        c.default_passing_score, c.estimated_hours, c.created_at, c.updated_at,
        COUNT(t.id) as testCount
      FROM categories c
      LEFT JOIN tests t ON t.category_id = c.id AND t.deleted_at IS NULL
      ${visibility}
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `,
      params,
    );

    return successResponse(res, rows.map(mapCategory));
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const params = [id];
    let visibility = "WHERE c.id = ? AND c.deleted_at IS NULL";

    if (!canManageCatalog(req.user)) {
      visibility += " AND c.status = ?";
      params.push("published");
    }

    const [rows] = await pool.execute(
      `
      SELECT
        c.id, c.slug, c.name, c.description, c.icon, c.provider,
        c.certification_code, c.level, c.version, c.status, c.display_order,
        c.default_passing_score, c.estimated_hours, c.created_at, c.updated_at,
        COUNT(t.id) as testCount
      FROM categories c
      LEFT JOIN tests t ON t.category_id = c.id AND t.deleted_at IS NULL
      ${visibility}
      GROUP BY c.id
    `,
      params,
    );

    if (rows.length === 0) {
      return errorResponse(res, "Category not found", 404);
    }

    return successResponse(res, mapCategory(rows[0]));
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const payload = buildCategoryPayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) return errorResponse(res, validationError, 400);

    const isUnique = await assertUniqueSlug(payload.slug);
    if (!isUnique) return errorResponse(res, "Category slug already exists", 409);

    const id = uuidv4();

    await pool.execute(
      `INSERT INTO categories (
        id, slug, name, description, icon, provider, certification_code, level,
        version, status, display_order, default_passing_score, estimated_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.slug,
        payload.name,
        payload.description,
        payload.icon,
        payload.provider,
        payload.certificationCode,
        payload.level,
        payload.version,
        payload.status,
        payload.displayOrder,
        payload.defaultPassingScore,
        payload.estimatedHours,
      ],
    );

    return successResponse(
      res,
      { id, ...payload, testCount: 0 },
      "Category created successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.execute(
      "SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL",
      [id],
    );

    if (existingRows.length === 0) {
      return errorResponse(res, "Category not found", 404);
    }

    const payload = buildCategoryPayload(req.body, existingRows[0]);
    const validationError = validatePayload(payload);
    if (validationError) return errorResponse(res, validationError, 400);

    const isUnique = await assertUniqueSlug(payload.slug, id);
    if (!isUnique) return errorResponse(res, "Category slug already exists", 409);

    await pool.execute(
      `UPDATE categories SET
        slug = ?, name = ?, description = ?, icon = ?, provider = ?,
        certification_code = ?, level = ?, version = ?, status = ?,
        display_order = ?, default_passing_score = ?, estimated_hours = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        payload.slug,
        payload.name,
        payload.description,
        payload.icon,
        payload.provider,
        payload.certificationCode,
        payload.level,
        payload.version,
        payload.status,
        payload.displayOrder,
        payload.defaultPassingScore,
        payload.estimatedHours,
        id,
      ],
    );

    const [rows] = await pool.execute(
      `
      SELECT
        c.id, c.slug, c.name, c.description, c.icon, c.provider,
        c.certification_code, c.level, c.version, c.status, c.display_order,
        c.default_passing_score, c.estimated_hours, c.created_at, c.updated_at,
        COUNT(t.id) as testCount
      FROM categories c
      LEFT JOIN tests t ON t.category_id = c.id AND t.deleted_at IS NULL
      WHERE c.id = ? AND c.deleted_at IS NULL
      GROUP BY c.id
    `,
      [id],
    );

    return successResponse(
      res,
      mapCategory(rows[0]),
      "Category updated successfully",
    );
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.execute(
      `SELECT c.id, c.status, COUNT(t.id) as testCount
       FROM categories c
       LEFT JOIN tests t ON t.category_id = c.id AND t.deleted_at IS NULL
       WHERE c.id = ? AND c.deleted_at IS NULL
       GROUP BY c.id`,
      [id],
    );

    if (existingRows.length === 0) {
      return errorResponse(res, "Category not found", 404);
    }

    await pool.execute(
      "UPDATE categories SET status = 'archived', updated_at = NOW() WHERE id = ?",
      [id],
    );

    return successResponse(
      res,
      { id, status: "archived", testCount: toInt(existingRows[0].testCount, 0) },
      "Category archived successfully",
    );
  } catch (error) {
    next(error);
  }
}
