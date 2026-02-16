import { Router } from "express";
import {
  getDashboardStats,
  getRecentActivity,
  getHeatmapData,
  getStreakData,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats - Get user stats
router.get("/stats", getDashboardStats);

// GET /api/dashboard/recent-activity - Get recent activity
router.get("/recent-activity", getRecentActivity);

// GET /api/dashboard/heatmap - Get heatmap contribution data (365 days)
router.get("/heatmap", getHeatmapData);

// GET /api/dashboard/streak - Get streak statistics
router.get("/streak", getStreakData);

export default router;
