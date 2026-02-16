import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Calculate award tier based on average score
 */
function calculateAwardTier(avgScore) {
  if (avgScore >= 100) return "perfect";
  if (avgScore >= 95) return "diamond";
  if (avgScore >= 90) return "gold";
  if (avgScore >= 80) return "silver";
  return "bronze";
}

/**
 * Safely parse exam_ids which may be JSON array, comma-separated string, or single string
 */
function parseExamIds(examIdsValue) {
  if (!examIdsValue) return [];

  // If it's already an array (shouldn't happen but just in case)
  if (Array.isArray(examIdsValue)) return examIdsValue;

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(examIdsValue);
    if (Array.isArray(parsed)) return parsed;
    // If parsed to a single value, wrap in array
    return [parsed];
  } catch {
    // Not valid JSON, treat as comma-separated string or single ID
    if (typeof examIdsValue === "string") {
      if (examIdsValue.includes(",")) {
        return examIdsValue.split(",").map((id) => id.trim());
      }
      return [examIdsValue.trim()];
    }
    return [];
  }
}

/**
 * Get user's goals
 * GET /api/goals
 */
export async function getGoals(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, priority } = req.query;

    let query = `
      SELECT g.*, c.name as categoryName
      FROM goals g
      LEFT JOIN categories c ON c.id = g.category_id AND c.deleted_at IS NULL
      WHERE g.user_id = ? AND g.deleted_at IS NULL
    `;
    const params = [userId];

    if (status && status !== "all") {
      query += " AND g.status = ?";
      params.push(status);
    }

    if (priority && priority !== "all") {
      query += " AND g.priority = ?";
      params.push(priority);
    }

    query += " ORDER BY g.created_at DESC";

    const [rows] = await pool.execute(query, params);

    // Map goals with basic info
    const goals = await Promise.all(
      rows.map(async (row) => {
        const examIds = parseExamIds(row.exam_ids);

        let topScores = [];
        let examTitles = [];

        // Try to get exam scores (may fail if table doesn't exist)
        try {
          const [scoreRows] = await pool.execute(
            `SELECT exam_id, exam_title, score, completed_at
             FROM goal_exam_scores
             WHERE goal_id = ?
             ORDER BY score DESC
             LIMIT 5`,
            [row.id],
          );
          topScores = scoreRows.map((s) => ({
            examId: s.exam_id,
            examTitle: s.exam_title,
            score: s.score,
            completedAt: s.completed_at,
          }));
        } catch {
          // Table may not exist, continue with empty scores
        }

        // Try to get exam titles
        try {
          if (examIds.length > 0) {
            const [testRows] = await pool.execute(
              `SELECT id, title FROM tests WHERE id IN (${examIds.map(() => "?").join(",")}) AND deleted_at IS NULL`,
              examIds,
            );
            examTitles = testRows.map((t) => t.title);
          }
        } catch {
          // Continue with empty titles
        }

        // Calculate progress
        const completed = topScores.filter(
          (s) => s.score >= row.passing_score,
        ).length;
        const total = examIds.length || 1;
        const percentage = Math.round((completed / total) * 100);
        const averageScore =
          topScores.length > 0
            ? Math.round(
                topScores.reduce((sum, s) => sum + s.score, 0) /
                  topScores.length,
              )
            : 0;

        return {
          id: row.id,
          name: row.name,
          description: row.description,
          targetType: row.target_type,
          categoryId: row.category_id,
          categoryName: row.categoryName,
          examIds,
          examTitles,
          passingScore: row.passing_score,
          startDate: row.start_date,
          endDate: row.end_date,
          status: row.status,
          awardTier: calculateAwardTier(averageScore),
          priority: row.priority,
          progress: {
            completed,
            total,
            percentage,
            averageScore,
          },
          topScores,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }),
    );

    // Calculate stats from all user goals
    const [allGoals] = await pool.execute(
      "SELECT status FROM goals WHERE user_id = ?",
      [userId],
    );

    const stats = {
      active: allGoals.filter((g) => g.status === "active").length,
      completed: allGoals.filter((g) => g.status === "completed").length,
      overdue: allGoals.filter((g) => g.status === "overdue").length,
      successRate:
        allGoals.length > 0
          ? Math.round(
              (allGoals.filter((g) => g.status === "completed").length /
                allGoals.length) *
                100,
            )
          : 0,
    };

    return successResponse(res, { goals, stats });
  } catch (error) {
    next(error);
  }
}

/**
 * Get goal by ID
 * GET /api/goals/:id
 */
