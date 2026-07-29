import { Router } from "express";
import {
  login,
  requestOtp,
  verifyOtp,
  socialRedirect,
  socialCallback,
  getAvailableMethods,
  logout,
  getProfile,
  updateProfile,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authFeatureFlag } from "../middleware/authFeatureFlag.js";
import { rateLimit, keyFromEmailAndIp, keyFromEmail, keyFromIp } from "../middleware/rateLimit.js";

const router = Router();

// ─── Public: Method Discovery ────────────────────────────────────────────────
// GET /api/auth/methods — Frontend calls this to know which login buttons to show
router.get("/methods", getAvailableMethods);

// ─── Public: Password Login ──────────────────────────────────────────────────
router.post(
  "/login",
  authFeatureFlag("password"),
  rateLimit("LOGIN_ATTEMPT", keyFromEmailAndIp),
  login,
);

// ─── Public: OTP Flow ────────────────────────────────────────────────────────
router.post(
  "/otp/request",
  authFeatureFlag("otp"),
  rateLimit("OTP_REQUEST", keyFromEmail),
  requestOtp,
);

router.post(
  "/otp/verify",
  authFeatureFlag("otp"),
  rateLimit("OTP_VERIFY", keyFromEmail),
  verifyOtp,
);

// ─── Public: Social OAuth ────────────────────────────────────────────────────
router.get("/social/:provider", rateLimit("SOCIAL_LOGIN", keyFromIp), socialRedirect);

router.get("/social/:provider/callback", socialCallback);

// ─── Protected Routes ────────────────────────────────────────────────────────
router.post("/logout", authenticate, logout);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
