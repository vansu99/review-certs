-- ============================================================
-- Add Super Admin role to users table
-- ============================================================

-- Alter the role ENUM to include 'Super Admin'
ALTER TABLE users MODIFY COLUMN role ENUM('Super Admin', 'Admin', 'Manager', 'User') DEFAULT 'User';
