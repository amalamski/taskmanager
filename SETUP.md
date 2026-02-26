# Quick Start Guide

Get TaskFlow up and running in 5 minutes!

## Option 1: Using Docker (Easiest)

### 1. Start PostgreSQL with Docker Compose

```bash
docker-compose up -d
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

### 3. Setup Database

```bash
cd server

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed

cd ..
```

### 4. Start Both Servers

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### 5. Open the App

Visit [http://localhost:5173](http://localhost:5173) and login with:
- **Email:** `demo@taskflow.com`
- **Password:** `password123`

---

## Option 2: Manual Setup

### 1. Install PostgreSQL

Download and install from [postgresql.org](https://www.postgresql.org/download/)

### 2. Create Database

```bash
createdb taskflow
```

### 3. Update Database URL

Edit `server/.env` and update `DATABASE_URL` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/taskflow?schema=public"
```

### 4. Continue from Step 2 in Option 1

Follow steps 2-5 from the Docker option above.

---

## Verification

### Check Backend

```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### Check Frontend

Open browser to `http://localhost:5173` - you should see the login page.

---

## Common Issues

### "Connection refused" to database
- Make sure PostgreSQL is running
- Check your DATABASE_URL in `server/.env`
- If using Docker, run `docker-compose up -d`

### Port already in use
- Change PORT in `server/.env` (e.g., to 3002)
- Change frontend port by creating `.env` with `PORT=5174`

### Prisma errors
```bash
cd server
npm run db:generate
npm run db:migrate
```

### Can't login
- Make sure you ran `npm run db:seed`
- Use credentials: `demo@taskflow.com` / `password123`
- Or create a new account via Sign Up

---

## Next Steps

1. ✅ Explore the Board view and create tasks
2. ✅ Try the Calendar view to see tasks by date
3. ✅ Use Freestyle area for notes
4. ✅ Check Statistics for insights
5. ✅ Try filtering tasks
6. ✅ Create a new user account

Happy task managing! 🚀
