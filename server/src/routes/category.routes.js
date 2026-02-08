import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { getTestsByCategory } from "../controllers/test.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/categories - List all categories
router.get("/", getCategories);

// GET /api/categories/:id - Get category by ID
router.get("/:id", getCategoryById);

// GET /api/categories/:categoryId/tests - Get tests by category
router.get("/:categoryId/tests", getTestsByCategory);

// POST /api/categories - Create category (Admin/Manager only)
router.post("/", authorize("Admin", "Manager"), createCategory);

// PUT /api/categories/:id - Update category (Admin/Manager only)
router.put("/:id", authorize("Admin", "Manager"), updateCategory);

// DELETE /api/categories/:id - Delete category (Admin/Manager only)
router.delete("/:id", authorize("Admin", "Manager"), deleteCategory);

export default router;
