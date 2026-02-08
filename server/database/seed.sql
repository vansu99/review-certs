-- Review Certs Seed Data
-- Password: 'password' hashed with bcrypt (10 rounds)
-- Hash: $2a$10$8KzQ1H.PFCgBDe7VzWD5VelPYFNfkN5gzS5cCFqe.lN8u3kC3ZG3C

-- Insert demo users
INSERT INTO users (id, email, password_hash, name, role) VALUES
('user-admin-001', 'admin@example.com', '$2a$10$8KzQ1H.PFCgBDe7VzWD5VelPYFNfkN5gzS5cCFqe.lN8u3kC3ZG3C', 'Admin User', 'Admin'),
('user-manager-001', 'manager@example.com', '$2a$10$8KzQ1H.PFCgBDe7VzWD5VelPYFNfkN5gzS5cCFqe.lN8u3kC3ZG3C', 'Manager User', 'Manager'),
('user-regular-001', 'user@example.com', '$2a$10$8KzQ1H.PFCgBDe7VzWD5VelPYFNfkN5gzS5cCFqe.lN8u3kC3ZG3C', 'Regular User', 'User');

-- Insert categories
INSERT INTO categories (id, name, description, icon) VALUES
('cat-js-001', 'JavaScript Fundamentals', 'Core JavaScript concepts including variables, functions, and async programming', '📜'),
('cat-react-001', 'React Essentials', 'React hooks, components, state management, and best practices', '⚛️'),
('cat-ts-001', 'TypeScript Mastery', 'Type system, generics, utility types, and advanced patterns', '🔷'),
('cat-css-001', 'CSS & Styling', 'Modern CSS, Flexbox, Grid, animations, and responsive design', '🎨'),
('cat-node-001', 'Node.js Backend', 'Server-side JavaScript, Express, APIs, and database integration', '🟢');

-- Insert tests
INSERT INTO tests (id, category_id, title, description, duration, difficulty, passing_score) VALUES
('test-js-001', 'cat-js-001', 'JavaScript Basics Quiz', 'Test your knowledge of JavaScript fundamentals', 30, 'Beginner', 70),
('test-js-002', 'cat-js-001', 'JavaScript Advanced Concepts', 'Deep dive into closures, prototypes, and async patterns', 45, 'Advanced', 75),
('test-react-001', 'cat-react-001', 'React Hooks Assessment', 'Test your understanding of React hooks and state management', 30, 'Intermediate', 70),
('test-react-002', 'cat-react-001', 'React Component Patterns', 'Component composition, HOCs, and render props', 40, 'Advanced', 75),
('test-ts-001', 'cat-ts-001', 'TypeScript Generics', 'Generic types, constraints, and utility patterns', 35, 'Intermediate', 70);

-- Insert questions for JavaScript Basics Quiz
INSERT INTO questions (id, test_id, content, type, explanation, order_index) VALUES
('q-js001-1', 'test-js-001', 'What is the correct way to declare a variable in JavaScript?', 'single', 'In JavaScript, you can declare variables using let, const, or var.', 0),
('q-js001-2', 'test-js-001', 'Which of the following is NOT a primitive type in JavaScript?', 'single', 'Object is a reference type, not a primitive type.', 1),
('q-js001-3', 'test-js-001', 'What does === operator do in JavaScript?', 'single', '=== compares both value and type without type coercion.', 2),
('q-js001-4', 'test-js-001', 'Which method adds an element to the end of an array?', 'single', 'push() adds elements to the end, unshift() adds to the beginning.', 3),
('q-js001-5', 'test-js-001', 'What is the output of typeof null?', 'single', 'This is a known JavaScript quirk - typeof null returns "object".', 4);

-- Insert answer options for JavaScript Basics Quiz
INSERT INTO answer_options (id, question_id, content, is_correct, order_index) VALUES
-- Question 1
('opt-js001-1a', 'q-js001-1', 'variable x = 5', FALSE, 0),
('opt-js001-1b', 'q-js001-1', 'let x = 5', TRUE, 1),
('opt-js001-1c', 'q-js001-1', 'v x = 5', FALSE, 2),
('opt-js001-1d', 'q-js001-1', 'int x = 5', FALSE, 3),
-- Question 2
('opt-js001-2a', 'q-js001-2', 'string', FALSE, 0),
('opt-js001-2b', 'q-js001-2', 'number', FALSE, 1),
('opt-js001-2c', 'q-js001-2', 'object', TRUE, 2),
('opt-js001-2d', 'q-js001-2', 'boolean', FALSE, 3),
-- Question 3
('opt-js001-3a', 'q-js001-3', 'Assignment', FALSE, 0),
('opt-js001-3b', 'q-js001-3', 'Loose equality comparison', FALSE, 1),
('opt-js001-3c', 'q-js001-3', 'Strict equality comparison', TRUE, 2),
('opt-js001-3d', 'q-js001-3', 'Type conversion', FALSE, 3),
-- Question 4
('opt-js001-4a', 'q-js001-4', 'push()', TRUE, 0),
('opt-js001-4b', 'q-js001-4', 'pop()', FALSE, 1),
('opt-js001-4c', 'q-js001-4', 'shift()', FALSE, 2),
('opt-js001-4d', 'q-js001-4', 'unshift()', FALSE, 3),
-- Question 5
('opt-js001-5a', 'q-js001-5', '"null"', FALSE, 0),
('opt-js001-5b', 'q-js001-5', '"undefined"', FALSE, 1),
('opt-js001-5c', 'q-js001-5', '"object"', TRUE, 2),
('opt-js001-5d', 'q-js001-5', '"number"', FALSE, 3);

