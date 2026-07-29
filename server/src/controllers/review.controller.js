import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const WEAK_TOPIC_THRESHOLD = 70;
let categoryColumnCache = null;
let questionColumnCache = null;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function parseLimit(value) {
  return clamp(toNumber(value, DEFAULT_LIMIT), 1, MAX_LIMIT);
}

function calculateReadiness({ averageScore, passRate, coverage }) {
  if (averageScore === 0 && passRate === 0 && coverage === 0) return 0;

  return Math.round(
    clamp(averageScore * 0.5 + passRate * 0.3 + coverage * 0.2),
  );
}

async function getTableColumns(tableName) {
  const [rows] = await pool.execute(`SHOW COLUMNS FROM ${tableName}`);
  return new Set(rows.map((row) => row.Field));
}

async function getCategoryColumns() {
  if (!categoryColumnCache) {
    categoryColumnCache = await getTableColumns("categories");
  }
  return categoryColumnCache;
}

async function getQuestionColumns() {
  if (!questionColumnCache) {
    questionColumnCache = await getTableColumns("questions");
  }
  return questionColumnCache;
}

function buildCategorySql(columns) {
  const hasStatus = columns.has("status");
  const hasProvider = columns.has("provider");
  const hasCertificationCode = columns.has("certification_code");
  const hasLevel = columns.has("level");
  const hasDisplayOrder = columns.has("display_order");

  return {
    selectMetadata: [
      hasProvider ? "c.provider" : "'' AS provider",
      hasCertificationCode ? "c.certification_code AS certificationCode" : "'' AS certificationCode",
      hasLevel ? "c.level" : "'Foundation' AS level",
    ].join(",\n      "),
    publishedFilter: hasStatus ? "AND c.status = 'published'" : "",
    orderBy: hasDisplayOrder ? "c.display_order ASC, c.name ASC" : "c.name ASC",
    groupByMetadata: [
      "c.id",
      "c.name",
      "c.icon",
      hasProvider ? "c.provider" : null,
      hasCertificationCode ? "c.certification_code" : null,
      hasLevel ? "c.level" : null,
      hasDisplayOrder ? "c.display_order" : null,
    ]
      .filter(Boolean)
      .join(", "),
  };
}

function topicExpression(questionColumns, alias = "q") {
  return questionColumns.has("topic")
    ? `COALESCE(${alias}.topic, 'General')`
    : "'General'";
}

function mapCategory(row) {
  const totalTests = toNumber(row.totalTests);
  const attemptedTests = toNumber(row.attemptedTests);
  const averageScore = Math.round(toNumber(row.averageScore));
  const passRate = Math.round(toNumber(row.passRate));
  const coverage = totalTests > 0 ? Math.round((attemptedTests / totalTests) * 100) : 0;

  return {
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    categoryIcon: row.categoryIcon || "CERT",
    provider: row.provider || "",
    certificationCode: row.certificationCode || "",
    level: row.level || "Foundation",
    totalTests,
    attemptedTests,
    attemptCount: toNumber(row.attemptCount),
    averageScore,
    passRate,
    coverage,
    readiness: calculateReadiness({ averageScore, passRate, coverage }),
  };
}

function mapTopic(row) {
  const totalAnswers = toNumber(row.totalAnswers);
  const correctAnswers = toNumber(row.correctAnswers);
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  return {
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    topic: row.topic || "General",
    totalAnswers,
    correctAnswers,
    incorrectAnswers: totalAnswers - correctAnswers,
    accuracy,
    needsReview: accuracy < WEAK_TOPIC_THRESHOLD,
  };
}

async function getCategorySummary(userId) {
  const categorySql = buildCategorySql(await getCategoryColumns());

  const [rows] = await pool.execute(
    `SELECT
      c.id AS categoryId,
      c.name AS categoryName,
      c.icon AS categoryIcon,
      ${categorySql.selectMetadata},
      COUNT(DISTINCT t.id) AS totalTests,
      COUNT(DISTINCT CASE WHEN ta.id IS NOT NULL THEN t.id END) AS attemptedTests,
      COUNT(ta.id) AS attemptCount,
      COALESCE(AVG(ta.score), 0) AS averageScore,
      COALESCE(
        SUM(CASE WHEN ta.score >= t.passing_score THEN 1 ELSE 0 END) * 100.0 /
        NULLIF(COUNT(ta.id), 0),
        0
      ) AS passRate
    FROM categories c
    JOIN tests t ON t.category_id = c.id AND t.deleted_at IS NULL
    LEFT JOIN test_attempts ta
      ON ta.test_id = t.id
      AND ta.user_id = ?
      AND ta.completed_at IS NOT NULL
    WHERE c.deleted_at IS NULL ${categorySql.publishedFilter}
    GROUP BY ${categorySql.groupByMetadata}
    ORDER BY ${categorySql.orderBy}`,
    [userId],
  );

  return rows.map(mapCategory);
}

