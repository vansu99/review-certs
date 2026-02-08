import { Router } from "express";
import {
  getTestById,
  submitTest,
  createTest,
  updateTest,
  deleteTest,
} from "../controllers/test.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/tests/submit - Submit test answers
router.post("/submit", submitTest);

// GET /api/tests/:id - Get test by ID
router.get("/:id", getTestById);

// POST /api/tests - Create test (Admin/Manager only)
router.post("/", authorize("Admin", "Manager"), createTest);

// PUT /api/tests/:id - Update test (Admin/Manager only)
router.put("/:id", authorize("Admin", "Manager"), updateTest);

// DELETE /api/tests/:id - Delete test (Admin/Manager only)
router.delete("/:id", authorize("Admin", "Manager"), deleteTest);

export default router;
