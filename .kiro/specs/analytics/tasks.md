# Implementation Plan: Analytics Feature

## Overview

Triển khai tính năng Analytics theo thứ tự: backend API trước (controller + routes), sau đó frontend (service → hooks → components → page → routing). Mỗi bước xây dựng trên bước trước và kết thúc bằng việc kết nối toàn bộ vào ứng dụng.

## Tasks

- [x] 1. Tạo Analytics Controller (Backend)
  - Tạo file `server/src/controllers/analytics.controller.js`
  - Implement `getScoreTrend(req, res, next)`:
    - Validate `period` query param từ whitelist `{ '30d': '30 DAY', '90d': '90 DAY', '6m': '6 MONTH', '1y': '1 YEAR' }`; trả về 400 nếu không hợp lệ
    - Chạy SQL score-trend query với `DATE_SUB(NOW(), INTERVAL ...)` theo period đã map
    - Trả về array `ScoreTrendPoint[]` qua `successResponse`
  - Implement `getCategoryPerformance(req, res, next)`:
    - Chạy SQL aggregation JOIN `test_attempts → tests → categories`
    - Tính `averageScore`, `passRate` (%), `attemptCount` GROUP BY category
    - Trả về array `CategoryPerformanceItem[]` sorted by `attemptCount DESC`
  - Implement `getQuestionTypeStats(req, res, next)`:
    - Chạy SQL aggregation JOIN `test_attempt_answers → test_attempts → questions`
    - Tính `correctCount`, `incorrectCount`, `totalCount` GROUP BY `q.type`
    - Trả về array `QuestionTypeStatItem[]`
  - Tất cả handlers dùng `try/catch` và gọi `next(error)` khi có lỗi
  - _Requirements: 1.3, 1.4, 1.6, 2.2, 2.3, 2.4, 3.2, 3.3, 3.4_

  - [ ]* 1.1 Viết unit tests cho analytics controller
    - Test `getScoreTrend` trả về đúng số điểm trong period (mock `pool.execute`)
    - Test `getScoreTrend` trả về 400 với period không hợp lệ
    - Test `getCategoryPerformance` tính đúng `averageScore` và `passRate`
    - Test `getQuestionTypeStats` tính đúng `correctCount` / `incorrectCount`
    - _Requirements: 1.4, 1.6, 2.3, 3.3_

  - [ ]* 1.2 Viết property test: Invalid period rejected (Property 3)
    - **Property 3: Invalid period rejected with 400**
    - Generate arbitrary strings không thuộc `['30d','90d','6m','1y']`; assert validator luôn trả về false
    - **Validates: Requirements 1.6**

  - [ ]* 1.3 Viết property test: Score trend period filter correctness (Property 1)
    - **Property 1: Score trend period filter correctness**
    - Generate random arrays of `ScoreTrendPoint` với varying `completedAt`; assert mọi điểm trả về đều nằm trong window của period
    - **Validates: Requirements 1.2**

  - [ ]* 1.4 Viết property test: totalCount invariant (Property 6)
    - **Property 6: Question type stats totalCount invariant**
    - Generate random `correctCount` và `incorrectCount`; assert `totalCount === correctCount + incorrectCount` sau aggregation
    - **Validates: Requirements 3.3**

- [x] 2. Tạo Analytics Routes và đăng ký vào server (Backend)
  - Tạo file `server/src/routes/analytics.routes.js`
    - `router.use(authenticate)` — áp dụng auth middleware cho tất cả routes
    - `GET /score-trend` → `getScoreTrend`
    - `GET /category-performance` → `getCategoryPerformance`
    - `GET /question-type-stats` → `getQuestionTypeStats`
  - Trong `server/src/index.js`:
    - Import `analyticsRoutes` từ `./routes/analytics.routes.js`
    - Thêm `app.use("/api/analytics", analyticsRoutes)` sau các routes hiện có
  - _Requirements: 4.1, 4.3_

  - [ ]* 2.1 Viết property test: Unauthenticated requests rejected (Property 8)
    - **Property 8: Unauthenticated requests are rejected**
    - Assert cả 3 endpoints trả về 401 khi gọi không có Bearer token
    - **Validates: Requirements 4.1, 4.3**

  - [ ]* 2.2 Viết property test: User data isolation (Property 9)
    - **Property 9: User data isolation**
    - Tạo 2 users với disjoint attempt sets; assert analytics của user A không chứa data của user B
    - **Validates: Requirements 4.2**

