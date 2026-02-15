---
description: How to import exam questions from an Excel/CSV file
---

# Import Exam from Excel/CSV — Workflow

## Overview

Chức năng cho phép Admin/Manager import exam (bao gồm questions + answers) từ file Excel (.xlsx) hoặc CSV. File được parse hoàn toàn ở client-side, sau đó gửi data tới API `POST /api/tests`.

## Template Format

Sử dụng flat-table format, **1 row = 1 question**, tối đa 6 options (A–F):

| Column | Field              | Required | Description                                |
| ------ | ------------------ | -------- | ------------------------------------------ |
| A      | `question_number`  | ✅       | Số thứ tự câu hỏi (1, 2, 3...)             |
| B      | `question_content` | ✅       | Nội dung câu hỏi                           |
| C      | `question_type`    | ✅       | `single` hoặc `multiple`                   |
| D      | `explanation`      | ❌       | Giải thích đáp án                          |
| E      | `option_a`         | ✅       | Đáp án A                                   |
| F      | `option_b`         | ✅       | Đáp án B                                   |
| G      | `option_c`         | ❌       | Đáp án C                                   |
| H      | `option_d`         | ❌       | Đáp án D                                   |
| I      | `option_e`         | ❌       | Đáp án E                                   |
| J      | `option_f`         | ❌       | Đáp án F                                   |
| K      | `correct_answer`   | ✅       | `A`, `B`... hoặc `A,C` cho multiple choice |

### Example Data

```
question_number | question_content              | question_type | explanation           | option_a              | option_b          | option_c    | option_d | correct_answer
1               | What is JavaScript?           | single        | JS is a prog lang     | A programming language | A markup language | A database  | An OS    | A
2               | Which are valid React hooks?   | multiple      | useState, useEffect.. | useState              | useEffect         | useClass    | useDOM   | A,B
```

## Workflow Steps

### Step 1: Download Template

1. Mở trang **Exam List** (`/exams` hoặc tương đương)
2. Click nút **"Import Exam"** (chỉ Admin/Manager mới thấy)
3. Trong modal, click **"Download Template"** để tải file `exam_import_template.xlsx`
4. Mở file trong Excel/Google Sheets để xem format mẫu

### Step 2: Chuẩn Bị File Excel

1. Mở file template đã download
2. Giữ nguyên header row (row 1) — **KHÔNG ĐƯỢC XÓA hoặc ĐỔI TÊN header**
3. Xóa các row mẫu (nếu có)
4. Điền câu hỏi theo format:
   - Mỗi câu hỏi chiếm **1 row**
   - `question_number`: đánh số liên tục 1, 2, 3...
   - `question_type`: ghi `single` (1 đáp án đúng) hoặc `multiple` (nhiều đáp án đúng)
   - `option_a` đến `option_f`: điền nội dung các đáp án (tối thiểu 2 options: A và B)
   - `correct_answer`: ghi chữ cái tương ứng (VD: `A` hoặc `A,C,D` cho multiple)
   - `explanation`: giải thích (tùy chọn)
5. Lưu file dưới dạng `.xlsx` hoặc `.csv`

### Step 3: Upload & Preview

1. Quay lại modal **Import Exam**
2. Điền thông tin exam:
   - **Title**: tiêu đề exam
   - **Category**: chọn danh mục
   - **Duration**: thời gian làm bài (phút)
   - **Difficulty**: mức độ (Beginner/Intermediate/Advanced)
   - **Passing Score**: điểm đạt (%)
3. Upload file Excel/CSV
4. Hệ thống sẽ **parse và hiển thị preview**:
   - Bảng danh sách câu hỏi đã parse
   - Số câu hỏi hợp lệ / tổng số
   - Nếu có lỗi → hiển thị **chi tiết lỗi từng row** (VD: "Row 5: Missing question content")

### Step 4: Fix Errors (nếu có)

- Nếu preview có lỗi → sửa file Excel → upload lại
- Common errors:
  - Thiếu `question_content`
  - `question_type` không phải `single` hoặc `multiple`
  - Thiếu `correct_answer`
  - `correct_answer` chứa chữ cái không tồn tại option (VD: correct_answer = `D` nhưng `option_d` trống)
  - Question type là `single` nhưng `correct_answer` có nhiều hơn 1 đáp án

### Step 5: Confirm Import

1. Khi tất cả câu hỏi hợp lệ, click **"Import Exam"**
2. Hệ thống gửi data tới API `POST /api/tests`
3. Thành công → toast notification → modal đóng → exam list được refresh
4. Thất bại → hiển thị error message

## Technical Details

### File Locations

| File                                                       | Purpose                                 |
| ---------------------------------------------------------- | --------------------------------------- |
| `client/src/features/tests/components/ImportExamModal.tsx` | Modal UI component                      |
| `client/src/features/tests/utils/examImportUtils.ts`       | Parse, validate, transform logic        |
| `client/public/templates/exam_import_template.xlsx`        | Downloadable template file              |
| `client/src/features/tests/services/testService.ts`        | API service (createTest with questions) |
| `client/src/types/test.ts`                                 | TypeScript type definitions             |

### Supported File Types

- `.xlsx` (Excel 2007+) — **Recommended**
- `.csv` (Comma-separated values)

### Validation Rules

1. Header row phải match chính xác với template headers
2. `question_content` không được trống
3. `question_type` phải là `single` hoặc `multiple`
4. Ít nhất 2 options (A, B) phải có nội dung
5. `correct_answer` phải reference tới option thực sự có nội dung
6. Nếu `question_type = single` thì `correct_answer` chỉ được có 1 giá trị
7. Minimum 1 câu hỏi trong file

### Authorization

- Chỉ role **Admin** và **Manager** mới có quyền import exam
- Backend enforce qua middleware `authorize('Admin', 'Manager')` trên route `POST /api/tests`
