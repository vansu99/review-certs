# Review Certs - Quiz/MCQ System

A full-stack quiz and certification system with React frontend and Node.js/Express backend.

## 📁 Project Structure

```
review-certs/
├── client/          # React + Vite frontend
└── server/          # Node.js + Express backend
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MySQL 8.0+
- npm or yarn

### 1. Setup Database

Create the MySQL database and configure connection:

```bash
cd server

# Copy environment template
cp .env.example .env

# Edit .env with your MySQL credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=review_certs
```

### 2. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Setup database (creates tables + seeds demo data)
npm run db:setup

# Start server
npm start
# or for development with auto-reload:
npm run dev
```

Server runs at: `http://localhost:3000`

### 3. Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

## 🔐 Demo Credentials

| Role    | Email               | Password |
| ------- | ------------------- | -------- |
| Admin   | admin@example.com   | password |
| Manager | manager@example.com | password |
| User    | user@example.com    | password |

## 📚 API Documentation

See [server/docs/API.md](./server/docs/API.md) for full API documentation.

## 🔑 Role Permissions

| Permission       | Admin | Manager | User |
| ---------------- | :---: | :-----: | :--: |
| Manage Users     |  ✅   |   ❌    |  ❌  |
| CRUD Categories  |  ✅   |   ✅    |  ❌  |
| CRUD Tests       |  ✅   |   ✅    |  ❌  |
| Take Tests       |  ✅   |   ✅    |  ✅  |
| View Own Results |  ✅   |   ✅    |  ✅  |
| View All Results |  ✅   |   ✅    |  ❌  |

## 🛠️ Tech Stack

**Frontend:**

- React 19 + Vite
- TypeScript
- TanStack Query
- Zustand
- Tailwind CSS
- shadcn/ui

**Backend:**

- Node.js + Express
- MySQL
- JWT Authentication
- bcrypt password hashing
