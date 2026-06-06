import { Router } from "express";
import {
  getScoreTrend,
  getCategoryPerformance,
  getQuestionTypeStats,
} from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/analytics/score-trend - Get score trend over time
router.get("/score-trend", getScoreTrend);

// GET /api/analytics/category-performance - Get performance by category
router.get("/category-performance", getCategoryPerformance);

// GET /api/analytics/question-type-stats - Get stats by question type
router.get("/question-type-stats", getQuestionTypeStats);

export default router;
