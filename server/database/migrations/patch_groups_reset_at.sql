-- Add reset_at column to groups table if it doesn't already exist
SET @dbname = DATABASE();
SET @tablename = 'groups';
SET @columnname = 'reset_at';
SET @preparedStatement = (
  SELECT IF(
    (
      SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND COLUMN_NAME = @columnname
    ) > 0,
    'SELECT 1',
    'ALTER TABLE `groups` ADD COLUMN reset_at TIMESTAMP NULL DEFAULT NULL'
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
