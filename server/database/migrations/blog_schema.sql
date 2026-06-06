-- Migration for Blog Feature

-- Blogs table
CREATE TABLE IF NOT EXISTS `blogs` (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description LONGTEXT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  start_date DATE NULL,
  end_date DATE NULL,
  meta_title VARCHAR(300),
  meta_description TEXT,
  slug VARCHAR(350) UNIQUE,
  like_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_blogs_user (user_id),
  INDEX idx_blogs_status (status),
  INDEX idx_blogs_slug (slug)
);

-- Blog likes table (guest likes tracked by IP + fingerprint)
CREATE TABLE IF NOT EXISTS `blog_likes` (
  id VARCHAR(36) PRIMARY KEY,
  blog_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NULL,           -- NULL for guest
  guest_fingerprint VARCHAR(128) NULL, -- IP + user-agent hash for guests
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blog_id) REFERENCES `blogs`(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  -- Prevent duplicate likes: either by user or by guest fingerprint
  UNIQUE KEY unique_user_like (blog_id, user_id),
  INDEX idx_blog_likes_blog (blog_id),
  INDEX idx_blog_likes_fingerprint (blog_id, guest_fingerprint)
);
