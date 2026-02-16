-- Review Certs Database Schema
-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS goal_exam_scores;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS test_attempt_answers;
DROP TABLE IF EXISTS test_attempts;
DROP TABLE IF EXISTS answer_options;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('Admin', 'Manager', 'User') DEFAULT 'User',
  avatar VARCHAR(500),
  phone VARCHAR(20),
  gender ENUM('male', 'female'),
  date_of_birth DATE,
  country VARCHAR(50),
  facebook VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_users_email (email)
);

-- Categories table
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '📚',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL
);

-- Tests table
CREATE TABLE tests (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration INT DEFAULT 30,
  difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
  passing_score INT DEFAULT 70,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_tests_category (category_id)
);

-- Questions table
CREATE TABLE questions (
  id VARCHAR(36) PRIMARY KEY,
  test_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('single', 'multiple') DEFAULT 'single',
  explanation TEXT,
  order_index INT DEFAULT 0,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  INDEX idx_questions_test (test_id)
);

-- Answer options table
CREATE TABLE answer_options (
  id VARCHAR(36) PRIMARY KEY,
  question_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_options_question (question_id)
);

-- Test attempts table
CREATE TABLE test_attempts (
  id VARCHAR(36) PRIMARY KEY,
  test_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  score INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_attempts_user (user_id),
  INDEX idx_attempts_test (test_id)
);

-- Test attempt answers table
CREATE TABLE test_attempt_answers (
  id VARCHAR(36) PRIMARY KEY,
  attempt_id VARCHAR(36) NOT NULL,
  question_id VARCHAR(36) NOT NULL,
  selected_option_ids JSON,
  is_correct BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_attempt_answers_attempt (attempt_id)
);

-- Goals table
CREATE TABLE goals (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  target_type ENUM('category', 'exams') DEFAULT 'exams',
  category_id VARCHAR(36),
  exam_ids JSON,
  passing_score INT DEFAULT 70,
  start_date DATE,
  end_date DATE,
  status ENUM('draft', 'active', 'completed', 'overdue', 'cancelled') DEFAULT 'draft',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_goals_user (user_id)
);

-- Goal exam scores table
CREATE TABLE goal_exam_scores (
  id VARCHAR(36) PRIMARY KEY,
  goal_id VARCHAR(36) NOT NULL,
  exam_id VARCHAR(36) NOT NULL,
  exam_title VARCHAR(200),
  score INT DEFAULT 0,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  INDEX idx_goal_scores_goal (goal_id)
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  test_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_test_bookmark (user_id, test_id),
  INDEX idx_bookmarks_user (user_id)
);
