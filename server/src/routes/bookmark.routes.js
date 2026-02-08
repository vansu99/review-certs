import { Router } from "express";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark,
} from "../controllers/bookmark.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/bookmarks - List user's bookmarks
router.get("/", getBookmarks);

// POST /api/bookmarks - Add bookmark
router.post("/", addBookmark);

// DELETE /api/bookmarks/:testId - Remove bookmark
router.delete("/:testId", removeBookmark);

// GET /api/bookmarks/check/:testId - Check if test is bookmarked
router.get("/check/:testId", checkBookmark);

export default router;
