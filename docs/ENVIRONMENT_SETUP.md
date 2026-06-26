# Environment Setup

Complete guide to setting up the Review Certs development environment from scratch.

---

## Prerequisites

| Tool | Required Version | Check Command |
|------|-----------------|---------------|
| Node.js | v18+ (v20 recommended) | `node --version` |
| npm | v9+ | `npm --version` |
| MySQL | 8.0+ | `mysql --version` |
| Git | 2.30+ | `git --version` |
| Docker (optional) | 24+ | `docker --version` |

---

## Option A: Docker Setup (Recommended for Quick Start)

This option runs MySQL in a container — no local MySQL installation needed.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd review-certs
```

### 2. Start the Database

```bash
docker-compose up -d db
```

This starts MySQL 8.0 on port 3306 with:
- Root password: `admin@123` (change in production)
- Database: `review_certs`
- Auto-runs `schema.sql` and `seed.sql` on first start

Wait for it to be healthy:
```bash
docker-compose ps
# Should show "healthy" status
```

### 3. Configure and Start the Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=admin@123
DB_NAME=review_certs
JWT_SECRET=dev-only-change-in-production-use-random-string
JWT_EXPIRES_IN=7d
```

Install and run:
```bash
npm install
npm run dev
```

Verify: `http://localhost:3000/api/health` should return `{"status":"ok"}`

### 4. Configure and Start the Frontend

```bash
cd client
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

---

## Option B: Full Local Setup

### 1. Install MySQL 8.0

**Windows:**
- Download from [MySQL Community Downloads](https://dev.mysql.com/downloads/mysql/)
- Run the installer, set root password
- Ensure MySQL service is running

**macOS (Homebrew):**
```bash
brew install mysql@8.0
brew services start mysql@8.0
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server-8.0
sudo systemctl start mysql
sudo mysql_secure_installation
```

### 2. Create the Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE review_certs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Clone and Configure

```bash
git clone <repository-url>
cd review-certs
```

### 4. Set Up the Backend

```bash
cd server
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=review_certs
JWT_SECRET=generate-a-random-64-character-string-here
JWT_EXPIRES_IN=7d
```

Install dependencies and initialize the database:
```bash
npm install
npm run db:setup
```

This creates all tables and inserts demo data (users, categories, tests, questions).

Start the server:
```bash
npm run dev
```

### 5. Set Up the Frontend

```bash
cd ../client
npm install
```

The default `.env` should work for local development:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_BASE_URL=http://localhost:5173
```

Start the dev server:
```bash
npm run dev
```

---

## Verify Everything Works

### 1. Check API Health

```bash
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"..."}
```

### 2. Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

Should return a JSON response with `accessToken`.

### 3. Open the Frontend

Navigate to `http://localhost:5173` and log in with:
- Email: `admin@example.com`
- Password: `password`

---

## IDE Setup

### VS Code / Kiro (Recommended)

Install these extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript + JavaScript
- MySQL (for database browsing)

The project includes `.editorconfig` for consistent formatting.

### Recommended Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## Environment Variables Reference

### Server (`server/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | API server port |
| `NODE_ENV` | No | `development` | `development`, `production`, `test` |
| `DB_HOST` | Yes | — | MySQL hostname |
| `DB_PORT` | No | `3306` | MySQL port |
| `DB_USER` | Yes | — | MySQL username |
| `DB_PASSWORD` | Yes | — | MySQL password |
| `DB_NAME` | Yes | — | Database name |
| `JWT_SECRET` | Yes | — | Secret key for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration (`1h`, `7d`, `30d`) |

### Client (`client/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:3000/api` | Backend API URL |
| `VITE_APP_BASE_URL` | No | `http://localhost:5173` | Frontend URL |
| `VITE_VERSION` | No | — | App version string |

---

## Common Issues

### Port Already in Use

```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# macOS/Linux:
lsof -i :3000
kill -9 <pid>
```

### MySQL Connection Refused

- Ensure MySQL service is running
- Check that `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` are correct
- If using Docker, ensure the container is healthy: `docker-compose ps`

### CORS Errors in Browser

- Ensure the backend is running on the port specified in `VITE_API_BASE_URL`
- The backend allows all origins in development mode

### Node Module Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Database Schema Changes

If you pull changes that include new migrations:
```bash
cd server
npm run db:migrate
```

Or to completely reset:
```bash
npm run db:setup
# WARNING: This drops and recreates all tables
```

---

## Database Management

### View Data

```bash
# Connect to MySQL
mysql -u root -p review_certs

# Or via Docker
docker exec -it review-certs-db mysql -u root -p review_certs
```

### Reset Database

```bash
cd server
npm run db:setup
```

This drops all tables and re-creates them with seed data.

### Run Migrations

```bash
cd server
npm run db:migrate
```

---

## Useful Commands Cheat Sheet

| Task | Command |
|------|---------|
| Start backend (dev) | `cd server && npm run dev` |
| Start frontend (dev) | `cd client && npm run dev` |
| Lint frontend | `cd client && npm run lint` |
| Format frontend | `cd client && npm run format` |
| Build frontend | `cd client && npm run build` |
| Setup database | `cd server && npm run db:setup` |
| Run migrations | `cd server && npm run db:migrate` |
| Start all (Docker) | `docker-compose up -d` |
| Stop all (Docker) | `docker-compose down` |
| View Docker logs | `docker-compose logs -f api` |
| Reset Docker DB | `docker-compose down -v && docker-compose up -d` |
