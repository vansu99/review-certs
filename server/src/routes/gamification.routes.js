import express from 'express';
import { getBadges } from '../controllers/gamification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/badges', getBadges);

export default router;