- [x] 3. Checkpoint — Backend hoàn chỉnh
  - Ensure all tests pass, ask the user if questions arise.
  - Kiểm tra thủ công: `curl -H "Authorization: Bearer <token>" http://localhost:3000/api/analytics/score-trend?period=30d`

- [x] 4. Tạo Analytics Service (Frontend)
  - Tạo file `client/src/features/analytics/services/analyticsService.ts`
  - Định nghĩa types: `Period`, `ScoreTrendPoint`, `CategoryPerformanceItem`, `QuestionTypeStatItem`
  - Implement `analyticsService.getScoreTrend(period: Period): Promise<ScoreTrendPoint[]>`
    - `GET /analytics/score-trend?period=${period}`
  - Implement `analyticsService.getCategoryPerformance(): Promise<CategoryPerformanceItem[]>`
    - `GET /analytics/category-performance`
  - Implement `analyticsService.getQuestionTypeStats(): Promise<QuestionTypeStatItem[]>`
    - `GET /analytics/question-type-stats`
  - Mỗi function dùng `axiosInstance.get<ApiResponse<T>>` và return `response.data.data`
  - _Requirements: 1.3, 2.2, 3.2_

  - [ ]* 4.1 Viết property test: Score trend response shape completeness (Property 2)
    - **Property 2: Score trend response shape completeness**
    - Generate random `ScoreTrendPoint` arrays; assert mọi object đều có đủ fields `attemptId`, `testTitle`, `score`, `passingScore`, `completedAt` với đúng type
    - **Validates: Requirements 1.4**

- [x] 5. Tạo Analytics Hooks (Frontend)
  - Tạo file `client/src/features/analytics/hooks/useAnalytics.ts`
  - Implement `useScoreTrend(period: Period)`:
    - `queryKey: ['analytics', 'score-trend', period]`
    - `queryFn: () => analyticsService.getScoreTrend(period)`
    - `staleTime: 5 * 60 * 1000` (5 phút)
  - Implement `useCategoryPerformance()`:
    - `queryKey: ['analytics', 'category-performance']`
    - `queryFn: analyticsService.getCategoryPerformance`
    - `staleTime: 5 * 60 * 1000`
  - Implement `useQuestionTypeStats()`:
    - `queryKey: ['analytics', 'question-type-stats']`
    - `queryFn: analyticsService.getQuestionTypeStats`
    - `staleTime: 5 * 60 * 1000`
  - _Requirements: 5.3, 5.4_

  - [ ]* 5.1 Viết property test: Category performance uniqueness và shape (Property 4)
    - **Property 4: Category performance response shape and uniqueness**
    - Generate random category performance arrays; assert không có duplicate `categoryId` và mọi entry có đủ required fields
    - **Validates: Requirements 2.3, 2.4**

  - [ ]* 5.2 Viết property test: Category performance sort order (Property 5)
    - **Property 5: Category performance sorted by attemptCount descending**
    - Generate random `CategoryPerformanceItem[]`; assert sau khi sort, mọi cặp adjacent `[i].attemptCount >= [i+1].attemptCount`
    - **Validates: Requirements 2.4**

  - [ ]* 5.3 Viết property test: Question type stats only returns types with data (Property 7)
    - **Property 7: Question type stats only returns types with data**
    - Generate answer history chỉ có `single` type; assert result array length === 1 và `questionType === 'single'`
    - **Validates: Requirements 3.4**