-- Insert questions for React Hooks Assessment
INSERT INTO questions (id, test_id, content, type, explanation, order_index) VALUES
('q-react001-1', 'test-react-001', 'Which hook is used for side effects in React?', 'single', 'useEffect is specifically designed for handling side effects like data fetching, subscriptions, or DOM manipulation.', 0),
('q-react001-2', 'test-react-001', 'What hook should you use to create local state in a functional component?', 'single', 'useState is the primary hook for managing local component state.', 1),
('q-react001-3', 'test-react-001', 'Which of these are valid React hooks? (Select multiple)', 'multiple', 'useState, useEffect, and useContext are all built-in React hooks.', 2),
('q-react001-4', 'test-react-001', 'What is the purpose of useMemo?', 'single', 'useMemo memoizes expensive calculations to avoid recomputation on every render.', 3),
('q-react001-5', 'test-react-001', 'When does useEffect run by default?', 'single', 'By default, useEffect runs after every render unless a dependency array is provided.', 4);

-- Insert answer options for React Hooks Assessment
INSERT INTO answer_options (id, question_id, content, is_correct, order_index) VALUES
-- Question 1
('opt-react001-1a', 'q-react001-1', 'useState', FALSE, 0),
('opt-react001-1b', 'q-react001-1', 'useEffect', TRUE, 1),
('opt-react001-1c', 'q-react001-1', 'useContext', FALSE, 2),
('opt-react001-1d', 'q-react001-1', 'useRef', FALSE, 3),
-- Question 2
('opt-react001-2a', 'q-react001-2', 'useReducer', FALSE, 0),
('opt-react001-2b', 'q-react001-2', 'useState', TRUE, 1),
('opt-react001-2c', 'q-react001-2', 'useEffect', FALSE, 2),
('opt-react001-2d', 'q-react001-2', 'useMemo', FALSE, 3),
-- Question 3 (multiple choice)
('opt-react001-3a', 'q-react001-3', 'useState', TRUE, 0),
('opt-react001-3b', 'q-react001-3', 'useEffect', TRUE, 1),
('opt-react001-3c', 'q-react001-3', 'useContext', TRUE, 2),
('opt-react001-3d', 'q-react001-3', 'useClass', FALSE, 3),
-- Question 4
('opt-react001-4a', 'q-react001-4', 'Manage form state', FALSE, 0),
('opt-react001-4b', 'q-react001-4', 'Memoize expensive calculations', TRUE, 1),
('opt-react001-4c', 'q-react001-4', 'Handle side effects', FALSE, 2),
('opt-react001-4d', 'q-react001-4', 'Create refs', FALSE, 3),
-- Question 5
('opt-react001-5a', 'q-react001-5', 'Only on mount', FALSE, 0),
('opt-react001-5b', 'q-react001-5', 'Only on unmount', FALSE, 1),
('opt-react001-5c', 'q-react001-5', 'After every render', TRUE, 2),
('opt-react001-5d', 'q-react001-5', 'Before every render', FALSE, 3);

-- Insert some test history for demo user
INSERT INTO test_attempts (id, test_id, user_id, score, total_questions, correct_answers, started_at, completed_at) VALUES
('attempt-001', 'test-js-001', 'user-regular-001', 80, 5, 4, '2026-01-20 10:00:00', '2026-01-20 10:25:00'),
('attempt-002', 'test-react-001', 'user-regular-001', 60, 5, 3, '2026-01-21 14:00:00', '2026-01-21 14:30:00'),
('attempt-003', 'test-js-001', 'user-regular-001', 100, 5, 5, '2026-01-25 09:00:00', '2026-01-25 09:20:00');

-- Insert test attempt answers for attempt-001
INSERT INTO test_attempt_answers (id, attempt_id, question_id, selected_option_ids, is_correct) VALUES
('answer-001-1', 'attempt-001', 'q-js001-1', '["opt-js001-1b"]', TRUE),
('answer-001-2', 'attempt-001', 'q-js001-2', '["opt-js001-2c"]', TRUE),
('answer-001-3', 'attempt-001', 'q-js001-3', '["opt-js001-3c"]', TRUE),
('answer-001-4', 'attempt-001', 'q-js001-4', '["opt-js001-4a"]', TRUE),
('answer-001-5', 'attempt-001', 'q-js001-5', '["opt-js001-5a"]', FALSE);

-- Insert a sample goal for demo user
INSERT INTO goals (id, user_id, name, description, target_type, category_id, exam_ids, passing_score, start_date, end_date, status, priority) VALUES
('goal-001', 'user-regular-001', 'Master JavaScript', 'Complete all JavaScript quizzes with 80%+ score', 'category', 'cat-js-001', '["test-js-001", "test-js-002"]', 80, '2026-01-01', '2026-03-31', 'active', 'high');

-- Insert goal exam scores
INSERT INTO goal_exam_scores (id, goal_id, exam_id, exam_title, score, completed_at) VALUES
('gscore-001', 'goal-001', 'test-js-001', 'JavaScript Basics Quiz', 80, '2026-01-20 10:25:00');
