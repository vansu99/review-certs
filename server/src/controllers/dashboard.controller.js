import pool from "../config/database.js";
import { successResponse } from "../utils/response.js";

/**
 * Get dashboard stats for the authenticated user
 * GET /api/dashboard/stats
 */
export async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    // Get test history stats
    const [attempts] = await pool.execute(
      `SELECT 
        ta.score, ta.started_at, ta.completed_at, t.passing_score
      FROM test_attempts ta
      JOIN tests t ON t.id = ta.test_id
      WHERE ta.user_id = ? AND ta.completed_at IS NOT NULL`,
      [userId],
    );

    // Calculate stats
    const testsCompleted = attempts.length;
    const averageScore =
      testsCompleted > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + a.score, 0) / testsCompleted,
          )
        : 0;

    // Calculate total study time in minutes
    let totalMinutes = 0;
    attempts.forEach((a) => {
      if (a.started_at && a.completed_at) {
        const start = new Date(a.started_at).getTime();
        const end = new Date(a.completed_at).getTime();
        totalMinutes += Math.round((end - start) / (1000 * 60));
      }
    });

    // Format total time
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Calculate streak (consecutive days with completed tests)
    const uniqueDates = [
      ...new Set(
        attempts.map(
          (a) => new Date(a.completed_at).toISOString().split("T")[0],
        ),
      ),
    ].sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    if (uniqueDates.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      // Check if the latest activity was today or yesterday
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const current = new Date(uniqueDates[i - 1]);
          const prev = new Date(uniqueDates[i]);
          const diffDays = Math.round(
            (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    return successResponse(res, {
      testsCompleted,
      averageScore,
      totalTime,
      streak,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get recent activity for the authenticated user
 * GET /api/dashboard/recent-activity
 */
export async function getRecentActivity(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const [rows] = await pool.execute(
      `SELECT 
        ta.id, t.title as test, ta.score, ta.completed_at as date
      FROM test_attempts ta
      JOIN tests t ON t.id = ta.test_id
      WHERE ta.user_id = ? AND ta.completed_at IS NOT NULL
      ORDER BY ta.completed_at DESC
      LIMIT ?`,
      [userId, limit],
    );

    const activity = rows.map((row) => ({
      id: row.id,
      test: row.test,
      score: row.score,
      date: row.date,
    }));

    return successResponse(res, activity);
  } catch (error) {
    next(error);
  }
}
