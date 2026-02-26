# 🗺️ TaskFlow Deployment Flowchart

## Quick Decision Tree

```
START: Want to deploy TaskFlow
│
├─ Do you have a VPS/server?
│  │
│  ├─ YES → Use DEPLOYMENT.md Option 1
│  │        └─> Upload files → Setup Nginx → Done!
│  │
│  └─ NO → Continue ↓
│
├─ Want easiest setup?
│  │
│  ├─ YES → Use QUICK-DEPLOY.md Option C
│  │        └─> Vercel (frontend) + Railway (backend)
│  │        └─> 5 clicks and done!
│  │
│  └─ NO → Continue ↓
│
├─ Prefer Docker?
│  │
│  ├─ YES → Use DEPLOYMENT.md Option 2
│  │        └─> docker-compose up -d
│  │        └─> Everything in containers!
│  │
│  └─ Continue ↓
│
└─ Want free tier?
   │
   ├─ YES → QUICK-DEPLOY.md Option C or D
   │        └─> Render (free backend + database)
   │        └─> Vercel/Netlify (free frontend)
   │
   └─ Buy a VPS ($5/mo) → Option 1
```

---

## Step-by-Step Visual Guide

### 🟢 Path 1: VPS Deployment (Most Control)

```
┌─────────────┐
│ 1. Build    │ npm run build
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 2. Upload   │ scp dist/ server/ to VPS
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 3. Install  │ SSH → npm install, prisma migrate
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 4. Start    │ pm2 start npm
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 5. Nginx    │ Configure reverse proxy
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 6. SSL      │ certbot --nginx
└──────┬──────┘
       │
       ▼
   ✅ LIVE!
```

---

### 🔵 Path 2: Docker Deployment (Most Portable)

```
┌─────────────┐
│ 1. Configure│ Edit docker-compose.yml
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 2. Build    │ docker-compose up -d --build
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 3. Migrate  │ docker-compose exec backend npx prisma migrate deploy
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 4. Seed     │ docker-compose exec backend npx prisma db seed
└──────┬──────┘
       │
       ▼
   ✅ LIVE! (http://localhost)
```

---

### 🟣 Path 3: Cloud Deployment (Easiest)

```
FRONTEND (Vercel):
┌─────────────┐
│ 1. Install  │ npm i -g vercel
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 2. Deploy   │ vercel --prod
└──────┬──────┘
       │
       ▼
   ✅ Frontend Live!

BACKEND (Railway):
┌─────────────┐
│ 1. Connect  │ Railway → GitHub → Select repo
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 2. Configure│ Set root: server/, add env vars
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 3. Deploy   │ Automatic on push!
└──────┬──────┘
       │
       ▼
   ✅ Backend Live!
```

---

## File Upload Map

### What Goes Where:

```
YOUR COMPUTER                    SERVER
┌─────────────────┐            ┌──────────────────┐
│ dist/           │ ────────→  │ /var/www/html/   │
│ (built files)   │  FTP/SCP   │ (web root)       │
└─────────────────┘            └──────────────────┘

┌─────────────────┐            ┌──────────────────┐
│ server/         │ ────────→  │ /var/www/api/    │
│ (backend code)  │  FTP/SCP   │ (backend folder) │
└─────────────────┘            └──────────────────┘
```

### Server Structure After Upload:

```
/var/www/
├── html/              (frontend - dist/ contents)
│   ├── index.html
│   └── assets/
│
└── api/               (backend - server/ contents)
    ├── src/
    ├── prisma/
    ├── package.json
    └── .env
```

---

## Data Flow Diagram

```
USER BROWSER
     │
     │ https://yourdomain.com
     ▼
┌─────────────┐
│   Nginx     │ (Port 80/443)
│  Web Server │
└──────┬──────┘
       │
       ├─→ Serve static files (React app)
       │
       └─→ Proxy /api/* requests
             │
             ▼
       ┌─────────────┐
       │   Node.js   │ (Port 3001)
       │   Express   │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │  PostgreSQL │ (Port 5432)
       │  Database   │
       └─────────────┘
```

---

## Environment Variables Flow

```
┌──────────────────────────────────────────┐
│          BUILD TIME (Your Computer)      │
├──────────────────────────────────────────┤
│ .env file:                               │
│ VITE_API_URL=https://api.example.com     │
│                                          │
│ ↓ Injected into React app during build   │
│ npm run build                            │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│          RUNTIME (Server)                │
├──────────────────────────────────────────┤
│ Server .env file:                        │
│ DATABASE_URL=postgresql://...            │
│ JWT_SECRET=your-secret                   │
│ PORT=3001                                │
│                                          │
│ ↓ Used by Node.js at runtime             │
│ npm start                                │
└──────────────────────────────────────────┘
```

---

## Quick Command Reference

### Local Development:
```bash
npm run dev              # Start frontend (port 5173)
cd server && npm run dev # Start backend (port 3001)
```

### Build for Production:
```bash
npm run build            # Build frontend to dist/
```

### Deploy to VPS:
```bash
./deploy.sh user host    # Automated deployment
```

### Docker:
```bash
docker-compose up -d     # Start all services
docker-compose logs -f   # View logs
docker-compose down      # Stop all services
```

### PM2 (Process Manager):
```bash
pm2 start npm --name "api" -- run start
pm2 logs
pm2 restart api
pm2 stop api
```

### Database:
```bash
npx prisma migrate deploy   # Run migrations
npx prisma db seed          # Seed demo data
npx prisma studio           # Open database GUI
```

---

## Port Reference

| Service | Port | Access |
|---------|------|--------|
| Frontend (dev) | 5173 | localhost |
| Backend (dev) | 3001 | localhost |
| Backend (prod) | 3001 | localhost only |
| PostgreSQL | 5432 | localhost only |
| Nginx (HTTP) | 80 | Public |
| Nginx (HTTPS) | 443 | Public |

**Security Note:** Only Nginx ports (80/443) should be public. All other ports should be localhost-only.

---

## Timeline Estimate

| Step | Time |
|------|------|
| Build frontend | 30 seconds |
| Upload to server | 1-2 minutes |
| Install dependencies | 1-2 minutes |
| Setup database | 30 seconds |
| Configure Nginx | 5 minutes |
| Setup SSL | 2 minutes |
| **Total** | **~10 minutes** |

**Cloud platforms (Vercel/Railway): ~3 minutes total!**

---

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Setup database backups
3. ✅ Configure monitoring
4. ✅ Setup CI/CD (optional)
5. ✅ Add custom domain
6. ✅ Enable HTTPS
7. ✅ Configure email notifications (optional)

---

**Choose your path and deploy! 🚀**

For detailed instructions, see:
- QUICK-DEPLOY.md (platform-specific)
- DEPLOYMENT.md (comprehensive guide)
