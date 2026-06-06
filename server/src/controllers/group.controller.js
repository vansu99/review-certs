import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get user's groups
 */
export async function getGroups(req, res, next) {
  try {
    const userId = req.user.id;

    // Get groups where user is owner or member
    const [rows] = await pool.execute(
      `
      SELECT g.*, gm.role, 
             (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as memberCount
      FROM \`groups\` g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ? AND g.deleted_at IS NULL
      ORDER BY g.created_at DESC
    `,
      [userId],
    );

    return successResponse(res, rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new group
 */
export async function createGroup(req, res, next) {
  try {
    const ownerId = req.user.id;
    const { name, description } = req.body;

    if (!name) {
      return errorResponse(res, "Group name is required", 400);
    }

    const groupId = uuidv4();
    const memberId = uuidv4();

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create group
      await connection.execute(
        "INSERT INTO `groups` (id, owner_id, name, description) VALUES (?, ?, ?, ?)",
        [groupId, ownerId, name, description || ""],
      );

      // Add owner as Admin member
      await connection.execute(
        "INSERT INTO group_members (id, group_id, user_id, role) VALUES (?, ?, ?, 'Admin')",
        [memberId, groupId, ownerId],
      );

      await connection.commit();
      return successResponse(res, { id: groupId, name }, "Group created successfully", 201);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Get group details including goal progress
 */
export async function getGroupById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is member
    const [membership] = await pool.execute(
      "SELECT role FROM group_members WHERE group_id = ? AND user_id = ?",
      [id, userId],
    );

    if (membership.length === 0) {
      return errorResponse(res, "Access denied. You are not a member of this group.", 403);
    }

    // Get group info
    const [groupRows] = await pool.execute(
      "SELECT * FROM `groups` WHERE id = ? AND deleted_at IS NULL",
      [id],
    );

    if (groupRows.length === 0) {
      return errorResponse(res, "Group not found", 404);
    }

    const group = groupRows[0];

    // Get members
    const [members] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.avatar, gm.role, gm.joined_at 
       FROM group_members gm 
       JOIN users u ON gm.user_id = u.id 
       WHERE gm.group_id = ?`,
      [id],
    );

    // Get mandatory exams
    const [exams] = await pool.execute(
      `SELECT t.id, t.title, t.difficulty, t.category_id, c.name as categoryName
       FROM group_exams ge
       JOIN tests t ON ge.test_id = t.id
       JOIN categories c ON t.category_id = c.id
       WHERE ge.group_id = ? AND t.deleted_at IS NULL`,
      [id],
    );

    // Get group goals
    const [goals] = await pool.execute(
      "SELECT * FROM group_goals WHERE group_id = ? AND status = 'active'",
      [id],
    );

    // Calculate progress (Average of each member's progress on mandatory exams)
    let groupProgress = 0;
    if (members.length > 0 && exams.length > 0) {
      let totalMemberProgress = 0;

      for (const member of members) {
        // Count how many mandatory exams this member has passed
        const [passes] = await pool.execute(
          `SELECT COUNT(DISTINCT test_id) as passedCount
           FROM test_attempts
           WHERE user_id = ? 
           AND test_id IN (${exams.map(() => "?").join(",")}) 
           AND score >= (SELECT passing_score FROM tests WHERE id = test_attempts.test_id)
           AND (
             (SELECT reset_at FROM \`groups\` WHERE id = ?) IS NULL 
             OR started_at > (SELECT reset_at FROM \`groups\` WHERE id = ?)
           )`,
          [member.id, ...exams.map((e) => e.id), id, id],
        );
        
        const passedCount = passes[0].passedCount;
        totalMemberProgress += (passedCount / exams.length) * 100;
      }

      groupProgress = Math.round(totalMemberProgress / members.length);
    }

    return successResponse(res, {
      ...group,
      members,
      exams,
      goals,
      progress: groupProgress,
      userRole: membership[0].role,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add member to group
 */
export async function addMember(req, res, next) {
  try {
    const { id } = req.params; // groupId
    const { identifier } = req.body; // email or username (which is email in this system)
    const ownerId = req.user.id;

    // Check if requester is Admin
    const [adminCheck] = await pool.execute(
      "SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'Admin'",
      [id, ownerId],
    );

    if (adminCheck.length === 0) {
      return errorResponse(res, "Only admins can add members", 403);
    }

    // Find user by email (using name as fallback for username)
    const [userRows] = await pool.execute(
      "SELECT id, name FROM users WHERE email = ? OR name = ? AND deleted_at IS NULL",
      [identifier, identifier],
    );

    if (userRows.length === 0) {
      return errorResponse(res, "User not found", 404);
    }

    const targetUser = userRows[0];

    // Check if already member
    const [exists] = await pool.execute(
      "SELECT id FROM group_members WHERE group_id = ? AND user_id = ?",
      [id, targetUser.id],
    );

    if (exists.length > 0) {
      return errorResponse(res, "User is already a member of this group", 400);
    }

    const memberId = uuidv4();
    await pool.execute(
      "INSERT INTO group_members (id, group_id, user_id, role) VALUES (?, ?, ?, 'Member')",
      [memberId, id, targetUser.id],
    );

    // Create notification
    const [groupInfo] = await pool.execute("SELECT name FROM `groups` WHERE id = ?", [id]);
    const notificationId = uuidv4();
    await pool.execute(
      "INSERT INTO notifications (id, user_id, type, message, data) VALUES (?, ?, 'group_invite', ?, ?)",
      [notificationId, targetUser.id, `You have been added to group: ${groupInfo[0].name}`, JSON.stringify({ groupId: id })],
    );

    return successResponse(res, targetUser, "Member added successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Add mandatory exams to group
 */
export async function addExams(req, res, next) {
  try {
    const { id } = req.params;
    const { testIds } = req.body;
    const ownerId = req.user.id;

    // Check if Admin
    const [adminCheck] = await pool.execute(
      "SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'Admin'",
      [id, ownerId],
    );

    if (adminCheck.length === 0) {
      return errorResponse(res, "Only admins can manage exams", 403);
    }

    if (!Array.isArray(testIds) || testIds.length === 0) {
      return errorResponse(res, "Invalid test IDs", 400);
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const addedCount = 0;
      const skippedCount = 0;
      
      for (const testId of testIds) {
        // Check if already added
        const [exists] = await connection.execute(
          "SELECT id FROM group_exams WHERE group_id = ? AND test_id = ?",
          [id, testId],
        );

        if (exists.length === 0) {
          await connection.execute(
            "INSERT INTO group_exams (id, group_id, test_id) VALUES (?, ?, ?)",
            [uuidv4(), id, testId],
          );
          addedCount++;
        } else {
          skippedCount++;
        }
      }

      await connection.commit();

      if (addedCount === 0 && skippedCount > 0) {
        return errorResponse(res, "All selected exams are already in the group", 400);
      }

      // Create notifications for all members about new exams
      const [groupInfo] = await pool.execute("SELECT name FROM `groups` WHERE id = ?", [id]);
      const [members] = await pool.execute("SELECT user_id FROM group_members WHERE group_id = ?", [id]);
      
      for (const member of members) {
        if (member.user_id !== ownerId) {
          const notificationId = uuidv4();
          await pool.execute(
            "INSERT INTO notifications (id, user_id, type, message, data) VALUES (?, ?, 'new_exam', ?, ?)",
            [notificationId, member.user_id, `New mandatory exams added to group: ${groupInfo[0].name}`, JSON.stringify({ groupId: id })],
          );
        }
      }

      return successResponse(res, null, "Exams added to group successfully");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Get Group Discussions
 */
export async function getDiscussions(req, res, next) {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT d.*, u.name as userName, u.avatar as userAvatar
       FROM group_discussions d
       JOIN users u ON d.user_id = u.id
       WHERE d.group_id = ?
       ORDER BY d.created_at DESC`,
      [id],
    );

    return successResponse(res, rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Post Comment to Group
 */
export async function postComment(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content, parentId } = req.body;

    if (!content) {
      return errorResponse(res, "Content is required", 400);
    }

    const commentId = uuidv4();
    await pool.execute(
      "INSERT INTO group_discussions (id, group_id, user_id, content, parent_id) VALUES (?, ?, ?, ?, ?)",
      [commentId, id, userId, content, parentId || null],
    );

    // Create notifications for other members about the new comment
    const [groupInfo] = await pool.execute("SELECT name FROM `groups` WHERE id = ?", [id]);
    const [members] = await pool.execute("SELECT user_id FROM group_members WHERE group_id = ?", [id]);
    const [author] = await pool.execute("SELECT name FROM users WHERE id = ?", [userId]);

    for (const member of members) {
      if (member.user_id !== userId) {
        const notificationId = uuidv4();
        await pool.execute(
          "INSERT INTO notifications (id, user_id, type, message, data) VALUES (?, ?, 'new_comment', ?, ?)",
          [notificationId, member.user_id, `${author[0].name} posted a comment in ${groupInfo[0].name}`, JSON.stringify({ groupId: id, commentId })],
        );
      }
    }

    return successResponse(res, { id: commentId }, "Comment posted successfully", 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Leaderboard
 */
export async function getLeaderboard(req, res, next) {
  try {
    const { id } = req.params;

    // Get members and their total score from test_attempts on mandatory exams
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.avatar,
              IFNULL(SUM(max_scores.best_score), 0) as totalScore,
              COUNT(DISTINCT max_scores.test_id) as examsCompleted
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       LEFT JOIN (
         SELECT user_id, test_id, MAX(score) as best_score
         FROM test_attempts
         WHERE test_id IN (SELECT test_id FROM group_exams WHERE group_id = ?)
         AND (
           (SELECT reset_at FROM \`groups\` WHERE id = ?) IS NULL 
           OR started_at > (SELECT reset_at FROM \`groups\` WHERE id = ?)
         )
         GROUP BY user_id, test_id
       ) max_scores ON u.id = max_scores.user_id
       WHERE gm.group_id = ?
       GROUP BY u.id
       ORDER BY totalScore DESC`,
      [id, id, id, id],
    );

    return successResponse(res, rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Remove mandatory exam from group
 */
export async function removeExam(req, res, next) {
  try {
    const { id, testId } = req.params;
    const userId = req.user.id;

    // Check if requester is Owner (Admin of group)
    const [adminCheck] = await pool.execute(
      "SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'Admin'",
      [id, userId],
    );

    if (adminCheck.length === 0) {
      return errorResponse(res, "Only group owners can remove exams", 403);
    }

    // Get current group progress
    const [members] = await pool.execute("SELECT user_id FROM group_members WHERE group_id = ?", [id]);
    const [exams] = await pool.execute("SELECT test_id FROM group_exams WHERE group_id = ?", [id]);

    if (members.length > 0 && exams.length > 0) {
      let totalMemberProgress = 0;
      for (const member of members) {
        const [passes] = await pool.execute(
          `SELECT COUNT(DISTINCT test_id) as passedCount
           FROM test_attempts
           WHERE user_id = ? 
           AND test_id IN (${exams.map(() => "?").join(",")}) 
           AND score >= (SELECT passing_score FROM tests WHERE id = test_attempts.test_id)
           AND (
             (SELECT reset_at FROM \`groups\` WHERE id = ?) IS NULL 
             OR started_at > (SELECT reset_at FROM \`groups\` WHERE id = ?)
           )`,
          [member.user_id, ...exams.map((e) => e.test_id), id, id],
        );
        totalMemberProgress += (passes[0].passedCount / exams.length) * 100;
      }
      const groupProgress = Math.round(totalMemberProgress / members.length);

      if (groupProgress >= 30) {
        return errorResponse(res, "Cannot remove exams when group progress is 30% or higher", 400);
      }
    }

    await pool.execute(
      "DELETE FROM group_exams WHERE group_id = ? AND test_id = ?",
      [id, testId],
    );

    return successResponse(res, null, "Exam removed from group successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Reset group progress
 */
export async function resetProgress(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if requester is Owner
    const [adminCheck] = await pool.execute(
      "SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'Admin'",
      [id, userId],
    );

    if (adminCheck.length === 0) {
      return errorResponse(res, "Only group owners can reset progress", 403);
    }

    await pool.execute(
      "UPDATE `groups` SET reset_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id],
    );

    return successResponse(res, null, "Group progress reset successfully");
  } catch (error) {
    next(error);
  }
}

