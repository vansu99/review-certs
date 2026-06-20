-- Add topic column to questions table for weakness map grouping
ALTER TABLE questions ADD COLUMN topic VARCHAR(100) NULL DEFAULT NULL AFTER explanation;
