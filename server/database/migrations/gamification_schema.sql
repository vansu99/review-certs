-- Add gamification columns to users table
ALTER TABLE users 
ADD COLUMN xp INT DEFAULT 0,
ADD COLUMN level INT DEFAULT 1,
ADD COLUMN current_streak INT DEFAULT 0,
ADD COLUMN longest_streak INT DEFAULT 0,
ADD COLUMN last_activity_date DATE;

-- Create badges table
CREATE TABLE badges (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🏆',
  condition_type VARCHAR(50) NOT NULL,
  condition_value VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_badges table
CREATE TABLE user_badges (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  badge_id VARCHAR(36) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_badge (user_id, badge_id),
  INDEX idx_user_badges_user (user_id)
);

-- Seed initial badges
INSERT INTO badges (id, name, description, icon, condition_type, condition_value) VALUES 
('badge-night-owl', 'Cú đêm', 'Hoàn thành bài thi vào ban đêm (12h đêm - 4h sáng)', '🦉', 'time', '00:00-04:00'),
('badge-perfect-score', 'Bách phát bách trúng', 'Đạt điểm tuyệt đối (100%) trong một bài thi', '🎯', 'score', '100'),
('badge-streak-3', 'Chăm chỉ 3 ngày', 'Đạt chuỗi học tập liên tiếp 3 ngày', '🔥', 'streak', '3'),
('badge-streak-7', 'Cao thủ 7 ngày', 'Đạt chuỗi học tập liên tiếp 7 ngày', '⚡', 'streak', '7');
