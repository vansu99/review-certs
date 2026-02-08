import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get test by ID with questions and options
 * GET /api/tests/:id
 */
export async function getTestById(req, res, next) {
  try {
    const { id } = req.params;

    // Get test info
    const [testRows] = await pool.execute(
      `
      SELECT 
        t.id, t.category_id, t.title, t.description, t.duration, 
        t.difficulty, t.passing_score, t.image_url, t.video_url,
        t.created_at, t.updated_at,
        COUNT(DISTINCT ta.id) as participants
      FROM tests t
      LEFT JOIN test_attempts ta ON ta.test_id = t.id
      WHERE t.id = ?
      GROUP BY t.id
    `,
      [id],
    );

    if (testRows.length === 0) {
      return errorResponse(res, "Test not found", 404);
    }

    const test = testRows[0];

    // Get questions
    const [questionRows] = await pool.execute(
      `
      SELECT id, content, type, explanation, order_index
      FROM questions
      WHERE test_id = ?
      ORDER BY order_index ASC
    `,
      [id],
    );

    // Get options for all questions
    const questionIds = questionRows.map((q) => q.id);
    let optionsMap = {};

    if (questionIds.length > 0) {
      const [optionRows] = await pool.execute(
        `
        SELECT id, question_id, content, is_correct, order_index
        FROM answer_options
        WHERE question_id IN (${questionIds.map(() => "?").join(",")})
        ORDER BY order_index ASC
      `,
        questionIds,
      );

      // Group options by question
      optionsMap = optionRows.reduce((acc, opt) => {
        if (!acc[opt.question_id]) {
          acc[opt.question_id] = [];
        }
        acc[opt.question_id].push({
          id: opt.id,
          content: opt.content,
          isCorrect: Boolean(opt.is_correct),
        });
        return acc;
      }, {});
    }

    // Build response
    const questions = questionRows.map((q) => ({
      id: q.id,
      content: q.content,
      type: q.type,
      explanation: q.explanation,
      options: optionsMap[q.id] || [],
    }));

    const response = {
      id: test.id,
      categoryId: test.category_id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      questionCount: questions.length,
      questions,
      difficulty: test.difficulty,
      participants: parseInt(test.participants) || 0,
      passingScore: test.passing_score,
      videoUrl: test.video_url,
      imageUrl: test.image_url,
      createdAt: test.created_at,
      updatedAt: test.updated_at,
    };

    return successResponse(res, response);
  } catch (error) {
    next(error);
  }
}

/**
 * Get tests by category
 * GET /api/categories/:categoryId/tests
 */
