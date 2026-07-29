-- ============================================================
-- Authentication System Migration
-- Adds multi-method auth support with feature flags
-- ============================================================

-- Auth Configs: Feature flags for authentication methods
CREATE TABLE IF NOT EXISTS auth_configs (
  id VARCHAR(36) PRIMARY KEY,
  auth_method VARCHAR(30) NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT FALSE,
  config JSON DEFAULT NULL,
  priority INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Authentication Methods: Which methods a user has linked
CREATE TABLE IF NOT EXISTS authentication_methods (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  method_type VARCHAR(30) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  enabled BOOLEAN DEFAULT TRUE,
  metadata JSON DEFAULT NULL,
  last_used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_method (user_id, method_type),
  INDEX idx_auth_methods_user (user_id)
);

-- Social Accounts: OAuth provider links
CREATE TABLE IF NOT EXISTS social_accounts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  provider VARCHAR(30) NOT NULL,
  provider_uid VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  provider_name VARCHAR(255),
  provider_avatar VARCHAR(500),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP NULL DEFAULT NULL,
  raw_profile JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_provider_uid (provider, provider_uid),
  UNIQUE KEY unique_user_provider (user_id, provider),
  INDEX idx_social_provider_uid (provider, provider_uid)
);

-- OTP Tokens: Temporary one-time codes
CREATE TABLE IF NOT EXISTS otp_tokens (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code_hash VARCHAR(64) NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otp_email (email)
);

-- Refresh Tokens: Rotation-based token management
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  family_id VARCHAR(36) NOT NULL,
  parent_id VARCHAR(36) NULL DEFAULT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_family (family_id),
  INDEX idx_refresh_user (user_id)
);

-- Auth Logs: Audit trail for all auth events
CREATE TABLE IF NOT EXISTS auth_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL DEFAULT NULL,
  event_type VARCHAR(50) NOT NULL,
  method VARCHAR(30),
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_auth_logs_user (user_id, created_at),
  INDEX idx_auth_logs_event (event_type, created_at)
);

-- Seed default auth configs (all methods, password enabled by default)
INSERT IGNORE INTO auth_configs (id, auth_method, enabled, config, priority) VALUES
  (UUID(), 'password', TRUE, JSON_OBJECT('min_length', 8, 'require_uppercase', false, 'max_failed_attempts', 10, 'lockout_duration_min', 30), 1),
  (UUID(), 'otp', FALSE, JSON_OBJECT('code_length', 6, 'ttl_seconds', 300, 'max_attempts', 5, 'max_requests_per_window', 3, 'window_seconds', 900), 2),
  (UUID(), 'social_google', FALSE, JSON_OBJECT('client_id', '', 'client_secret', '', 'callback_url', '/api/auth/social/google/callback'), 3),
  (UUID(), 'social_facebook', FALSE, JSON_OBJECT('client_id', '', 'client_secret', '', 'callback_url', '/api/auth/social/facebook/callback'), 4),
  (UUID(), 'social_x', FALSE, JSON_OBJECT('client_id', '', 'client_secret', '', 'callback_url', '/api/auth/social/x/callback'), 5);

-- Add email_verified column to users if not exists
-- (Needed for social login account linking logic)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verified');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER email',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add failed_login_attempts column to users if not exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'failed_login_attempts');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0 AFTER avatar',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add locked_until column to users if not exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'locked_until');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE users ADD COLUMN locked_until TIMESTAMP NULL DEFAULT NULL AFTER failed_login_attempts',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
