import { Router } from "express";
import {
  getDashboardStats,
  getRecentActivity,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats - Get user stats
router.get("/stats", getDashboardStats);

// GET /api/dashboard/recent-activity - Get recent activity
router.get("/recent-activity", getRecentActivity);

export default router;
