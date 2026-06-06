# Requirements Document

## Introduction

Tính năng **Phân tích kết quả chi tiết (Detailed Analytics)** cung cấp cho người dùng hệ thống Review Certs khả năng theo dõi tiến độ học tập theo thời gian, xác định điểm yếu theo từng chủ đề/category, và phân tích tỷ lệ đúng/sai theo loại câu hỏi. Tính năng này giúp người dùng hiểu rõ hơn về năng lực của mình và tập trung ôn luyện hiệu quả hơn. Manager và Admin có thêm khả năng xem analytics của tất cả người dùng để theo dõi tiến độ học tập toàn hệ thống.

Dữ liệu analytics được tổng hợp từ các bảng `test_attempts`, `test_attempt_answers`, `questions`, `tests`, và `categories` đã có sẵn trong hệ thống.

## Glossary

- **Analytics_Service**: Thành phần backend xử lý tính toán và tổng hợp dữ liệu analytics.
- **Analytics_Dashboard**: Trang giao diện frontend hiển thị các biểu đồ và số liệu phân tích.
- **Score_Trend**: Chuỗi điểm số của người dùng qua các lần thi, được sắp xếp theo thứ tự thời gian tăng dần.
- **Category_Weakness**: Chỉ số phản ánh tỷ lệ trả lời đúng của người dùng trong một category cụ thể, tính theo phần trăm.
- **Question_Type_Stats**: Thống kê tỷ lệ đúng/sai phân tách theo loại câu hỏi `single` (một đáp án) và `multiple` (nhiều đáp án).
- **Summary_Stats**: Tập hợp các chỉ số tổng quan bao gồm tổng số lần thi, điểm trung bình, tỷ lệ pass, và tổng số câu hỏi đã làm.
- **Date_Range**: Khoảng thời gian lọc dữ liệu, xác định bởi `startDate` và `endDate` theo định dạng ISO 8601.
- **Attempt**: Một lần thi hoàn chỉnh được lưu trong bảng `test_attempts` với `completed_at` không null.
- **User**: Người dùng có role `User` trong hệ thống.
- **Manager**: Người dùng có role `Manager` trong hệ thống.
- **Admin**: Người dùng có role `Admin` trong hệ thống.
- **Target_User**: Người dùng mà dữ liệu analytics đang được truy vấn. Với User, Target_User luôn là chính họ. Với Manager và Admin, Target_User có thể là bất kỳ người dùng nào.

---

## Requirements

### Requirement 1: Xem tổng quan thống kê analytics

**User Story:** As a User, I want to see a summary of my overall performance statistics, so that I can quickly assess my learning progress at a glance.

#### Acceptance Criteria

1. WHEN a User requests their analytics summary, THE Analytics_Service SHALL return Summary_Stats including: total number of Attempts, average score across all Attempts, pass rate as a percentage, and total number of questions answered.
2. WHEN a User has zero completed Attempts, THE Analytics_Service SHALL return Summary_Stats with all numeric fields set to zero.
3. WHEN a Date_Range filter is applied, THE Analytics_Service SHALL calculate Summary_Stats using only Attempts whose `completed_at` falls within the specified Date_Range.
4. IF the `startDate` in a Date_Range is after the `endDate`, THEN THE Analytics_Service SHALL return an error response with HTTP status 400 and a descriptive error message.
5. THE Analytics_Dashboard SHALL display Summary_Stats in a dedicated summary card section at the top of the analytics page.

---

### Requirement 2: Biểu đồ tiến độ điểm số theo thời gian

**User Story:** As a User, I want to view a chart of my scores over time, so that I can track whether my performance is improving across multiple test attempts.

#### Acceptance Criteria

1. WHEN a User requests their Score_Trend data, THE Analytics_Service SHALL return a list of data points, each containing `attemptId`, `testTitle`, `score`, `passingScore`, and `completedAt`, sorted by `completedAt` in ascending order.
2. THE Analytics_Service SHALL return Score_Trend data where every `score` value is an integer in the range [0, 100].
3. WHEN a `testId` filter is provided, THE Analytics_Service SHALL return only Score_Trend data points belonging to the specified test.
4. WHEN a Date_Range filter is applied, THE Analytics_Service SHALL return only Score_Trend data points whose `completedAt` falls within the specified Date_Range.
5. THE Analytics_Dashboard SHALL render Score_Trend data as a line chart with time on the x-axis and score on the y-axis, including a visual indicator for the passing score threshold.
6. WHEN a User has fewer than two completed Attempts, THE Analytics_Dashboard SHALL display a message indicating insufficient data for trend analysis instead of an empty chart.

---

### Requirement 3: Phân tích điểm yếu theo category

**User Story:** As a User, I want to see my correct answer rate broken down by category, so that I can identify which subject areas need more practice.

#### Acceptance Criteria

