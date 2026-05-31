import pool from "../config/database.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

/**
 * Generate a URL-friendly slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 200);
}

/**
 * Generate guest fingerprint from IP + User-Agent
 */
function generateFingerprint(req) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  return crypto
    .createHash("sha256")
    .update(`${ip}:${ua}`)
    .digest("hex");
}

// ─────────────────────────────────────────────
// PUBLIC ENDPOINTS (no auth required)
// ─────────────────────────────────────────────

/**
 * GET /api/blogs - List published blogs (public)
 */
export async function getPublishedBlogs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const search = req.query.search?.trim() || "";

    let whereClause = "b.deleted_at IS NULL AND b.status = 'published'";
    const params = [];

    // Date range filter: only show blogs within start_date/end_date if set
    whereClause += `
      AND (b.start_date IS NULL OR b.start_date <= CURDATE())
      AND (b.end_date IS NULL OR b.end_date >= CURDATE())
    `;

    if (search) {
      whereClause += " AND (b.title LIKE ? OR b.meta_description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM blogs b WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT 
        b.id, b.title, b.slug, b.meta_description, b.status,
        b.start_date, b.end_date, b.like_count, b.view_count,
        b.created_at, b.updated_at,
        u.name as author_name, u.avatar as author_avatar
       FROM blogs b
       LEFT JOIN users u ON u.id = b.user_id
       WHERE ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );

    const blogs = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      metaDescription: r.meta_description,
      status: r.status,
      startDate: r.start_date,
      endDate: r.end_date,
      likeCount: r.like_count,
      viewCount: r.view_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      author: { name: r.author_name, avatar: r.author_avatar },
    }));

    return paginatedResponse(res, blogs, { total, page, pageSize });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blogs/:slug - Get single published blog by slug (public)
 */
export async function getBlogBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const [rows] = await pool.execute(
      `SELECT 
        b.id, b.title, b.slug, b.description, b.status,
        b.start_date, b.end_date, b.meta_title, b.meta_description,
        b.like_count, b.view_count, b.created_at, b.updated_at,
        u.name as author_name, u.avatar as author_avatar
       FROM blogs b
       LEFT JOIN users u ON u.id = b.user_id
       WHERE b.slug = ? AND b.deleted_at IS NULL AND b.status = 'published'`,
      [slug]
    );

    if (rows.length === 0) {
      return errorResponse(res, "Blog not found", 404);
    }

    // Increment view count
    await pool.execute("UPDATE blogs SET view_count = view_count + 1 WHERE id = ?", [rows[0].id]);

    const r = rows[0];
    const blog = {
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      status: r.status,
      startDate: r.start_date,
      endDate: r.end_date,
      metaTitle: r.meta_title,
      metaDescription: r.meta_description,
      likeCount: r.like_count,
      viewCount: r.view_count + 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      author: { name: r.author_name, avatar: r.author_avatar },
    };

    return successResponse(res, blog);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/blogs/:id/like - Like/unlike a blog (public, guest-friendly)
 * Anti-spam: rate-limited by fingerprint, returns current like state
 */
