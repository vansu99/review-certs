-- Add topic column to questions table for weakness map grouping
-- Idempotent: skip if column already exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'questions' AND COLUMN_NAME = 'topic');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE questions ADD COLUMN topic VARCHAR(100) NULL DEFAULT NULL AFTER explanation',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
