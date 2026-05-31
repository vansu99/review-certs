-- Migration for Group Learning Feature

-- Groups table
CREATE TABLE IF NOT EXISTS `groups` (
  id VARCHAR(36) PRIMARY KEY,
  owner_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  reset_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_groups_owner (owner_id)
);

-- Group members table
CREATE TABLE IF NOT EXISTS `group_members` (
  id VARCHAR(36) PRIMARY KEY,
  group_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  role ENUM('Admin', 'Member') DEFAULT 'Member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_group_user (group_id, user_id),
  INDEX idx_group_members_user (user_id)
);

-- Group mandatory exams
CREATE TABLE IF NOT EXISTS `group_exams` (
  id VARCHAR(36) PRIMARY KEY,
  group_id VARCHAR(36) NOT NULL,
  test_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  UNIQUE KEY unique_group_test (group_id, test_id)
);

-- Group goals (Shared target)
CREATE TABLE IF NOT EXISTS `group_goals` (
  id VARCHAR(36) PRIMARY KEY,
  group_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  target_percentage INT DEFAULT 100, -- Target completion % for each member
  start_date DATE,
  end_date DATE,
  status ENUM('active', 'completed', 'overdue') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE
);

-- Group discussions (Comment threads)
CREATE TABLE IF NOT EXISTS `group_discussions` (
  id VARCHAR(36) PRIMARY KEY,
  group_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  parent_id VARCHAR(36) NULL, -- For replies
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES `group_discussions`(id) ON DELETE CASCADE,
  INDEX idx_discussions_group (group_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'group_invite', 'new_exam', 'new_comment', etc.
  message TEXT NOT NULL,
  data JSON NULL, -- Extra info like group_id
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id)
);
