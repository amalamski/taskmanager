# 🚀 TaskFlow - Super Quick Start

## Deploy in 3 Steps

### Step 1: Build Frontend
```bash
npm run build
```

### Step 2: Choose Deployment Method

**A) Upload to VPS (Recommended)**
```bash
./deploy.sh your-username your-server.com
```

**B) Use Docker**
```bash
docker-compose up -d --build
docker-compose exec backend npx prisma migrate deploy
```

**C) Cloud (Easiest)**
- Frontend → Vercel: `vercel --prod`
- Backend → Railway: Connect GitHub repo

### Step 3: Done! ✅

---

## 📁 What Gets Deployed

```
Frontend (dist/)
├── index.html
├── assets/
└── [All static files]

Backend (server/)
├── src/          → API code
├── prisma/       → Database schema
├── package.json  → Dependencies
└── .env          → Configuration
```

---

## 🔑 Required Environment Variables

### Backend (.env):
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET="your-secret-key-min-32-chars"
PORT=3001
NODE_ENV=production
```

### Frontend (.env):
```env
VITE_API_URL=https://your-backend.com/api
```

---

## 📖 Full Documentation

- **QUICK-DEPLOY.md** - Platform-specific guides
- **DEPLOYMENT.md** - Detailed deployment instructions
- **server/API.md** - API documentation
- **README.md** - Complete project documentation

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to API | Check VITE_API_URL |
| Database error | Run `npx prisma migrate deploy` |
| 404 on refresh | Configure web server redirect |
| Login fails | Check JWT_SECRET matches |

---

## 📞 Support

1. Check logs: `pm2 logs` or `docker-compose logs`
2. Review DEPLOYMENT.md for detailed help
3. Verify environment variables

---

**Built with ❤️ using React, Node.js, PostgreSQL, and Prisma**