export async function getTestsByCategory(req, res, next) {
  try {
    const { categoryId } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        t.id, t.category_id, t.title, t.description, t.duration, 
        t.difficulty, t.passing_score, t.image_url, t.video_url,
        t.created_at, t.updated_at,
        COUNT(DISTINCT q.id) as questionCount,
        COUNT(DISTINCT ta.id) as participants
      FROM tests t
      LEFT JOIN questions q ON q.test_id = t.id
      LEFT JOIN test_attempts ta ON ta.test_id = t.id
      WHERE t.category_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `,
      [categoryId],
    );

    const tests = rows.map((row) => ({
      id: row.id,
      categoryId: row.category_id,
      title: row.title,
      description: row.description,
      duration: row.duration,
      questionCount: parseInt(row.questionCount) || 0,
      questions: [], // Don't include questions in list view
      difficulty: row.difficulty,
      participants: parseInt(row.participants) || 0,
      passingScore: row.passing_score,
      videoUrl: row.video_url,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return successResponse(res, tests);
  } catch (error) {
    next(error);
  }
}

/**
 * Submit test answers
 * POST /api/tests/submit
 */
export async function submitTest(req, res, next) {
  try {
    const { testId, answers } = req.body;
    const userId = req.user.id;

    if (!testId || !answers) {
      return errorResponse(res, "Test ID and answers are required", 400);
    }

    // Get test info
    const [testRows] = await pool.execute(
      `
      SELECT id, category_id, title, description, duration, difficulty, passing_score
      FROM tests WHERE id = ?
    `,
      [testId],
    );

    if (testRows.length === 0) {
      return errorResponse(res, "Test not found", 404);
    }

    const test = testRows[0];

    // Get questions with correct answers
    const [questionRows] = await pool.execute(
      `
      SELECT q.id, q.content, q.type, q.explanation
      FROM questions q
      WHERE q.test_id = ?
    `,
      [testId],
    );

    const questionIds = questionRows.map((q) => q.id);

    // Get all options for questions
    const [optionRows] = await pool.execute(
      `
      SELECT question_id, id, content, is_correct
      FROM answer_options
      WHERE question_id IN (${questionIds.map(() => "?").join(",")})
    `,
      questionIds,
    );

    // Build correct answer map
    const correctAnswerMap = {};
    const optionsMap = {};

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

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = questionRows.length;

    questionRows.forEach((q) => {
      const userAnswerIds = answers[q.id] || [];
      const correctIds = correctAnswerMap[q.id] || [];

      // Check if user's answers match correct answers exactly
      const isCorrect =
        correctIds.length === userAnswerIds.length &&
        correctIds.every((id) => userAnswerIds.includes(id));

      if (isCorrect) {
        correctAnswers++;
      }
    });

    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    // Create attempt record
    const attemptId = uuidv4();
    const startedAt = new Date(Date.now() - 1000 * 60 * 15); // Assume 15 mins ago
    const completedAt = new Date();

    await pool.execute(
      `
      INSERT INTO test_attempts (id, test_id, user_id, score, total_questions, correct_answers, started_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        attemptId,
        testId,
        userId,
        score,
        totalQuestions,
        correctAnswers,
        startedAt,
        completedAt,
      ],
    );

    // Save individual answers
    for (const questionId of Object.keys(answers)) {
      const selectedIds = answers[questionId] || [];
      const correctIds = correctAnswerMap[questionId] || [];
      const isCorrect =
        correctIds.length === selectedIds.length &&
        correctIds.every((id) => selectedIds.includes(id));

      await pool.execute(
        `
        INSERT INTO test_attempt_answers (id, attempt_id, question_id, selected_option_ids, is_correct)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          uuidv4(),
          attemptId,
          questionId,
          JSON.stringify(selectedIds),
          isCorrect,
        ],
      );
    }

    // Build response
    const questions = questionRows.map((q) => ({
      id: q.id,
      content: q.content,
      type: q.type,
      explanation: q.explanation,
      options: optionsMap[q.id] || [],
    }));

    const attempt = {
      id: attemptId,
      testId,
      userId,
      answers,
      score,
      totalQuestions,
      correctAnswers,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
    };

    const testResponse = {
      id: test.id,
      categoryId: test.category_id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      questionCount: totalQuestions,
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

/**
 * Create a new test
 * POST /api/tests
 */
export async function createTest(req, res, next) {
  try {
    const {
      categoryId,
      title,
      description,
      duration,
      difficulty,
      passingScore,
      questions,
    } = req.body;

    if (!categoryId || !title) {
      return errorResponse(res, "Category ID and title are required", 400);
    }

    const testId = uuidv4();

    await pool.execute(
      `
      INSERT INTO tests (id, category_id, title, description, duration, difficulty, passing_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        testId,
        categoryId,
        title,
        description || "",
        duration || 30,
        difficulty || "Beginner",
        passingScore || 70,
      ],
    );

    // If questions are provided, add them
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionId = uuidv4();

        await pool.execute(
          `
          INSERT INTO questions (id, test_id, content, type, explanation, order_index)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
          [
            questionId,
            testId,
            q.content,
            q.type || "single",
            q.explanation || "",
            i,
          ],
        );

        // Add options
        if (q.options && Array.isArray(q.options)) {
          for (let j = 0; j < q.options.length; j++) {
            const opt = q.options[j];
            await pool.execute(
              `
              INSERT INTO answer_options (id, question_id, content, is_correct, order_index)
              VALUES (?, ?, ?, ?, ?)
            `,
              [uuidv4(), questionId, opt.content, opt.isCorrect || false, j],
            );
          }
        }
      }
    }

    const test = {
      id: testId,
      categoryId,
      title,
      description: description || "",
      duration: duration || 30,
      questionCount: questions?.length || 0,
      questions: [],
      difficulty: difficulty || "Beginner",
      participants: 0,
      passingScore: passingScore || 70,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return successResponse(res, test, "Test created successfully", 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a test
 * PUT /api/tests/:id
 */
export async function updateTest(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, duration, difficulty, passingScore } = req.body;

    const [existing] = await pool.execute("SELECT id FROM tests WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return errorResponse(res, "Test not found", 404);
    }

    await pool.execute(
      `
      UPDATE tests SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        duration = COALESCE(?, duration),
        difficulty = COALESCE(?, difficulty),
        passing_score = COALESCE(?, passing_score),
        updated_at = NOW()
      WHERE id = ?
    `,
      [title, description, duration, difficulty, passingScore, id],
    );

    return successResponse(res, { id }, "Test updated successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a test
 * DELETE /api/tests/:id
 */
export async function deleteTest(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute("SELECT id FROM tests WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return errorResponse(res, "Test not found", 404);
    }

    await pool.execute("DELETE FROM tests WHERE id = ?", [id]);

    return successResponse(res, null, "Test deleted successfully");
  } catch (error) {
    next(error);
  }
}
