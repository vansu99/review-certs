import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { superAdminOnly } from "../middleware/rbac.js";
import {
  listAuthConfigs,
  getAuthConfigDetail,
  updateAuthConfigHandler,
  toggleAuthConfig,
} from "../controllers/config.controller.js";

const router = Router();

// All routes require authentication + Super Admin role
router.use(authenticate);
router.use(superAdminOnly);

// Auth config management
router.get("/auth", listAuthConfigs);
router.get("/auth/:method", getAuthConfigDetail);
router.put("/auth/:method", updateAuthConfigHandler);
router.put("/auth/:method/toggle", toggleAuthConfig);

export default router;