- [x] 6. Tạo ScoreTrendChart component (Frontend)
  - Cài đặt `recharts` dependency: `npm install recharts` trong `client/`
  - Tạo file `client/src/features/analytics/components/ScoreTrendChart.tsx`
  - Props: `data: ScoreTrendPoint[]`, `isLoading: boolean`, `error: Error | null`, `onRetry: () => void`
  - Khi `isLoading`: render skeleton placeholder (div với `animate-pulse`)
  - Khi `error`: render error card với nút "Retry" gọi `onRetry`
  - Khi `data.length === 0`: render empty-state message
  - Khi có data: render `<LineChart>` từ recharts
    - X-axis: `completedAt` formatted as `dd/MM`
    - Y-axis: 0–100
    - Line: `score` (màu indigo)
    - Reference line: `passingScore` (màu đỏ, dashed)
    - Tooltip hiển thị `testTitle`, `score`, `passingScore`
  - _Requirements: 1.1, 1.5, 5.1, 5.2_

  - [ ]* 6.1 Viết component tests cho ScoreTrendChart
    - Test render `<LineChart>` khi có data
    - Test render empty-state khi `data = []`
    - Test render skeleton khi `isLoading = true`
    - Test render error card khi `error` không null
    - _Requirements: 1.1, 1.5, 5.1, 5.2_

- [x] 7. Tạo CategoryPerformanceChart component (Frontend)
  - Tạo file `client/src/features/analytics/components/CategoryPerformanceChart.tsx`
  - Props: `data: CategoryPerformanceItem[]`, `isLoading: boolean`, `error: Error | null`, `onRetry: () => void`
  - Khi `isLoading`: render skeleton placeholder
  - Khi `error`: render error card với nút "Retry"
  - Khi `data.length === 0`: render empty-state message
  - Khi có data: render `<BarChart>` từ recharts
    - X-axis: `categoryName` (truncated nếu dài)
    - Y-axis: 0–100
    - Bar 1: `averageScore` (màu indigo)
    - Bar 2: `passRate` (màu emerald)
    - Tooltip hiển thị `categoryName`, `averageScore`, `passRate`, `attemptCount`
  - _Requirements: 2.1, 2.5, 5.1, 5.2_

  - [ ]* 7.1 Viết component tests cho CategoryPerformanceChart
    - Test render `<BarChart>` khi có data
    - Test render empty-state khi `data = []`
    - Test render skeleton khi `isLoading = true`
    - _Requirements: 2.1, 2.5, 5.1_

- [x] 8. Tạo QuestionTypeStatsChart component (Frontend)
  - Tạo file `client/src/features/analytics/components/QuestionTypeStatsChart.tsx`
  - Props: `data: QuestionTypeStatItem[]`, `isLoading: boolean`, `error: Error | null`, `onRetry: () => void`
  - Khi `isLoading`: render skeleton placeholder
  - Khi `error`: render error card với nút "Retry"
  - Khi `data.length === 0`: render empty-state message
  - Khi có data: render `<PieChart>` (donut) từ recharts cho mỗi question type
    - Mỗi type hiển thị: `correctCount` (màu emerald) và `incorrectCount` (màu rose)
    - Label hiển thị `questionType` và tỷ lệ phần trăm
    - Tooltip hiển thị `correctCount`, `incorrectCount`, `totalCount`
  - _Requirements: 3.1, 3.5, 5.1, 5.2_

  - [ ]* 8.1 Viết component tests cho QuestionTypeStatsChart
    - Test render `<PieChart>` khi có data
    - Test render empty-state khi `data = []`
    - Test render skeleton khi `isLoading = true`
    - _Requirements: 3.1, 3.5, 5.1_

