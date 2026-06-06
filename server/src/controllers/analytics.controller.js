import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";

// Whitelist map: query param → SQL interval string
const PERIOD_MAP = {
  "30d": "30 DAY",
  "90d": "90 DAY",
  "6m": "6 MONTH",
  "1y": "1 YEAR",
};

/**
 * Get score trend for the authenticated user
 * GET /api/analytics/score-trend?period=30d
 */
export async function getScoreTrend(req, res, next) {
  try {
    const userId = req.user.id;
    const period = req.query.period || "30d";

    // Validate period against whitelist
    const interval = PERIOD_MAP[period];
    if (!interval) {
      return errorResponse(
        res,
        "Invalid period. Allowed: 30d, 90d, 6m, 1y",
        400,
      );
    }

    // interval comes from a hardcoded whitelist — safe to interpolate
    const [rows] = await pool.execute(
      `SELECT
        ta.id          AS attemptId,
        t.title        AS testTitle,
        ta.score,
        t.passing_score AS passingScore,
        ta.completed_at AS completedAt
      FROM test_attempts ta
      JOIN tests t ON t.id = ta.test_id
      WHERE ta.user_id = ?
        AND ta.completed_at IS NOT NULL
        AND ta.completed_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      ORDER BY ta.completed_at ASC`,
      [userId],
    );

    const data = rows.map((row) => ({
      attemptId: row.attemptId,
      testTitle: row.testTitle,
      score: row.score,
      passingScore: row.passingScore,
      completedAt: row.completedAt,
    }));

    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

/**
 * Get category performance for the authenticated user
 * GET /api/analytics/category-performance
 */
export async function getCategoryPerformance(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT
        c.id                                          AS categoryId,
        c.name                                        AS categoryName,
        c.icon                                        AS categoryIcon,
        ROUND(AVG(ta.score), 0)                       AS averageScore,
        ROUND(
          SUM(CASE WHEN ta.score >= t.passing_score THEN 1 ELSE 0 END)
          * 100.0 / COUNT(*), 0
        )                                             AS passRate,
        COUNT(*)                                      AS attemptCount
      FROM test_attempts ta
      JOIN tests t      ON t.id = ta.test_id
      JOIN categories c ON c.id = t.category_id
      WHERE ta.user_id = ?
        AND ta.completed_at IS NOT NULL
      GROUP BY c.id, c.name, c.icon
      ORDER BY attemptCount DESC`,
      [userId],
    );

    const data = rows.map((row) => ({
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      categoryIcon: row.categoryIcon,
      averageScore: Number(row.averageScore),
      passRate: Number(row.passRate),
      attemptCount: Number(row.attemptCount),
    }));

    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

/**
 * Get question type stats for the authenticated user
 * GET /api/analytics/question-type-stats
 */
export async function getQuestionTypeStats(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT
        q.type                                              AS questionType,
        SUM(CASE WHEN taa.is_correct = 1 THEN 1 ELSE 0 END) AS correctCount,
        SUM(CASE WHEN taa.is_correct = 0 THEN 1 ELSE 0 END) AS incorrectCount,
        COUNT(*)                                            AS totalCount
      FROM test_attempt_answers taa
      JOIN test_attempts ta ON ta.id = taa.attempt_id
      JOIN questions q      ON q.id = taa.question_id
      WHERE ta.user_id = ?
        AND ta.completed_at IS NOT NULL
      GROUP BY q.type`,
      [userId],
    );

    const data = rows.map((row) => ({
      questionType: row.questionType,
      correctCount: Number(row.correctCount),
      incorrectCount: Number(row.incorrectCount),
      totalCount: Number(row.totalCount),
    }));

    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}
