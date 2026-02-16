-- Add soft delete support for goals and users
ALTER TABLE goals ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
