import { Router } from "express";
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/goal.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/goals - List user's goals
router.get("/", getGoals);

// GET /api/goals/:id - Get goal by ID
router.get("/:id", getGoalById);

// POST /api/goals - Create goal
router.post("/", createGoal);

// PUT /api/goals/:id - Update goal
router.put("/:id", updateGoal);

// DELETE /api/goals/:id - Delete goal
router.delete("/:id", deleteGoal);

export default router;
