# Requirements Document

## Introduction

Tính năng Analytics cung cấp cho người dùng cái nhìn sâu sắc về kết quả học tập của họ thông qua ba góc độ phân tích chính: biểu đồ điểm số theo thời gian (score trend), phân tích điểm yếu theo từng chủ đề/danh mục (category performance), và tỷ lệ đúng/sai theo loại câu hỏi (single vs. multiple choice). Tính năng này được xây dựng trên dữ liệu hiện có trong các bảng `test_attempts`, `test_attempt_answers`, `questions`, `tests`, và `categories` mà không cần thêm bảng mới.

## Glossary

- **Analytics_API**: Tập hợp các REST endpoint phía server cung cấp dữ liệu phân tích tổng hợp cho người dùng đã xác thực.
- **Analytics_Page**: Trang frontend tại route `/analytics` hiển thị toàn bộ các biểu đồ và bộ lọc phân tích.
- **Score_Trend**: Chuỗi điểm số của các lần làm bài theo thứ tự thời gian, dùng để vẽ biểu đồ đường.
- **Category_Performance**: Thống kê điểm trung bình, tỷ lệ pass, và số lần làm bài được nhóm theo từng danh mục (category).
- **Question_Type_Stats**: Thống kê số câu trả lời đúng và sai được phân tách theo loại câu hỏi: `single` (một đáp án) và `multiple` (nhiều đáp án).
- **Period**: Khoảng thời gian lọc dữ liệu cho Score Trend, nhận một trong bốn giá trị: `30d`, `90d`, `6m`, `1y`.
- **Attempt**: Một lần làm bài hoàn chỉnh được ghi nhận trong bảng `test_attempts` với `completed_at IS NOT NULL`.
- **Pass**: Một lần làm bài được coi là đạt khi `score >= passing_score` của bài kiểm tra tương ứng.
- **User**: Người dùng đã đăng nhập với role `User`, `Manager`, hoặc `Admin`.

---

## Requirements

### Requirement 1: Xem biểu đồ điểm số theo thời gian (Score Trend)

**User Story:** As a user, I want to view a chart of my test scores over time, so that I can track my learning progress and identify improvement trends.

#### Acceptance Criteria

1. WHEN a user navigates to the Analytics page, THE Analytics_Page SHALL display a score trend chart showing the user's completed test attempts ordered chronologically.
2. WHEN a user selects a time period filter (`30d`, `90d`, `6m`, or `1y`), THE Analytics_Page SHALL update the score trend chart to show only attempts completed within that period.
3. THE Analytics_API SHALL provide a `GET /api/analytics/score-trend` endpoint that accepts a `period` query parameter with allowed values `30d`, `90d`, `6m`, `1y` and defaults to `30d` when the parameter is absent.
4. WHEN the `GET /api/analytics/score-trend` endpoint is called, THE Analytics_API SHALL return an array of data points, each containing `attemptId`, `testTitle`, `score`, `passingScore`, and `completedAt`.
5. WHEN a user has no completed attempts within the selected period, THE Analytics_Page SHALL display an empty-state message instead of an empty chart.
6. IF the `period` query parameter contains an invalid value, THEN THE Analytics_API SHALL return a 400 error with a descriptive message.

---

### Requirement 2: Phân tích hiệu suất theo danh mục (Category Performance)

**User Story:** As a user, I want to see my performance broken down by category, so that I can identify which subject areas need more practice.

#### Acceptance Criteria

1. WHEN a user navigates to the Analytics page, THE Analytics_Page SHALL display a category performance chart showing average score, pass rate, and attempt count for each category the user has attempted.
2. THE Analytics_API SHALL provide a `GET /api/analytics/category-performance` endpoint that returns aggregated statistics per category.
3. WHEN the `GET /api/analytics/category-performance` endpoint is called, THE Analytics_API SHALL return an array of objects each containing `categoryId`, `categoryName`, `categoryIcon`, `averageScore`, `passRate`, and `attemptCount`.
4. WHEN a user has attempted tests in multiple categories, THE Analytics_API SHALL return one entry per category sorted by `attemptCount` descending.
5. WHEN a user has no completed attempts in any category, THE Analytics_Page SHALL display an empty-state message for the category performance section.

---

### Requirement 3: Thống kê tỷ lệ đúng/sai theo loại câu hỏi (Question Type Stats)

**User Story:** As a user, I want to see my correct/incorrect ratio broken down by question type (single vs. multiple choice), so that I can understand which question format I struggle with more.

#### Acceptance Criteria

1. WHEN a user navigates to the Analytics page, THE Analytics_Page SHALL display a chart showing correct and incorrect answer counts separated by question type (`single` and `multiple`).
2. THE Analytics_API SHALL provide a `GET /api/analytics/question-type-stats` endpoint that returns aggregated correct/incorrect counts per question type.
3. WHEN the `GET /api/analytics/question-type-stats` endpoint is called, THE Analytics_API SHALL return an array of objects each containing `questionType` (`single` or `multiple`), `correctCount`, `incorrectCount`, and `totalCount`.
4. WHEN a user has answered questions of only one type, THE Analytics_API SHALL return data for only that type.
5. WHEN a user has no answer history, THE Analytics_Page SHALL display an empty-state message for the question type stats section.

---

### Requirement 4: Bảo mật và phân quyền (Security & Authorization)

**User Story:** As a user, I want my analytics data to be private, so that other users cannot view my personal performance data.

#### Acceptance Criteria

1. WHEN an unauthenticated request is made to any `/api/analytics/*` endpoint, THE Analytics_API SHALL return a 401 Unauthorized response.
2. WHEN an authenticated user calls any `/api/analytics/*` endpoint, THE Analytics_API SHALL return only data belonging to that user, filtered by `user_id = req.user.id`.
3. THE Analytics_API SHALL apply the `authenticate` middleware to all analytics routes before processing any request.

---

### Requirement 5: Hiệu suất và trải nghiệm tải dữ liệu (Performance & Loading UX)

**User Story:** As a user, I want the analytics page to load smoothly with clear feedback, so that I am not confused while data is being fetched.

#### Acceptance Criteria

1. WHILE analytics data is being fetched, THE Analytics_Page SHALL display skeleton loading placeholders for each chart section.
2. IF an API request to any analytics endpoint fails, THEN THE Analytics_Page SHALL display an error message with an option to retry the request.
3. THE Analytics_Page SHALL use TanStack Query to cache analytics responses so that navigating away and back does not trigger redundant network requests within the same session.
4. WHEN a user changes the period filter on the score trend chart, THE Analytics_Page SHALL show a loading indicator while the new data is being fetched without unmounting the chart component.