async function getWeakTopics(userId, categoryId) {
  const categorySql = buildCategorySql(await getCategoryColumns());
  const topicSql = topicExpression(await getQuestionColumns());
  const params = [userId];
  let categoryFilter = "";

  if (categoryId) {
    categoryFilter = "AND c.id = ?";
    params.push(categoryId);
  }

  const [rows] = await pool.execute(
    `SELECT
      c.id AS categoryId,
      c.name AS categoryName,
      ${topicSql} AS topic,
      COUNT(taa.id) AS totalAnswers,
      SUM(CASE WHEN taa.is_correct = 1 THEN 1 ELSE 0 END) AS correctAnswers
    FROM test_attempt_answers taa
    JOIN test_attempts ta ON ta.id = taa.attempt_id
    JOIN questions q ON q.id = taa.question_id AND q.deleted_at IS NULL
    JOIN tests t ON t.id = q.test_id AND t.deleted_at IS NULL
    JOIN categories c ON c.id = t.category_id AND c.deleted_at IS NULL
    WHERE ta.user_id = ?
      AND ta.completed_at IS NOT NULL
      ${categorySql.publishedFilter}
      ${categoryFilter}
    GROUP BY c.id, c.name, ${topicSql}
    HAVING totalAnswers >= 1
    ORDER BY (correctAnswers / totalAnswers) ASC, totalAnswers DESC
    LIMIT 10`,
    params,
  );

  return rows.map(mapTopic);
}

async function getDueCount(userId, categoryId) {
  const categorySql = buildCategorySql(await getCategoryColumns());
  const params = [userId];
  let categoryFilter = "";

  if (categoryId) {
    categoryFilter = "AND c.id = ?";
    params.push(categoryId);
  }

  const [rows] = await pool.execute(
    `SELECT COUNT(DISTINCT q.id) AS dueCount
    FROM test_attempt_answers taa
    JOIN test_attempts ta ON ta.id = taa.attempt_id
    JOIN questions q ON q.id = taa.question_id AND q.deleted_at IS NULL
    JOIN tests t ON t.id = q.test_id AND t.deleted_at IS NULL
    JOIN categories c ON c.id = t.category_id AND c.deleted_at IS NULL
    WHERE ta.user_id = ?
      AND taa.is_correct = 0
      AND ta.completed_at IS NOT NULL
      ${categorySql.publishedFilter}
      ${categoryFilter}`,
    params,
  );

  return toNumber(rows[0]?.dueCount);
}

export async function getReviewSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const { categoryId } = req.query;

    const categories = await getCategorySummary(userId);
    const activeCategories = categoryId
      ? categories.filter((category) => category.categoryId === categoryId)
      : categories;
    const weakTopics = await getWeakTopics(userId, categoryId);
    const dueCount = await getDueCount(userId, categoryId);
    const averageReadiness =
      activeCategories.length > 0
        ? Math.round(
            activeCategories.reduce((sum, category) => sum + category.readiness, 0) /
              activeCategories.length,
          )
        : 0;

    return successResponse(res, {
      readiness: averageReadiness,
      dueCount,
      weakTopicCount: weakTopics.filter((topic) => topic.needsReview).length,
      categories,
      weakTopics,
    });
  } catch (error) {
    next(error);
  }
}

