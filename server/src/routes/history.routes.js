import { Router } from "express";
import {
  getTestHistory,
  getAttemptById,
} from "../controllers/history.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/history - Get user's test history
router.get("/", getTestHistory);

// GET /api/attempts/:id - Get attempt details
router.get("/:id", getAttemptById);

export default router;
