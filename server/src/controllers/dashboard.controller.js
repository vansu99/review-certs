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
      LIMIT ${limit}`,
      [userId],
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

/**
 * Get heatmap data — daily activity counts for the past 365 days
 * GET /api/dashboard/heatmap?timezone=+07:00
 *
 * Aggregates completed test attempts per day, converted to the
 * client's timezone so day boundaries match the user's local time.
 */
export async function getHeatmapData(req, res, next) {
  try {
    const userId = req.user.id;
    // Accept timezone offset like "+07:00" or "-05:00"; default to UTC
    const timezone = req.query.timezone || "+00:00";

    // Calculate the start date (365 days ago from today in the given timezone)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    const startDateStr = startDate.toISOString().split("T")[0];

    const [rows] = await pool.execute(
      `SELECT 
        DATE(CONVERT_TZ(completed_at, '+00:00', ?)) AS activity_date,
        COUNT(*) AS activity_count
      FROM test_attempts
      WHERE user_id = ?
        AND completed_at IS NOT NULL
        AND DATE(CONVERT_TZ(completed_at, '+00:00', ?)) >= ?
      GROUP BY activity_date
      ORDER BY activity_date ASC`,
      [timezone, userId, timezone, startDateStr],
    );

    const contributions = rows.map((row) => ({
      date:
        row.activity_date instanceof Date
          ? row.activity_date.toISOString().split("T")[0]
          : String(row.activity_date),
      count: Number(row.activity_count),
    }));

    return successResponse(res, contributions);
  } catch (error) {
    next(error);
  }
}

/**
 * Get streak data — current streak, longest streak, and totals
 * GET /api/dashboard/streak?timezone=+07:00
 *
 * A streak is the number of consecutive days with at least one
 * completed test attempt. If today has no activity but yesterday
 * does, the streak is still counted from yesterday backwards.
 */
export async function getStreakData(req, res, next) {
  try {
    const userId = req.user.id;
    const timezone = req.query.timezone || "+00:00";

    // Get all unique active dates (sorted descending — newest first)
    const [rows] = await pool.execute(
      `SELECT 
        DATE(CONVERT_TZ(completed_at, '+00:00', ?)) AS activity_date,
        COUNT(*) AS activity_count
      FROM test_attempts
      WHERE user_id = ?
        AND completed_at IS NOT NULL
      GROUP BY activity_date
      ORDER BY activity_date DESC`,
      [timezone, userId],
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let totalActiveDays = rows.length;
    let totalActivities = rows.reduce(
      (sum, r) => sum + Number(r.activity_count),
      0,
    );

    if (rows.length > 0) {
      // Build a Set of active date strings for O(1) lookup
      const activeDates = new Set(
        rows.map((r) =>
          r.activity_date instanceof Date
            ? r.activity_date.toISOString().split("T")[0]
            : String(r.activity_date),
        ),
      );

      // Determine starting point: today or yesterday
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let checkDate;
      if (activeDates.has(todayStr)) {
        checkDate = new Date(today);
      } else if (activeDates.has(yesterdayStr)) {
        checkDate = new Date(yesterday);
      }

      // Calculate current streak
      if (checkDate) {
        while (true) {
          const dateStr = checkDate.toISOString().split("T")[0];
          if (activeDates.has(dateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Calculate longest streak by scanning all dates chronologically
      const sortedDates = [...activeDates].sort();
      let tempStreak = 1;
      longestStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffMs = curr.getTime() - prev.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }
    }

    return successResponse(res, {
      currentStreak,
      longestStreak,
      totalActiveDays,
      totalActivities,
    });
  } catch (error) {
    next(error);
  }
}
