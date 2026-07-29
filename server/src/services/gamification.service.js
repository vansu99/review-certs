import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const gamificationService = {
  processTestCompletion: async (userId, score, totalQuestions) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Fetch user gamification stats
      const [users] = await connection.execute(
        'SELECT xp, level, current_streak, longest_streak, last_activity_date FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) throw new Error('User not found');
      
      let { xp, level, current_streak, longest_streak, last_activity_date } = users[0];
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let lastActivityDay = null;
      if (last_activity_date) {
        // Parse date properly to ignore timezone issues
        lastActivityDay = new Date(last_activity_date.getFullYear(), last_activity_date.getMonth(), last_activity_date.getDate());
      }
      
      // 2. Process Streak
      const diffTime = lastActivityDay ? Math.abs(today - lastActivityDay) : Infinity;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        current_streak += 1;
      } else if (diffDays > 1) {
        current_streak = 1;
      }
      
      if (current_streak > longest_streak) {
        longest_streak = current_streak;
      }
      
      // 3. Process XP and Level
      const gainedXp = totalQuestions * (score / 100) * 10; // e.g. 10 questions, 100% -> 100 XP
      const newXp = Math.floor(xp + gainedXp);
      
      // Simple formula: Level = floor(sqrt(xp / 100)) + 1
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
      const levelUp = newLevel > level;
      
      // Update User
      await connection.execute(
        `UPDATE users SET 
          xp = ?, level = ?, current_streak = ?, longest_streak = ?, last_activity_date = ?
         WHERE id = ?`,
        [newXp, newLevel, current_streak, longest_streak, today, userId]
      );
      
      // 4. Process Badges
      const unlockedBadges = [];
      const [userBadges] = await connection.execute('SELECT badge_id FROM user_badges WHERE user_id = ?', [userId]);
      const ownedBadgeIds = new Set(userBadges.map(b => b.badge_id));
      
      const [allBadges] = await connection.execute('SELECT * FROM badges');
      
      const currentHour = now.getHours();
      
      for (const badge of allBadges) {
        if (ownedBadgeIds.has(badge.id)) continue;
        
        let conditionMet = false;
        
        if (badge.condition_type === 'time' && badge.condition_value === '00:00-04:00') {
          if (currentHour >= 0 && currentHour < 4) conditionMet = true;
        } else if (badge.condition_type === 'score' && badge.condition_value === '100') {
          if (score === 100) conditionMet = true;
        } else if (badge.condition_type === 'streak') {
          const requiredStreak = parseInt(badge.condition_value, 10);
          if (current_streak >= requiredStreak) conditionMet = true;
        }
        
        if (conditionMet) {
          await connection.execute(
            'INSERT INTO user_badges (id, user_id, badge_id) VALUES (?, ?, ?)',
            [uuidv4(), userId, badge.id]
          );
          unlockedBadges.push(badge);
        }
      }
      
      await connection.commit();
      
      return {
        gainedXp,
        newXp,
        level: newLevel,
        levelUp,
        streak: current_streak,
        unlockedBadges
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};
