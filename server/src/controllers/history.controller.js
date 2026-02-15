import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * Get user's test history
 * GET /api/history
 */
export async function getTestHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      categoryId,
      status,
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    let query = `
      SELECT 
        ta.id, ta.id as attemptId, ta.test_id, t.title as testTitle,
        t.category_id, c.name as categoryName, c.icon as categoryIcon,
        ta.score, ta.total_questions, ta.correct_answers,
        TIMESTAMPDIFF(MINUTE, ta.started_at, ta.completed_at) as duration,
        ta.completed_at,
        t.passing_score,
        (ta.score >= t.passing_score) as isPassed
      FROM test_attempts ta
      JOIN tests t ON t.id = ta.test_id AND t.deleted_at IS NULL
      JOIN categories c ON c.id = t.category_id AND c.deleted_at IS NULL
      WHERE ta.user_id = ?`;
    const params = [userId];

    // Apply filters
    if (categoryId) {
      query += " AND t.category_id = ?";
      params.push(categoryId);
    }

    if (status === "passed") {
      query += " AND ta.score >= t.passing_score";
    } else if (status === "failed") {
      query += " AND ta.score < t.passing_score";
    }

    // Apply sorting
    if (sortBy === "score") {
      query += ` ORDER BY ta.score ${sortOrder === "asc" ? "ASC" : "DESC"}`;
    } else {
      query += ` ORDER BY ta.completed_at ${sortOrder === "asc" ? "ASC" : "DESC"}`;
    }

    // Get total count for stats
    const [allItems] = await pool.execute(query, params);

    // Calculate stats
    const stats = {
      totalTests: allItems.length,
      passedTests: allItems.filter((item) => item.isPassed).length,
      failedTests: allItems.filter((item) => !item.isPassed).length,
      averageScore:
        allItems.length > 0
          ? Math.round(
              allItems.reduce((sum, item) => sum + item.score, 0) /
                allItems.length,
            )
          : 0,
    };

    // Apply pagination - use string interpolation since mysql2 doesn't support integers for LIMIT/OFFSET
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);
    query += ` LIMIT ${limitVal} OFFSET ${offset}`;

    const [rows] = await pool.execute(query, params);

    const items = rows.map((row) => ({
      id: row.id,
      attemptId: row.attemptId,
      testId: row.test_id,
      testTitle: row.testTitle,
      categoryId: row.category_id,
      categoryName: row.categoryName,
      categoryIcon: row.categoryIcon,
      score: row.score,
      totalQuestions: row.total_questions,
      correctAnswers: row.correct_answers,
      duration: row.duration || 0,
      completedAt: row.completed_at,
      isPassed: Boolean(row.isPassed),
    }));

    return successResponse(res, {
      items,
      stats,
      totalPages: Math.ceil(allItems.length / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get attempt details by ID
 * GET /api/attempts/:id
 */
export async function getAttemptById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get attempt
    const [attemptRows] = await pool.execute(
      `
      SELECT 
        ta.id, ta.test_id, ta.user_id, ta.score, ta.total_questions, 
        ta.correct_answers, ta.started_at, ta.completed_at
      FROM test_attempts ta
      WHERE ta.id = ? AND ta.user_id = ?
    `,
      [id, userId],
    );

    if (attemptRows.length === 0) {
      return errorResponse(res, "Attempt not found", 404);
    }

    const attemptRow = attemptRows[0];

    // Get test info
    const [testRows] = await pool.execute(
      `
      SELECT id, category_id, title, description, duration, difficulty, passing_score
      FROM tests WHERE id = ? AND deleted_at IS NULL
    `,
      [attemptRow.test_id],
    );

    const test = testRows[0];

    // Get questions with options
    const [questionRows] = await pool.execute(
      `
      SELECT id, content, type, explanation, order_index
      FROM questions WHERE test_id = ? AND deleted_at IS NULL
      ORDER BY order_index ASC
    `,
      [attemptRow.test_id],
    );

    const questionIds = questionRows.map((q) => q.id);

    // Get options (only if there are questions)
    let optionRows = [];
    if (questionIds.length > 0) {
      const [rows] = await pool.execute(
        `
        SELECT id, question_id, content, is_correct
        FROM answer_options
        WHERE question_id IN (${questionIds.map(() => "?").join(",")})
      `,
        questionIds,
      );
      optionRows = rows;
    }

    // Build options and correct answer maps
    const optionsMap = {};
    const correctAnswerMap = {};

    optionRows.forEach((opt) => {
      if (!optionsMap[opt.question_id]) {
        optionsMap[opt.question_id] = [];
      }
      optionsMap[opt.question_id].push({
        id: opt.id,
        content: opt.content,
        isCorrect: Boolean(opt.is_correct),
      });

      if (opt.is_correct) {
        if (!correctAnswerMap[opt.question_id]) {
          correctAnswerMap[opt.question_id] = [];
        }
        correctAnswerMap[opt.question_id].push(opt.id);
      }
    });

    // Get user's answers for this attempt
    const [answerRows] = await pool.execute(
      `
      SELECT question_id, selected_option_ids
      FROM test_attempt_answers WHERE attempt_id = ?
    `,
      [id],
    );

    const answers = {};
    answerRows.forEach((a) => {
      answers[a.question_id] = JSON.parse(a.selected_option_ids || "[]");
    });

    // Build response
    const questions = questionRows.map((q) => ({
      id: q.id,
      content: q.content,
      type: q.type,
      explanation: q.explanation,
      options: optionsMap[q.id] || [],
    }));

    const attempt = {
      id: attemptRow.id,
      testId: attemptRow.test_id,
      userId: attemptRow.user_id,
      answers,
      score: attemptRow.score,
      totalQuestions: attemptRow.total_questions,
      correctAnswers: attemptRow.correct_answers,
      startedAt: attemptRow.started_at,
      completedAt: attemptRow.completed_at,
    };

    const testResponse = {
      id: test.id,
      categoryId: test.category_id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      questionCount: questions.length,
      questions,
      difficulty: test.difficulty,
      participants: 0,
      passingScore: test.passing_score,
    };

    return successResponse(res, {
      attempt,
      test: testResponse,
      correctAnswerMap,
    });
  } catch (error) {
    next(error);
  }
}
