-- Add soft delete support: deleted_at column
ALTER TABLE categories ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE tests ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE questions ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
