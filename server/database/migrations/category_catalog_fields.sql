SET @db_name = DATABASE();

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE categories ADD COLUMN slug VARCHAR(120) NULL AFTER id',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'slug'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE categories ADD COLUMN provider VARCHAR(100) NULL AFTER icon',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'provider'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE categories ADD COLUMN certification_code VARCHAR(50) NULL AFTER provider',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'certification_code'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE categories ADD COLUMN level ENUM(''Foundation'', ''Associate'', ''Professional'', ''Specialty'') DEFAULT ''Foundation'' AFTER certification_code',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'level'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE categories ADD COLUMN version VARCHAR(50) NULL AFTER level',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'version'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE categories ADD COLUMN status ENUM(''draft'', ''published'', ''archived'') DEFAULT ''draft'' AFTER version',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE categories ADD COLUMN display_order INT DEFAULT 0 AFTER status',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'display_order'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE categories ADD COLUMN default_passing_score INT DEFAULT 70 AFTER display_order',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'default_passing_score'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE categories ADD COLUMN estimated_hours INT DEFAULT 0 AFTER default_passing_score',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'estimated_hours'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE categories
SET
  slug = LOWER(REPLACE(REPLACE(REPLACE(TRIM(name), ' & ', '-'), ' ', '-'), '.', '-')),
  provider = COALESCE(provider, 'Review Certs'),
  version = COALESCE(version, '2026'),
  status = COALESCE(status, 'published'),
  default_passing_score = COALESCE(default_passing_score, 70),
  estimated_hours = COALESCE(estimated_hours, 0)
WHERE deleted_at IS NULL;
