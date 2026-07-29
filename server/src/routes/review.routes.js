import { Router } from "express";
import {
  getReviewQuestions,
  getReviewSummary,
} from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/summary", getReviewSummary);
router.get("/questions", getReviewQuestions);

export default router;
