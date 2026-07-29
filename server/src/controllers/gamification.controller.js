import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * Get all badges and user's unlocked badges
 * GET /api/gamification/badges
 */
export async function getBadges(req, res, next) {
  try {
    const userId = req.user.id;

    // Get all badges
    const [allBadges] = await pool.execute("SELECT * FROM badges ORDER BY created_at ASC");

    // Get user's earned badges
    const [userBadgesRows] = await pool.execute(
      "SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?",
      [userId]
    );

    const userBadgeMap = {};
    userBadgesRows.forEach(row => {
      userBadgeMap[row.badge_id] = row.earned_at;
    });

    const badges = allBadges.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      isUnlocked: !!userBadgeMap[badge.id],
      earnedAt: userBadgeMap[badge.id] || null
    }));

    return successResponse(res, badges);
  } catch (error) {
    next(error);
  }
}