export async function getGoalById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `
      SELECT g.*, c.name as categoryName
      FROM goals g
      LEFT JOIN categories c ON c.id = g.category_id AND c.deleted_at IS NULL
      WHERE g.id = ? AND g.user_id = ? AND g.deleted_at IS NULL
    `,
      [id, userId],
    );

    if (rows.length === 0) {
      return errorResponse(res, "Goal not found", 404);
    }

    const row = rows[0];
    const examIds = parseExamIds(row.exam_ids);

    // Get scores
    const [scoreRows] = await pool.execute(
      `
      SELECT exam_id, exam_title, score, completed_at
      FROM goal_exam_scores
      WHERE goal_id = ?
      ORDER BY score DESC
    `,
      [id],
    );

    const topScores = scoreRows.map((s) => ({
      examId: s.exam_id,
      examTitle: s.exam_title,
      score: s.score,
      completedAt: s.completed_at,
    }));

    const completed = topScores.filter(
      (s) => s.score >= row.passing_score,
    ).length;
    const total = examIds.length || 1;
    const percentage = Math.round((completed / total) * 100);
    const averageScore =
      topScores.length > 0
        ? Math.round(
            topScores.reduce((sum, s) => sum + s.score, 0) / topScores.length,
          )
        : 0;

    const goal = {
      id: row.id,
      name: row.name,
      description: row.description,
      targetType: row.target_type,
      categoryId: row.category_id,
      categoryName: row.categoryName,
      examIds,
      examTitles: [],
      passingScore: row.passing_score,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      awardTier: calculateAwardTier(averageScore),
      priority: row.priority,
      progress: {
        completed,
        total,
        percentage,
        averageScore,
      },
      topScores,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return successResponse(res, goal);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new goal
 * POST /api/goals
 */
export async function createGoal(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      targetType,
      categoryId,
      examIds: providedExamIds,
      passingScore,
      startDate,
      endDate,
      priority,
    } = req.body;

    if (!name) {
      return errorResponse(res, "Name is required", 400);
    }

    let examIds = providedExamIds || [];

    // If targetType is 'category', fetch all exam IDs from that category
    if (targetType === "category") {
      if (!categoryId) {
        return errorResponse(
          res,
          "Category ID is required when target type is 'category'",
          400,
        );
      }

      const [categoryExams] = await pool.execute(
        "SELECT id FROM tests WHERE category_id = ? AND deleted_at IS NULL",
        [categoryId],
      );

      if (categoryExams.length === 0) {
        return errorResponse(res, "No exams found in selected category", 400);
      }

      examIds = categoryExams.map((exam) => exam.id);
    } else if (examIds.length === 0) {
      return errorResponse(
        res,
        "Exam IDs are required when target type is 'exams'",
        400,
      );
    }

    const id = uuidv4();

    await pool.execute(
      `
      INSERT INTO goals (id, user_id, name, description, target_type, category_id, exam_ids, passing_score, start_date, end_date, status, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `,
      [
        id,
        userId,
        name,
        description || "",
        targetType || "exams",
        categoryId || null,
        JSON.stringify(examIds),
        passingScore || 70,
        startDate,
        endDate,
        priority || "medium",
      ],
    );

    const goal = {
      id,
      name,
      description: description || "",
      targetType: targetType || "exams",
      categoryId,
      examIds,
      passingScore: passingScore || 70,
      startDate,
      endDate,
      status: "active",
      awardTier: "bronze",
      priority: priority || "medium",
      progress: {
        completed: 0,
        total: examIds.length,
        percentage: 0,
        averageScore: 0,
      },
      topScores: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return successResponse(res, goal, "Goal created successfully", 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a goal
 * PUT /api/goals/:id
 */
export async function updateGoal(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      name,
      description,
      passingScore,
      startDate,
      endDate,
      priority,
      status,
    } = req.body;

    const [existing] = await pool.execute(
      "SELECT id FROM goals WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (existing.length === 0) {
      return errorResponse(res, "Goal not found", 404);
    }

    await pool.execute(
      `
      UPDATE goals SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        passing_score = COALESCE(?, passing_score),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `,
      [
        name,
        description,
        passingScore,
        startDate,
        endDate,
        priority,
        status,
        id,
        userId,
      ],
    );

    return successResponse(res, { id }, "Goal updated successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a goal
 * DELETE /api/goals/:id
 */
export async function deleteGoal(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await pool.execute(
      "SELECT id FROM goals WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
      [id, userId],
    );

    if (existing.length === 0) {
      return errorResponse(res, "Goal not found", 404);
    }

    await pool.execute(
      "UPDATE goals SET deleted_at = NOW() WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    return successResponse(res, null, "Goal deleted successfully");
  } catch (error) {
    next(error);
  }
}
