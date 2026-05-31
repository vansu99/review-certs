import { Router } from "express";
import {
  getPublishedBlogs,
  getBlogBySlug,
  toggleBlogLike,
  getBlogLikeStatus,
  getManagedBlogs,
  getManagedBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ─────────────────────────────────────────────
// PUBLIC routes (no auth required)
// ─────────────────────────────────────────────

// GET /api/blogs - List published blogs
router.get("/", getPublishedBlogs);

// GET /api/blogs/:slug - Get single published blog by slug
router.get("/slug/:slug", getBlogBySlug);

// POST /api/blogs/:id/like - Toggle like (guest-friendly, optional auth)
router.post("/:id/like", (req, res, next) => {
  // Try to authenticate but don't fail if no token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authenticate(req, res, next);
  }
  next();
}, toggleBlogLike);

// GET /api/blogs/:id/like-status - Check like status
router.get("/:id/like-status", (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authenticate(req, res, next);
  }
  next();
}, getBlogLikeStatus);

// ─────────────────────────────────────────────
// PROTECTED routes (auth required)
// ─────────────────────────────────────────────

// GET /api/blogs/manage - List all blogs for management
router.get("/manage", authenticate, getManagedBlogs);

// GET /api/blogs/manage/:id - Get single blog for editing
router.get("/manage/:id", authenticate, getManagedBlogById);

// POST /api/blogs - Create blog
router.post("/", authenticate, createBlog);

// PUT /api/blogs/:id - Update blog
router.put("/:id", authenticate, updateBlog);

// DELETE /api/blogs/:id - Delete blog
router.delete("/:id", authenticate, deleteBlog);

export default router;