1. WHEN a User requests Category_Weakness analysis, THE Analytics_Service SHALL return a list of category statistics, each containing `categoryId`, `categoryName`, `categoryIcon`, `totalQuestions`, `correctAnswers`, and `correctRate` (as a percentage rounded to one decimal place).
2. THE Analytics_Service SHALL return Category_Weakness data where every `correctRate` value is a number in the range [0.0, 100.0].
3. THE Analytics_Service SHALL return Category_Weakness data where the sum of `totalQuestions` across all categories equals the total number of questions answered by the User across all Attempts included in the query.
4. WHEN a Date_Range filter is applied, THE Analytics_Service SHALL calculate Category_Weakness using only Attempts whose `completed_at` falls within the specified Date_Range.
5. THE Analytics_Dashboard SHALL render Category_Weakness data as a horizontal bar chart sorted by `correctRate` in ascending order, so that the weakest categories appear at the top.
6. WHEN a category has zero questions answered, THE Analytics_Service SHALL exclude that category from the Category_Weakness response.

---

### Requirement 4: Phân tích tỷ lệ đúng/sai theo loại câu hỏi

**User Story:** As a User, I want to see my performance broken down by question type (single-answer vs. multiple-answer), so that I can understand which question format I struggle with more.

#### Acceptance Criteria

1. WHEN a User requests Question_Type_Stats, THE Analytics_Service SHALL return statistics for each question type (`single` and `multiple`) that the User has answered, each containing `type`, `totalQuestions`, `correctAnswers`, `incorrectAnswers`, and `correctRate` (as a percentage rounded to one decimal place).
2. THE Analytics_Service SHALL return Question_Type_Stats where for each type entry: `correctAnswers` + `incorrectAnswers` = `totalQuestions`.
3. THE Analytics_Service SHALL return Question_Type_Stats where every `correctRate` value is a number in the range [0.0, 100.0].
4. WHEN a Date_Range filter is applied, THE Analytics_Service SHALL calculate Question_Type_Stats using only Attempts whose `completed_at` falls within the specified Date_Range.
5. THE Analytics_Dashboard SHALL render Question_Type_Stats as a grouped bar chart or donut chart comparing performance between question types.
6. WHEN a question type has zero questions answered, THE Analytics_Service SHALL exclude that type from the Question_Type_Stats response.

---

### Requirement 5: Lọc analytics theo khoảng thời gian

**User Story:** As a User, I want to filter all analytics data by a specific time period, so that I can focus on my recent performance or compare different study periods.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL provide a date range picker allowing Users to select a `startDate` and `endDate` to filter all analytics data simultaneously.
2. THE Analytics_Dashboard SHALL provide preset filter options including: "7 ngày qua", "30 ngày qua", "3 tháng qua", "6 tháng qua", and "Tất cả thời gian".
3. WHEN a Date_Range filter is applied, THE Analytics_Service SHALL apply the same filter consistently across Score_Trend, Category_Weakness, Question_Type_Stats, and Summary_Stats in a single request.
4. WHEN no Date_Range filter is provided, THE Analytics_Service SHALL return data for all time.
5. IF a `startDate` or `endDate` value is not a valid ISO 8601 date string, THEN THE Analytics_Service SHALL return an error response with HTTP status 400 and a descriptive error message.

---

### Requirement 6: Phân quyền xem analytics

**User Story:** As a Manager, I want to view analytics for any specific user, so that I can monitor learner progress and identify users who need support.

#### Acceptance Criteria

1. WHEN a User requests analytics data without specifying a `targetUserId`, THE Analytics_Service SHALL return analytics data for that User only.
2. WHEN a Manager or Admin requests analytics data with a valid `targetUserId`, THE Analytics_Service SHALL return analytics data for the specified Target_User.
3. IF a User requests analytics data with a `targetUserId` that is not their own, THEN THE Analytics_Service SHALL return an error response with HTTP status 403.
4. IF a Manager or Admin provides a `targetUserId` that does not exist in the system, THEN THE Analytics_Service SHALL return an error response with HTTP status 404 and a descriptive error message.
5. WHEN a Manager accesses the Analytics_Dashboard, THE Analytics_Dashboard SHALL display a user selector component allowing the Manager to search and select a Target_User.
6. WHILE a user is not authenticated, THE Analytics_Service SHALL reject all analytics requests with HTTP status 401.

---

### Requirement 7: Hiệu năng và caching analytics

**User Story:** As a User, I want analytics data to load quickly, so that I can review my performance without waiting.

#### Acceptance Criteria

1. WHEN a User requests any analytics endpoint, THE Analytics_Service SHALL return a response within 2000 milliseconds for datasets containing up to 1000 Attempts.
2. THE Analytics_Dashboard SHALL display a loading skeleton while analytics data is being fetched, preventing layout shift.
3. WHEN analytics data has been fetched successfully, THE Analytics_Dashboard SHALL cache the result for 5 minutes using TanStack Query's `staleTime` configuration, avoiding redundant network requests during the same session.
4. WHEN a User completes a new test Attempt, THE Analytics_Dashboard SHALL invalidate the analytics cache so that the next request fetches updated data.
