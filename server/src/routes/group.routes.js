import express from "express";
import * as groupController from "../controllers/group.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All group routes require authentication
router.use(authenticate);

router.get("/", groupController.getGroups);
router.post("/", groupController.createGroup);
router.get("/:id", groupController.getGroupById);
router.post("/:id/members", groupController.addMember);
router.post("/:id/exams", groupController.addExams);
router.delete("/:id/exams/:testId", groupController.removeExam);
router.post("/:id/reset", groupController.resetProgress);
router.get("/:id/leaderboard", groupController.getLeaderboard);
router.get("/:id/discussions", groupController.getDiscussions);
router.post("/:id/discussions", groupController.postComment);

export default router;
