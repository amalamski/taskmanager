# 🚀 TaskFlow - Deployment Guide

This guide covers multiple deployment options. Choose the one that fits your hosting environment.

---

## 📋 Quick Overview

| Component | Technology | Port |
|-----------|------------|------|
| Frontend | React + Vite | 5173 (dev) / Static files (prod) |
| Backend | Node.js + Express | 3001 |
| Database | PostgreSQL | 5432 |

---

## Option 1: Traditional VPS/Shared Hosting (Most Common)

### Step 1: Prepare Your Files

```bash
# 1. Build the frontend
npm run build

# 2. Your dist/ folder now contains all static files
```

### Step 2: Upload to Server

**Using FTP/SFTP (FileZilla, WinSCP, etc.):**

```
Upload these folders to your server:
├── dist/           → /var/www/taskflow/ (or your web root)
├── server/         → /var/www/taskflow-server/
```

**Using SCP:**
```bash
# Upload frontend
scp -r dist/* user@your-server.com:/var/www/taskflow/

# Upload backend
scp -r server/ user@your-server.com:/var/www/taskflow-server/
```

### Step 3: Configure Backend on Server

```bash
# SSH into your server
ssh user@your-server.com

# Navigate to server folder
cd /var/www/taskflow-server

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional, for demo data)
npx prisma db seed

# Create .env file
nano .env
```

**.env file content:**
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow?schema=public"
JWT_SECRET="your-super-secret-key-change-this-in-production"
NODE_ENV=production
FRONTEND_URL="https://yourdomain.com"
```

### Step 4: Configure Frontend for Production

**Update `src/lib/api.ts` with your production backend URL:**

```typescript
const API_BASE_URL = 'https://yourdomain.com/api';
// or if using subdomain:
// const API_BASE_URL = 'https://api.yourdomain.com';
```

Then rebuild:
```bash
npm run build
```

### Step 5: Set Up Process Manager (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start the backend with PM2
cd /var/www/taskflow-server
pm2 start npm --name "taskflow-api" -- run dev
# Or for production:
pm2 start npm --name "taskflow-api" -- run start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 6: Configure Web Server (Nginx)

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/taskflow
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend static files
    location / {
        root /var/www/taskflow;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support (if needed)
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/taskflow /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 7: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is setup automatically
```

---

## Option 2: Docker Deployment (Recommended for Production)

### Step 1: Create Dockerfile for Backend

**`server/Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]
```

### Step 2: Create Dockerfile for Frontend

**`Dockerfile`:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 3: Create nginx.conf for Frontend

**`nginx.conf`:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 4: Update docker-compose.yml

**`docker-compose.yml`:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: taskflow-db
    environment:
      POSTGRES_USER: taskflow
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: taskflow
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - taskflow-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taskflow"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./server
    container_name: taskflow-api
    environment:
      PORT: 3001
      DATABASE_URL: postgresql://taskflow:your_secure_password@postgres:5432/taskflow?schema=public
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      NODE_ENV: production
      FRONTEND_URL: http://localhost
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - taskflow-network
    restart: unless-stopped

  frontend:
    build: .
    container_name: taskflow-web
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - taskflow-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  taskflow-network:
    driver: bridge
```

### Step 5: Deploy with Docker

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Step 6: Run Database Migrations

```bash
# Run migrations inside the backend container
docker-compose exec backend npx prisma migrate deploy

# Seed database (optional)
docker-compose exec backend npx prisma db seed
```

---

## Option 3: Cloud Platform Deployment

### Vercel (Frontend) + Railway/Render (Backend)

#### Frontend on Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend-url.railway.app/api"
  }
}
```

#### Backend on Railway:

1. Push your code to GitHub
2. Connect Railway to your repository
3. Set the root directory to `server`
4. Add environment variables:
   - `DATABASE_URL` (Railway provides PostgreSQL addon)
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-app.vercel.app`

#### Backend on Render:

1. Create new Web Service
2. Connect GitHub repository
3. Root Directory: `server`
4. Build Command: `npm install && npx prisma generate && npm run build`
5. Start Command: `npm run start`
6. Add environment variables same as Railway

---

## Option 4: cPanel/Shared Hosting

### Frontend Only (Static Files):

```bash
# Build frontend
npm run build

# Upload dist/ folder contents to public_html via FTP
```

### Backend (if Node.js is supported):

1. Upload `server/` folder to a directory outside public_html
2. Setup Node.js app in cPanel
3. Point to `server/dist/index.js`
4. Set environment variables in cPanel
5. Configure reverse proxy in cPanel

**Note:** Many shared hosts don't support Node.js well. Consider VPS or cloud hosting instead.

---

## 🔧 Environment Variables Reference

### Backend (.env):
```env
# Required
PORT=3001
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
JWT_SECRET="your-secure-random-string-min-32-chars"

# Optional
NODE_ENV=production
FRONTEND_URL="https://yourdomain.com"
CORS_ORIGIN="https://yourdomain.com"
```

### Frontend (.env):
```env
VITE_API_URL=https://yourdomain.com/api
```

---

## 📝 Pre-Deployment Checklist

- [ ] Update API URL in frontend (`src/lib/api.ts`)
- [ ] Change JWT_SECRET to a secure random string
- [ ] Update DATABASE_URL with production credentials
- [ ] Build frontend (`npm run build`)
- [ ] Run database migrations (`npx prisma migrate deploy`)
- [ ] Test all API endpoints
- [ ] Setup SSL certificate
- [ ] Configure firewall (allow ports 80, 443, 3001)
- [ ] Setup backup strategy for database
- [ ] Configure log rotation
- [ ] Setup monitoring (optional: PM2, New Relic, etc.)

---

## 🚨 Common Issues & Solutions

### Issue: Frontend can't connect to backend
**Solution:** Check CORS settings and API URL in frontend

### Issue: Database connection failed
**Solution:** Verify DATABASE_URL and ensure PostgreSQL is running

### Issue: Prisma client not found
**Solution:** Run `npx prisma generate` in server directory

### Issue: 404 on page refresh (React Router)
**Solution:** Configure web server to redirect all routes to index.html

### Issue: JWT token expired
**Solution:** Check token expiration time and refresh token logic

---

## 📊 Monitoring & Maintenance

### PM2 Commands:
```bash
pm2 status          # Check running apps
pm2 logs            # View logs
pm2 restart all     # Restart all apps
pm2 monit           # Real-time monitoring
```

### Database Backup:
```bash
# Backup
pg_dump -U taskflow taskflow > backup.sql

# Restore
psql -U taskflow taskflow < backup.sql
```

### Log Files:
```bash
# Backend logs
/var/log/taskflow-api.log

# Nginx logs
/var/log/nginx/access.log
/var/log/nginx/error.log
```

---

## 🎯 Quick Deploy Commands Summary

```bash
# 1. Build frontend
npm run build

# 2. Upload files to server
scp -r dist/* server/ user@server:/var/www/

# 3. SSH to server
ssh user@server

# 4. Setup backend
cd /var/www/server
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed

# 5. Start with PM2
pm2 start npm --name "taskflow-api" -- run start
pm2 save

# 6. Configure Nginx (already setup)
sudo systemctl restart nginx

# 7. Setup SSL
sudo certbot --nginx -d yourdomain.com
```

---

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs` or `pm2 logs`
2. Verify environment variables
3. Test database connection
4. Check network/firewall settings

---

**Last Updated:** 2024
**Version:** 1.0.0