export async function toggleBlogLike(req, res, next) {
  try {
    const { id } = req.params;
    const fingerprint = generateFingerprint(req);
    const userId = req.user?.id || null;

    // Check blog exists and is published
    const [blogRows] = await pool.execute(
      "SELECT id, like_count FROM blogs WHERE id = ? AND deleted_at IS NULL AND status = 'published'",
      [id]
    );
    if (blogRows.length === 0) {
      return errorResponse(res, "Blog not found", 404);
    }

    let liked = false;

    if (userId) {
      // Authenticated user: use user_id
      const [existing] = await pool.execute(
        "SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?",
        [id, userId]
      );

      if (existing.length > 0) {
        // Unlike
        await pool.execute("DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?", [id, userId]);
        await pool.execute("UPDATE blogs SET like_count = GREATEST(0, like_count - 1) WHERE id = ?", [id]);
        liked = false;
      } else {
        // Like
        await pool.execute(
          "INSERT INTO blog_likes (id, blog_id, user_id) VALUES (?, ?, ?)",
          [uuidv4(), id, userId]
        );
        await pool.execute("UPDATE blogs SET like_count = like_count + 1 WHERE id = ?", [id]);
        liked = true;
      }
    } else {
      // Guest: use fingerprint
      const [existing] = await pool.execute(
        "SELECT id FROM blog_likes WHERE blog_id = ? AND guest_fingerprint = ?",
        [id, fingerprint]
      );

      if (existing.length > 0) {
        // Unlike
        await pool.execute(
          "DELETE FROM blog_likes WHERE blog_id = ? AND guest_fingerprint = ?",
          [id, fingerprint]
        );
        await pool.execute("UPDATE blogs SET like_count = GREATEST(0, like_count - 1) WHERE id = ?", [id]);
        liked = false;
      } else {
        // Like
        await pool.execute(
          "INSERT INTO blog_likes (id, blog_id, guest_fingerprint) VALUES (?, ?, ?)",
          [uuidv4(), id, fingerprint]
        );
        await pool.execute("UPDATE blogs SET like_count = like_count + 1 WHERE id = ?", [id]);
        liked = true;
      }
    }

    // Get updated like count
    const [updated] = await pool.execute("SELECT like_count FROM blogs WHERE id = ?", [id]);

    return successResponse(res, { liked, likeCount: updated[0].like_count });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blogs/:id/like-status - Check if current guest/user has liked
 */
export async function getBlogLikeStatus(req, res, next) {
  try {
    const { id } = req.params;
    const fingerprint = generateFingerprint(req);
    const userId = req.user?.id || null;

    let liked = false;

    if (userId) {
      const [rows] = await pool.execute(
        "SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?",
        [id, userId]
      );
      liked = rows.length > 0;
    } else {
      const [rows] = await pool.execute(
        "SELECT id FROM blog_likes WHERE blog_id = ? AND guest_fingerprint = ?",
        [id, fingerprint]
      );
      liked = rows.length > 0;
    }

    return successResponse(res, { liked });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PROTECTED ENDPOINTS (auth required)
// ─────────────────────────────────────────────

/**
 * GET /api/blogs/manage - List all blogs for management (auth required)
 */
export async function getManagedBlogs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const search = req.query.search?.trim() || "";
    const status = req.query.status || "";
    const userId = req.user.id;
    const role = req.user.role;

    // Admin/Manager see all; User sees only their own
    let whereClause = "b.deleted_at IS NULL";
    const params = [];

    if (role === "User") {
      whereClause += " AND b.user_id = ?";
      params.push(userId);
    }

    if (status && ["draft", "published", "archived"].includes(status)) {
      whereClause += " AND b.status = ?";
      params.push(status);
    }

    if (search) {
      whereClause += " AND (b.title LIKE ? OR b.meta_description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM blogs b WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT 
        b.id, b.title, b.slug, b.status, b.start_date, b.end_date,
        b.meta_title, b.meta_description, b.like_count, b.view_count,
        b.created_at, b.updated_at,
        u.name as author_name, u.avatar as author_avatar
       FROM blogs b
       LEFT JOIN users u ON u.id = b.user_id
       WHERE ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );

    const blogs = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      status: r.status,
      startDate: r.start_date,
      endDate: r.end_date,
      metaTitle: r.meta_title,
      metaDescription: r.meta_description,
      likeCount: r.like_count,
      viewCount: r.view_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      author: { name: r.author_name, avatar: r.author_avatar },
    }));

    return paginatedResponse(res, blogs, { total, page, pageSize });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blogs/manage/:id - Get single blog for editing (auth required)
 */
export async function getManagedBlogById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const [rows] = await pool.execute(
      `SELECT 
        b.id, b.user_id, b.title, b.slug, b.description, b.status,
        b.start_date, b.end_date, b.meta_title, b.meta_description,
        b.like_count, b.view_count, b.created_at, b.updated_at,
        u.name as author_name, u.avatar as author_avatar
       FROM blogs b
       LEFT JOIN users u ON u.id = b.user_id
       WHERE b.id = ? AND b.deleted_at IS NULL`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, "Blog not found", 404);
    }

    const blog = rows[0];

    // Users can only view their own blogs
    if (role === "User" && blog.user_id !== userId) {
      return errorResponse(res, "You do not have permission to view this blog", 403);
    }

    return successResponse(res, {
      id: blog.id,
      userId: blog.user_id,
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      status: blog.status,
      startDate: blog.start_date,
      endDate: blog.end_date,
      metaTitle: blog.meta_title,
      metaDescription: blog.meta_description,
      likeCount: blog.like_count,
      viewCount: blog.view_count,
      createdAt: blog.created_at,
      updatedAt: blog.updated_at,
      author: { name: blog.author_name, avatar: blog.author_avatar },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/blogs - Create a blog (auth required)
 */
export async function createBlog(req, res, next) {
  try {
    const { title, description, status, start_date, end_date, meta_title, meta_description } =
      req.body;
    const userId = req.user.id;

    if (!title?.trim()) {
      return errorResponse(res, "Title is required", 400);
    }

    const id = uuidv4();
    let slug = generateSlug(title);

    // Ensure slug uniqueness
    const [slugCheck] = await pool.execute(
      "SELECT id FROM blogs WHERE slug = ? AND deleted_at IS NULL",
      [slug]
    );
    if (slugCheck.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const blogStatus = ["draft", "published", "archived"].includes(status) ? status : "draft";

    await pool.execute(
      `INSERT INTO blogs 
        (id, user_id, title, slug, description, status, start_date, end_date, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        title.trim(),
        slug,
        description || "",
        blogStatus,
        start_date || null,
        end_date || null,
        meta_title?.trim() || null,
        meta_description?.trim() || null,
      ]
    );

    const [rows] = await pool.execute(
      `SELECT b.*, u.name as author_name, u.avatar as author_avatar
       FROM blogs b LEFT JOIN users u ON u.id = b.user_id
       WHERE b.id = ?`,
      [id]
    );

    const r = rows[0];
    return successResponse(
      res,
      {
        id: r.id,
        title: r.title,
        slug: r.slug,
        description: r.description,
        status: r.status,
        startDate: r.start_date,
        endDate: r.end_date,
        metaTitle: r.meta_title,
        metaDescription: r.meta_description,
        likeCount: 0,
        viewCount: 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        author: { name: r.author_name, avatar: r.author_avatar },
      },
      "Blog created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/blogs/:id - Update a blog (auth required, owner or Admin/Manager)
 */
export async function updateBlog(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, status, start_date, end_date, meta_title, meta_description } =
      req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const [existing] = await pool.execute(
      "SELECT id, user_id, slug, title FROM blogs WHERE id = ? AND deleted_at IS NULL",
      [id]
    );
    if (existing.length === 0) {
      return errorResponse(res, "Blog not found", 404);
    }

    const blog = existing[0];

    // Users can only edit their own blogs
    if (role === "User" && blog.user_id !== userId) {
      return errorResponse(res, "You do not have permission to edit this blog", 403);
    }

    // Regenerate slug if title changed
    let slug = blog.slug;
    if (title && title.trim() !== blog.title) {
      slug = generateSlug(title.trim());
      const [slugCheck] = await pool.execute(
        "SELECT id FROM blogs WHERE slug = ? AND id != ? AND deleted_at IS NULL",
        [slug, id]
      );
      if (slugCheck.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const blogStatus =
      status && ["draft", "published", "archived"].includes(status) ? status : undefined;

    await pool.execute(
      `UPDATE blogs SET
        title = COALESCE(?, title),
        slug = ?,
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        start_date = CASE WHEN ? IS NOT NULL THEN ? ELSE start_date END,
        end_date = CASE WHEN ? IS NOT NULL THEN ? ELSE end_date END,
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        updated_at = NOW()
       WHERE id = ?`,
      [
        title?.trim() || null,
        slug,
        description !== undefined ? description : null,
        blogStatus || null,
        start_date !== undefined ? 'set' : null,
        start_date !== undefined ? start_date || null : null,
        end_date !== undefined ? 'set' : null,
        end_date !== undefined ? end_date || null : null,
        meta_title?.trim() || null,
        meta_description?.trim() || null,
        id,
      ]
    );

    const [rows] = await pool.execute(
      `SELECT b.*, u.name as author_name, u.avatar as author_avatar
       FROM blogs b LEFT JOIN users u ON u.id = b.user_id
       WHERE b.id = ?`,
      [id]
    );

    const r = rows[0];
    return successResponse(res, {
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      status: r.status,
      startDate: r.start_date,
      endDate: r.end_date,
      metaTitle: r.meta_title,
      metaDescription: r.meta_description,
      likeCount: r.like_count,
      viewCount: r.view_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      author: { name: r.author_name, avatar: r.author_avatar },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/blogs/:id - Soft delete a blog (auth required, owner or Admin/Manager)
 */
export async function deleteBlog(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const [existing] = await pool.execute(
      "SELECT id, user_id FROM blogs WHERE id = ? AND deleted_at IS NULL",
      [id]
    );
    if (existing.length === 0) {
      return errorResponse(res, "Blog not found", 404);
    }

    const blog = existing[0];

    if (role === "User" && blog.user_id !== userId) {
      return errorResponse(res, "You do not have permission to delete this blog", 403);
    }

    await pool.execute("UPDATE blogs SET deleted_at = NOW() WHERE id = ?", [id]);

    return successResponse(res, null, "Blog deleted successfully");
  } catch (error) {
    next(error);
  }
}
