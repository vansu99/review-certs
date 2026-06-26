# Deployment Guide

Instructions for deploying Review Certs to production environments.

---

## Deployment Options

| Method | Best For | Complexity |
|--------|----------|-----------|
| [Docker Compose](#docker-compose-single-server) | Single server, small teams | Low |
| [Manual Deployment](#manual-deployment) | Custom infrastructure | Medium |
| [Cloud Platforms](#cloud-deployment) | Scalability, managed services | Medium-High |

---

## Docker Compose (Single Server)

The simplest production deployment. Suitable for small to medium traffic.

### Prerequisites

- Linux server (Ubuntu 22.04+ recommended)
- Docker Engine 24+
- Docker Compose v2
- Domain name (optional, for HTTPS)

### 1. Prepare the Server

```bash
# Install Docker (Ubuntu)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone the repository
git clone <repository-url> /opt/review-certs
cd /opt/review-certs
```

### 2. Configure Environment

Create a `.env` file at the project root:

```env
# Database
DB_PASSWORD=GENERATE_A_STRONG_PASSWORD_HERE
DB_NAME=review_certs

# API
PORT=3000
JWT_SECRET=GENERATE_A_RANDOM_64_CHAR_STRING_HERE
JWT_EXPIRES_IN=7d

# Optional
NODE_ENV=production
```

Generate secure values:
```bash
# Generate JWT secret
openssl rand -base64 48

# Generate DB password
openssl rand -base64 24
```

### 3. Build and Start

```bash
docker-compose up -d --build
```

Verify:
```bash
# Check container status
docker-compose ps

# Check API health
curl http://localhost:3000/api/health

# View logs
docker-compose logs -f api
```

### 4. Build the Frontend

```bash
cd client
npm install
npm run build
```

The `dist/` directory contains the static SPA. Serve it with Nginx, Caddy, or any static file server.

### 5. Nginx Reverse Proxy (Recommended)

Install Nginx on the host and configure:

```nginx
# /etc/nginx/sites-available/review-certs
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (static files)
    location / {
        root /opt/review-certs/client/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/review-certs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Enable HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot auto-renews certificates.

---

## Manual Deployment

### Backend

1. **Install Node.js 20 LTS** on your server
2. **Install MySQL 8.0** (or use a managed database service)
3. **Clone** the repository and install production dependencies:

```bash
cd server
npm ci --only=production
```

4. **Configure** environment variables (see [Environment Setup](./ENVIRONMENT_SETUP.md))
5. **Run migrations:**

```bash
npm run db:setup   # First time
npm run db:migrate # Subsequent updates
```

6. **Start with a process manager:**

```bash
# Using PM2
npm install -g pm2
pm2 start src/index.js --name review-certs-api
pm2 save
pm2 startup
```

### Frontend

```bash
cd client
npm ci
npm run build
```

Deploy the `dist/` folder to:
- Nginx / Apache static hosting
- AWS S3 + CloudFront
- Vercel / Netlify
- Any static file hosting

---

## Cloud Deployment

### AWS Architecture

```
Route53 (DNS)
  → CloudFront (CDN + HTTPS)
    → S3 (Frontend static files)
    → ALB (API load balancer)
      → ECS/EC2 (API containers)
        → RDS MySQL (Managed database)
```

### Vercel + Railway (Simple Cloud)

1. **Frontend → Vercel:**
   - Connect your Git repo
   - Set root directory to `client/`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables: `VITE_API_BASE_URL=https://your-api.railway.app/api`

2. **Backend → Railway:**
   - Connect your Git repo
   - Set root directory to `server/`
   - Add MySQL plugin
   - Set environment variables (JWT_SECRET, etc.)
   - Railway auto-detects Node.js and runs `npm start`

---

## Production Checklist

### Security

- [ ] JWT_SECRET is a unique random string (min 64 chars)
- [ ] DB_PASSWORD is strong and unique
- [ ] HTTPS is enabled (TLS 1.2+)
- [ ] CORS is configured for your domain only
- [ ] Rate limiting is active
- [ ] Helmet headers are enabled
- [ ] `.env` files are NOT in the repository
- [ ] Debug/dev files are not deployed

### Performance

- [ ] Frontend is built with production mode (`npm run build`)
- [ ] Static assets have cache headers (1 year for hashed files)
- [ ] Gzip/Brotli compression is enabled (Nginx)
- [ ] Database has appropriate indexes (check schema)
- [ ] Connection pool is sized for expected load

### Reliability

- [ ] Database backups are configured (daily minimum)
- [ ] Application logs are being collected
- [ ] Health check endpoint is monitored
- [ ] Process manager restarts on crash (PM2 / Docker restart policy)
- [ ] Disk space monitoring is active

### Monitoring

- [ ] Uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Error tracking (e.g., Sentry) — optional but recommended
- [ ] Log aggregation for debugging production issues

---

## Database Backups

### Docker Volume Backup

```bash
# Create backup
docker exec review-certs-db mysqldump -u root -p review_certs > backup_$(date +%Y%m%d).sql

# Restore from backup
docker exec -i review-certs-db mysql -u root -p review_certs < backup_20240115.sql
```

### Automated Backups (cron)

```bash
# /etc/cron.d/review-certs-backup
0 2 * * * root docker exec review-certs-db mysqldump -u root -pYOUR_PASSWORD review_certs | gzip > /backups/review-certs-$(date +\%Y\%m\%d).sql.gz
```

---

## Updating in Production

### Rolling Update (Docker)

```bash
cd /opt/review-certs
git pull origin main

# Rebuild and restart (zero-downtime with restart policy)
docker-compose up -d --build api

# If schema changed:
docker exec -it review-certs-api node database/migrate.js
```

### Frontend Update

```bash
cd client
npm ci
npm run build
# Nginx serves new files immediately (no restart needed)
```

---

## Troubleshooting

### API Container Won't Start

```bash
# Check logs
docker-compose logs api

# Common issues:
# - Database not ready (check depends_on + healthcheck)
# - Missing environment variables
# - Port conflict
```

### Database Connection Timeout

```bash
# Check if DB is healthy
docker-compose ps db

# Check connectivity from API container
docker exec review-certs-api node -e "
  const mysql = require('mysql2/promise');
  mysql.createConnection({host:'db',user:'root',password:'...'})
    .then(c => { console.log('OK'); c.end(); })
    .catch(e => console.error(e.message));
"
```

### Out of Memory

```bash
# Check container resource usage
docker stats

# Increase limits in docker-compose.yml:
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Disk Space Full

```bash
# Clean Docker resources
docker system prune -af
docker volume prune -f
```
