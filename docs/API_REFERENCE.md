# API Reference

Complete REST API documentation for the Review Certs backend.

**Base URL:** `http://localhost:3000/api`

---

## Table of Contents

- [Authentication](#authentication)
- [Categories](#categories)
- [Tests](#tests)
- [History & Attempts](#history--attempts)
- [Goals](#goals)
- [Bookmarks](#bookmarks)
- [Dashboard](#dashboard)
- [Analytics](#analytics)
- [Groups](#groups)
- [Blogs](#blogs)

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

---

## Authentication

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <accessToken>
```

### POST /api/auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "Admin",
      "avatar": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST /api/auth/logout

Logout current user. (Token invalidation is client-side.)

**Auth:** Required

**Response (200):**
```json
{ "success": true, "message": "Logout successful", "data": null }
```

### GET /api/auth/profile

Get current user's profile.

**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "Admin",
    "avatar": null,
    "phone": null,
    "gender": null,
    "dateOfBirth": null,
    "country": null,
    "facebook": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/auth/profile

Update current user's profile.

**Auth:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "country": "Vietnam",
  "facebook": "https://facebook.com/johndoe"
}
```

**Response (200):** Updated user object.

---

## Categories

### GET /api/categories

List all categories with test counts.

**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "JavaScript",
      "description": "Core JavaScript concepts",
      "icon": "📚",
      "testCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/categories/:id

Get a single category.

**Auth:** Required

### POST /api/categories

Create a new category.

**Auth:** Required | **Role:** Admin, Manager

**Request Body:**
```json
{
  "name": "React",
  "description": "React framework fundamentals",
  "icon": "⚛️"
}
```

### PUT /api/categories/:id

Update a category.

**Auth:** Required | **Role:** Admin, Manager

### DELETE /api/categories/:id

Soft-delete a category and its tests.

**Auth:** Required | **Role:** Admin, Manager

---

## Tests

### GET /api/tests/:id

Get a test with all questions and options.

**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "categoryId": "uuid",
    "title": "JavaScript Basics",
    "description": "Test your JS knowledge",
    "duration": 30,
    "questionCount": 10,
    "questions": [
      {
        "id": "uuid",
        "content": "What is a closure?",
        "type": "single",
        "explanation": "A closure is...",
        "topic": "Functions",
        "options": [
          { "id": "uuid", "content": "Option A", "isCorrect": true },
          { "id": "uuid", "content": "Option B", "isCorrect": false }
        ]
      }
    ],
    "difficulty": "Beginner",
    "participants": 42,
    "passingScore": 70,
    "videoUrl": null,
    "imageUrl": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/tests

Create a new test with questions and options.

**Auth:** Required | **Role:** Admin, Manager

**Request Body:**
```json
{
  "categoryId": "uuid",
  "title": "Advanced React",
  "description": "Test advanced React patterns",
  "duration": 45,
  "difficulty": "Advanced",
  "passingScore": 80,
  "questions": [
    {
      "content": "What hook replaces componentDidMount?",
      "type": "single",
      "explanation": "useEffect with empty deps array",
      "options": [
        { "content": "useEffect", "isCorrect": true },
        { "content": "useState", "isCorrect": false },
        { "content": "useRef", "isCorrect": false }
      ]
    }
  ]
}
```

### POST /api/tests/submit

Submit answers for a test.

**Auth:** Required

**Request Body:**
```json
{
  "testId": "uuid",
  "answers": {
    "question-uuid-1": ["option-uuid-a"],
    "question-uuid-2": ["option-uuid-b", "option-uuid-c"]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "uuid",
      "testId": "uuid",
      "score": 80,
      "totalQuestions": 10,
      "correctAnswers": 8,
      "startedAt": "2024-01-15T10:00:00.000Z",
      "completedAt": "2024-01-15T10:25:00.000Z"
    },
    "test": { ... },
    "correctAnswerMap": {
      "question-uuid-1": ["option-uuid-a"],
      "question-uuid-2": ["option-uuid-b", "option-uuid-c"]
    }
  }
}
```

### PUT /api/tests/:id

Update a test.

**Auth:** Required | **Role:** Admin, Manager

### DELETE /api/tests/:id

Soft-delete a test.

**Auth:** Required | **Role:** Admin, Manager

---

## History & Attempts

### GET /api/history

Get the authenticated user's test attempt history.

**Auth:** Required

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `categoryId` | string | — | Filter by category |
| `status` | `passed` \| `failed` | — | Filter by result |
| `sortBy` | `date` \| `score` | `date` | Sort field |
| `sortOrder` | `asc` \| `desc` | `desc` | Sort direction |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "attemptId": "uuid",
        "testId": "uuid",
        "testTitle": "JavaScript Basics",
        "categoryId": "uuid",
        "categoryName": "JavaScript",
        "categoryIcon": "📚",
        "score": 80,
        "totalQuestions": 10,
        "correctAnswers": 8,
        "duration": 15,
        "completedAt": "2024-01-15T10:25:00.000Z",
        "isPassed": true
      }
    ],
    "stats": {
      "totalTests": 25,
      "passedTests": 20,
      "failedTests": 5,
      "averageScore": 78
    },
    "totalPages": 3,
    "currentPage": 1
  }
}
```

### GET /api/attempts/:id

Get detailed attempt with questions, options, and user's answers.

**Auth:** Required

---

## Goals

### GET /api/goals

List user's learning goals.

**Auth:** Required

### POST /api/goals

Create a learning goal.

**Auth:** Required

**Request Body:**
```json
{
  "name": "Master JavaScript",
  "description": "Pass all JS tests with 80%+",
  "targetType": "category",
  "categoryId": "uuid",
  "passingScore": 80,
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "priority": "high"
}
```

### PUT /api/goals/:id

Update a goal.

### DELETE /api/goals/:id

Soft-delete a goal.

---

## Bookmarks

### GET /api/bookmarks

List user's bookmarked tests.

**Auth:** Required

### POST /api/bookmarks

Bookmark a test.

**Request Body:**
```json
{ "testId": "uuid" }
```

### DELETE /api/bookmarks/:testId

Remove a bookmark.

---

## Dashboard

### GET /api/dashboard/stats

Get dashboard statistics.

**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "testsCompleted": 25,
    "averageScore": 78,
    "totalTime": "4h 30m",
    "streak": 5
  }
}
```

### GET /api/dashboard/recent-activity

Get recent test completions.

**Auth:** Required

**Query:** `?limit=5`

### GET /api/dashboard/heatmap

Get daily activity data for the past 365 days.

**Auth:** Required

**Query:** `?timezone=+07:00`

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "date": "2024-01-15", "count": 3 },
    { "date": "2024-01-16", "count": 1 }
  ]
}
```

### GET /api/dashboard/streak

Get streak statistics.

**Auth:** Required

**Query:** `?timezone=+07:00`

---

## Analytics

### GET /api/analytics/score-trend

Get score history over time.

**Auth:** Required

**Query:** `?period=30d` (options: `30d`, `90d`, `6m`, `1y`)

### GET /api/analytics/category-performance

Get performance breakdown by category.

**Auth:** Required

### GET /api/analytics/question-type-stats

Get accuracy stats by question type (single vs multiple choice).

**Auth:** Required

---

## Groups

### GET /api/groups

List groups the user belongs to.

**Auth:** Required

### POST /api/groups

Create a new study group.

**Auth:** Required

**Request Body:**
```json
{
  "name": "AWS Certification Study Group",
  "description": "Preparing for AWS Solutions Architect exam"
}
```

### GET /api/groups/:id

Get group details including members, exams, goals, and progress.

**Auth:** Required (must be member)

### POST /api/groups/:id/members

Add a member to the group.

**Auth:** Required | **Role in group:** Admin

**Request Body:**
```json
{ "identifier": "user@example.com" }
```

### POST /api/groups/:id/exams

Add mandatory exams to the group.

**Auth:** Required | **Role in group:** Admin

**Request Body:**
```json
{ "testIds": ["uuid-1", "uuid-2"] }
```

### DELETE /api/groups/:id/exams/:testId

Remove a mandatory exam. Blocked if group progress >= 30%.

**Auth:** Required | **Role in group:** Admin

### POST /api/groups/:id/reset

Reset group progress (allows re-taking exams).

**Auth:** Required | **Role in group:** Admin

### GET /api/groups/:id/leaderboard

Get group member rankings by total score.

**Auth:** Required

### GET /api/groups/:id/discussions

Get group discussion comments.

**Auth:** Required

### POST /api/groups/:id/discussions

Post a comment in group discussion.

**Auth:** Required

**Request Body:**
```json
{
  "content": "Has anyone passed the networking module?",
  "parentId": null
}
```

---

## Blogs

### Public Endpoints (No Auth Required)

#### GET /api/blogs

List published blogs.

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `page` | number | 1 |
| `pageSize` | number | 10 |
| `search` | string | — |

Only returns blogs where `status = 'published'` and within active date range.

#### GET /api/blogs/:slug

Get a single published blog by URL slug. Increments view count.

#### POST /api/blogs/:id/like

Toggle like on a blog. Works for authenticated users (by user ID) and guests (by fingerprint).

#### GET /api/blogs/:id/like-status

Check if current user/guest has liked a blog.

### Protected Endpoints (Auth Required)

#### GET /api/blogs/manage

List all blogs for management. Admin/Manager see all; Users see only their own.

**Query:** `?page=1&pageSize=10&status=draft&search=keyword`

#### GET /api/blogs/manage/:id

Get a single blog for editing.

#### POST /api/blogs

Create a new blog post.

**Request Body:**
```json
{
  "title": "Getting Started with React",
  "description": "<p>Blog content in HTML...</p>",
  "status": "draft",
  "start_date": "2024-02-01",
  "end_date": null,
  "meta_title": "React Tutorial",
  "meta_description": "Learn React from scratch"
}
```

#### PUT /api/blogs/:id

Update a blog post. Users can only edit their own.

#### DELETE /api/blogs/:id

Soft-delete a blog post. Users can only delete their own.

---

## Health Check

### GET /api/health

Returns API status. No authentication required.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 400 | Bad Request | Missing required fields, invalid input |
| 401 | Unauthorized | Missing/expired token |
| 403 | Forbidden | Insufficient role/permissions |
| 404 | Not Found | Resource doesn't exist or was soft-deleted |
| 409 | Conflict | Duplicate resource (e.g., duplicate bookmark) |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting

Currently not enforced (planned for production). When enabled:
- Window: 15 minutes
- Max requests: 100 per window per IP
- Response when exceeded: `429 Too Many Requests`
