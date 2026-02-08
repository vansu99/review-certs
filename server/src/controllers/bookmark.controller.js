import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * Get all bookmarks for the authenticated user
 * GET /api/bookmarks
 */
export async function getBookmarks(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT 
        b.id as bookmark_id,
        b.created_at as bookmarked_at,
        t.id,
        t.title,
        t.description,
        t.duration,
        t.difficulty,
        t.passing_score,
        c.name as category_name,
        c.icon as category_icon,
        (SELECT COUNT(*) FROM questions q WHERE q.test_id = t.id) as question_count,
        (SELECT COUNT(*) FROM test_attempts ta WHERE ta.test_id = t.id) as participants
      FROM bookmarks b
      JOIN tests t ON b.test_id = t.id
      JOIN categories c ON t.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC`,
      [userId],
    );

    const bookmarks = rows.map((row) => ({
      id: row.id,
      bookmarkId: row.bookmark_id,
      title: row.title,
      description: row.description,
      duration: row.duration,
      difficulty: row.difficulty,
      passingScore: row.passing_score,
      categoryName: row.category_name,
      categoryIcon: row.category_icon,
      questionCount: row.question_count,
      participants: row.participants,
      bookmarkedAt: row.bookmarked_at,
    }));

    return successResponse(res, bookmarks);
  } catch (error) {
    next(error);
  }
}

/**
 * Add a test to bookmarks
 * POST /api/bookmarks
 */
export async function addBookmark(req, res, next) {
  try {
    const userId = req.user.id;
    const { testId } = req.body;

    if (!testId) {
      return errorResponse(res, "Test ID is required", 400);
    }

    // Check if test exists
    const [testRows] = await pool.execute("SELECT id FROM tests WHERE id = ?", [
      testId,
    ]);
    if (testRows.length === 0) {
      return errorResponse(res, "Test not found", 404);
    }

    // Check if already bookmarked
    const [existingRows] = await pool.execute(
      "SELECT id FROM bookmarks WHERE user_id = ? AND test_id = ?",
      [userId, testId],
    );
    if (existingRows.length > 0) {
      return errorResponse(res, "Test is already bookmarked", 409);
    }

    // Create bookmark
    const bookmarkId = uuidv4();
    await pool.execute(
      "INSERT INTO bookmarks (id, user_id, test_id) VALUES (?, ?, ?)",
      [bookmarkId, userId, testId],
    );

    return successResponse(
      res,
      { id: bookmarkId, testId },
      "Bookmark added successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Remove a bookmark
 * DELETE /api/bookmarks/:testId
 */
export async function removeBookmark(req, res, next) {
  try {
    const userId = req.user.id;
    const { testId } = req.params;

    const [result] = await pool.execute(
      "DELETE FROM bookmarks WHERE user_id = ? AND test_id = ?",
      [userId, testId],
    );

    if (result.affectedRows === 0) {
      return errorResponse(res, "Bookmark not found", 404);
    }

    return successResponse(res, null, "Bookmark removed successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Check if a test is bookmarked
 * GET /api/bookmarks/check/:testId
 */
export async function checkBookmark(req, res, next) {
  try {
    const userId = req.user.id;
    const { testId } = req.params;

    const [rows] = await pool.execute(
      "SELECT id FROM bookmarks WHERE user_id = ? AND test_id = ?",
      [userId, testId],
    );

    return successResponse(res, { isBookmarked: rows.length > 0 });
  } catch (error) {
    next(error);
  }
}