- [x] 9. Tạo AnalyticsPage và lắp ráp tất cả components (Frontend)
  - Tạo file `client/src/pages/AnalyticsPage.tsx`
  - State: `period: Period` (default `'30d'`)
  - Gọi 3 hooks: `useScoreTrend(period)`, `useCategoryPerformance()`, `useQuestionTypeStats()`
  - Layout:
    - Header: tiêu đề "Analytics" + mô tả ngắn
    - Period filter bar: 4 nút `30d | 90d | 6m | 1y` (active state khi selected)
    - `<ScoreTrendChart>` với data/isLoading/error từ `useScoreTrend`; `onRetry` gọi `refetch`
    - Grid 2 cột (lg): `<CategoryPerformanceChart>` và `<QuestionTypeStatsChart>`
  - Truyền `onRetry={() => refetch()}` cho mỗi chart component
  - Export named: `export const AnalyticsPage = () => { ... }`
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 5.1, 5.2, 5.4_

  - [ ]* 9.1 Viết component tests cho AnalyticsPage
    - Test hiển thị skeleton khi tất cả queries đang loading
    - Test period filter buttons thay đổi active state
    - Test period filter trigger refetch với period mới
    - _Requirements: 1.2, 5.1, 5.4_

- [x] 10. Đăng ký route và thêm nav link (Frontend)
  - Trong `client/src/constants/routes.ts`:
    - Thêm `ANALYTICS: '/analytics'` vào object `ROUTES`
  - Trong `client/src/pages/index.ts`:
    - Thêm `export { AnalyticsPage } from './AnalyticsPage'`
  - Trong `client/src/app/router.tsx`:
    - Import `AnalyticsPage` từ `@/pages`
    - Thêm route `{ path: '/analytics', element: <AnalyticsPage /> }` vào protected routes bên trong `MainLayout`
  - Trong `client/src/components/layout/Sidebar.tsx`:
    - Import `BarChart2` từ `lucide-react` (hoặc icon phù hợp)
    - Thêm `<NavLink to={ROUTES.ANALYTICS}>` với icon và label "Analytics" vào phần Navigation
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 11. Tạo feature index và export types (Frontend)
  - Tạo file `client/src/features/analytics/index.ts`
    - Export hooks: `useScoreTrend`, `useCategoryPerformance`, `useQuestionTypeStats`
    - Export service: `analyticsService`
    - Export types: `Period`, `ScoreTrendPoint`, `CategoryPerformanceItem`, `QuestionTypeStatItem`
  - Thêm analytics types vào `client/src/types/index.ts` nếu cần dùng ở nơi khác
  - _Requirements: (structural — supports all requirements)_

- [x] 12. Final Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Kiểm tra: navigate đến `/analytics`, xác nhận 3 charts render đúng
  - Kiểm tra: thay đổi period filter, xác nhận score trend chart cập nhật
  - Kiểm tra: không có lỗi TypeScript (`tsc --noEmit`)

## Notes

- Tasks đánh dấu `*` là optional và có thể bỏ qua để triển khai MVP nhanh hơn
- `recharts` cần được cài đặt trước khi implement các chart components (Task 6)
- Tất cả SQL queries dùng parameterized `?` placeholders — không có string interpolation từ user input
- Period interval được map từ whitelist cố định trong controller, không phải từ query string trực tiếp
- TanStack Query `staleTime: 5 phút` giúp tránh refetch không cần thiết khi navigate (Requirement 5.3)
- Property tests dùng `fast-check` library; mỗi test chạy tối thiểu 100 iterations

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2"] },
    { "wave": 3, "tasks": ["3"] },
    { "wave": 4, "tasks": ["4"] },
    { "wave": 5, "tasks": ["5"] },
    { "wave": 6, "tasks": ["6", "7", "8"] },
    { "wave": 7, "tasks": ["9"] },
    { "wave": 8, "tasks": ["10", "11"] },
    { "wave": 9, "tasks": ["12"] }
  ]
}
```
