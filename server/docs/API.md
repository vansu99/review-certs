# Review Certs API Documentation

## Overview

REST API for the Quiz/MCQ system. All endpoints return JSON responses.

**Base URL:** `http://localhost:3000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

---

## Endpoints

### Auth

| Method | Endpoint        | Description               | Auth |
| ------ | --------------- | ------------------------- | ---- |
| POST   | `/auth/login`   | Login with email/password | No   |
| POST   | `/auth/logout`  | Logout                    | Yes  |
| GET    | `/auth/profile` | Get current user          | Yes  |

**POST /auth/login**

```json
// Request
{ "email": "user@example.com", "password": "password" }

// Response
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "User" },
    "accessToken": "eyJhbG..."
  }
}
```

---

### Categories

| Method | Endpoint                | Description           | Auth | Roles          |
| ------ | ----------------------- | --------------------- | ---- | -------------- |
| GET    | `/categories`           | List all categories   | Yes  | All            |
| GET    | `/categories/:id`       | Get category by ID    | Yes  | All            |
| GET    | `/categories/:id/tests` | Get tests in category | Yes  | All            |
| POST   | `/categories`           | Create category       | Yes  | Admin, Manager |
| PUT    | `/categories/:id`       | Update category       | Yes  | Admin, Manager |
| DELETE | `/categories/:id`       | Delete category       | Yes  | Admin, Manager |

---

### Tests

| Method | Endpoint        | Description             | Auth | Roles          |
| ------ | --------------- | ----------------------- | ---- | -------------- |
| GET    | `/tests/:id`    | Get test with questions | Yes  | All            |
| POST   | `/tests`        | Create test             | Yes  | Admin, Manager |
| PUT    | `/tests/:id`    | Update test             | Yes  | Admin, Manager |
| DELETE | `/tests/:id`    | Delete test             | Yes  | Admin, Manager |
| POST   | `/tests/submit` | Submit test answers     | Yes  | All            |

**POST /tests/submit**

```json
// Request
{ "testId": "test-1", "answers": { "q1": ["opt-a"], "q2": ["opt-b", "opt-c"] } }

// Response
{
  "success": true,
  "data": {
    "attempt": { "id": "...", "score": 80, "correctAnswers": 4, "totalQuestions": 5 },
    "test": { ... },
    "correctAnswerMap": { "q1": ["opt-a"], "q2": ["opt-b"] }
  }
}
```

---

### History

| Method | Endpoint        | Description             | Auth |
| ------ | --------------- | ----------------------- | ---- |
| GET    | `/history`      | Get user's test history | Yes  |
| GET    | `/attempts/:id` | Get attempt details     | Yes  |

**Query Parameters for GET /history:**

- `categoryId` - Filter by category
- `status` - Filter: `all`, `passed`, `failed`
- `sortBy` - Sort by: `date`, `score`
- `sortOrder` - Order: `asc`, `desc`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

---

### Goals

| Method | Endpoint     | Description       | Auth |
| ------ | ------------ | ----------------- | ---- |
| GET    | `/goals`     | List user's goals | Yes  |
| GET    | `/goals/:id` | Get goal by ID    | Yes  |
| POST   | `/goals`     | Create goal       | Yes  |
| PUT    | `/goals/:id` | Update goal       | Yes  |
| DELETE | `/goals/:id` | Delete goal       | Yes  |

---

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

| Code | Description                          |
| ---- | ------------------------------------ |
| 400  | Bad Request - Invalid input          |
| 401  | Unauthorized - Invalid/missing token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found                            |
| 500  | Internal Server Error                |

---

## Demo Credentials

| Role    | Email               | Password |
| ------- | ------------------- | -------- |
| Admin   | admin@example.com   | password |
| Manager | manager@example.com | password |
| User    | user@example.com    | password |