async function getQuestionIdsByMode({ userId, categoryId, mode, limit }) {
  const categorySql = buildCategorySql(await getCategoryColumns());
  const questionColumns = await getQuestionColumns();
  const mainTopicSql = topicExpression(questionColumns);
  const weakTopicSql = topicExpression(questionColumns, "q2");
  const params = [userId];
  let categoryFilter = "";

  if (categoryId) {
    categoryFilter = "AND c.id = ?";
    params.push(categoryId);
  }

  if (mode === "bookmarked") {
    const [rows] = await pool.execute(
      `SELECT DISTINCT q.id AS questionId, b.created_at AS priorityAt
      FROM bookmarks b
      JOIN tests t ON t.id = b.test_id AND t.deleted_at IS NULL
      JOIN categories c ON c.id = t.category_id AND c.deleted_at IS NULL
      JOIN questions q ON q.test_id = t.id AND q.deleted_at IS NULL
      WHERE b.user_id = ?
        ${categorySql.publishedFilter}
        ${categoryFilter}
      ORDER BY b.created_at DESC
      LIMIT ${limit}`,
      params,
    );

    return rows.map((row) => row.questionId);
  }

  const onlyIncorrect = mode === "mistakes" ? "AND taa.is_correct = 0" : "";
  const weakTopicJoin =
    mode === "weak"
      ? `JOIN (
          SELECT
            t2.category_id,
            ${weakTopicSql} AS topic,
            SUM(CASE WHEN taa2.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(*) AS accuracy
          FROM test_attempt_answers taa2
          JOIN test_attempts ta2 ON ta2.id = taa2.attempt_id
          JOIN questions q2 ON q2.id = taa2.question_id AND q2.deleted_at IS NULL
          JOIN tests t2 ON t2.id = q2.test_id AND t2.deleted_at IS NULL
          WHERE ta2.user_id = ?
          GROUP BY t2.category_id, ${weakTopicSql}
          HAVING accuracy < ?
        ) weak ON weak.category_id = t.category_id
          AND weak.topic = ${mainTopicSql}`
      : "";

  const weakParams = mode === "weak" ? [userId, WEAK_TOPIC_THRESHOLD / 100] : [];

  const [rows] = await pool.execute(
    `SELECT q.id AS questionId, MAX(ta.completed_at) AS priorityAt
    FROM test_attempt_answers taa
    JOIN test_attempts ta ON ta.id = taa.attempt_id
    JOIN questions q ON q.id = taa.question_id AND q.deleted_at IS NULL
    JOIN tests t ON t.id = q.test_id AND t.deleted_at IS NULL
    JOIN categories c ON c.id = t.category_id AND c.deleted_at IS NULL
    ${weakTopicJoin}
    WHERE ta.user_id = ?
      AND ta.completed_at IS NOT NULL
      ${categorySql.publishedFilter}
      ${onlyIncorrect}
      ${categoryFilter}
    GROUP BY q.id
    ORDER BY priorityAt DESC
    LIMIT ${limit}`,
    [...weakParams, ...params],
  );

  return rows.map((row) => row.questionId);
}

async function getQuestionsByIds(questionIds) {
  if (questionIds.length === 0) return [];

  const topicSql = topicExpression(await getQuestionColumns());
  const placeholders = questionIds.map(() => "?").join(",");
  const [questionRows] = await pool.execute(
    `SELECT
      q.id, q.content, q.type, q.explanation, ${topicSql} AS topic,
      t.id AS testId, t.title AS testTitle,
      c.id AS categoryId, c.name AS categoryName
    FROM questions q
    JOIN tests t ON t.id = q.test_id AND t.deleted_at IS NULL
    JOIN categories c ON c.id = t.category_id AND c.deleted_at IS NULL
    WHERE q.id IN (${placeholders})
    ORDER BY FIELD(q.id, ${placeholders})`,
    [...questionIds, ...questionIds],
  );

  const [optionRows] = await pool.execute(
    `SELECT id, question_id, content, is_correct, order_index
    FROM answer_options
    WHERE question_id IN (${placeholders})
    ORDER BY order_index ASC`,
    questionIds,
  );

  const optionsByQuestion = optionRows.reduce((acc, option) => {
    if (!acc[option.question_id]) acc[option.question_id] = [];
    acc[option.question_id].push({
      id: option.id,
      content: option.content,
      isCorrect: Boolean(option.is_correct),
    });
    return acc;
  }, {});

  return questionRows.map((row) => ({
    id: row.id,
    content: row.content,
    type: row.type,
    explanation: row.explanation || "",
    topic: row.topic,
    testId: row.testId,
    testTitle: row.testTitle,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    options: optionsByQuestion[row.id] || [],
  }));
}

export async function getReviewQuestions(req, res, next) {
  try {
    const userId = req.user.id;
    const { categoryId, mode = "mistakes" } = req.query;
    const limit = parseLimit(req.query.limit);
    const allowedModes = ["mistakes", "weak", "bookmarked", "mixed"];

    if (!allowedModes.includes(mode)) {
      return errorResponse(res, "Invalid review mode", 400);
    }

    const questionIds = await getQuestionIdsByMode({
      userId,
      categoryId,
      mode,
      limit,
    });
    const questions = await getQuestionsByIds(questionIds);

    return successResponse(res, {
      mode,
      limit,
      questions,
    });
  } catch (error) {
    next(error);
  }
}
