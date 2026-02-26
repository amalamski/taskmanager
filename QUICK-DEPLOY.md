# 🚀 Quick Deploy - Choose Your Platform

Pick ONE option below and follow the simple steps.

---

## 🟢 Option A: Deploy to VPS (DigitalOcean, Linode, Vultr, etc.)

### One-Command Deploy:

```bash
# 1. Clone your code to the server
git clone <your-repo> && cd <your-repo>

# 2. Run the deployment script
chmod +x deploy.sh
./deploy.sh

# 3. Follow the prompts to upload to your server
```

### Manual Steps (if you prefer):

```bash
# On your LOCAL machine:
npm run build

# Upload files via SCP:
scp -r dist/* user@your-server:/var/www/html/
scp -r server/ user@your-server:/var/www/server/

# On your SERVER via SSH:
cd /var/www/server
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed

# Start backend with PM2:
npm install -g pm2
pm2 start npm --name "taskflow" -- run start
pm2 save
pm2 startup

# Setup Nginx (install if needed):
apt update && apt install nginx -y
# Configure Nginx (see DEPLOYMENT.md for config)

# Setup SSL:
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

**✅ Done!** Visit https://yourdomain.com

---

## 🔵 Option B: Deploy with Docker (Any Server)

### Prerequisites:
- Docker installed
- Docker Compose installed

### Steps:

```bash
# 1. Clone your repository
git clone <your-repo> && cd <your-repo>

# 2. Update docker-compose.yml with your passwords

# 3. Start everything
docker-compose up -d --build

# 4. Setup database
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# 5. Check logs
docker-compose logs -f
```

**✅ Done!** Visit http://your-server-ip

### To add a domain:

```bash
# Install Nginx
apt update && apt install nginx -y

# Configure Nginx as reverse proxy to port 80
# See DEPLOYMENT.md for Nginx config

# Setup SSL
certbot --nginx -d yourdomain.com
```

---

## 🟣 Option C: Deploy to Cloud (Railway + Vercel)

### Frontend on Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**In Vercel Dashboard:**
- Add environment variable: `VITE_API_URL` = `https://your-backend.railway.app/api`

### Backend on Railway:

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set Root Directory: `server`
5. Add variables:
   - `DATABASE_URL` (Railway auto-provides this with PostgreSQL addon)
   - `JWT_SECRET` = (generate random string)
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-app.vercel.app`
6. Deploy!

**✅ Done!** You'll get URLs for both frontend and backend.

---

## 🟠 Option D: Deploy to Render.com

### Backend:

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** taskflow-api
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm run start`
   - **Environment Variables:**
     - `DATABASE_URL` (add PostgreSQL database first)
     - `JWT_SECRET`
     - `NODE_ENV` = `production`
     - `FRONTEND_URL` = (will add after frontend deploy)

### Frontend:

1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_URL` = `https://taskflow-api.onrender.com/api`

**✅ Done!** Render provides free HTTPS automatically.

---

## 🟡 Option E: Deploy to Heroku

### Backend:

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create taskflow-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET="your-secret-key"
heroku config:set NODE_ENV="production"

# Deploy
cd server
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
heroku run npx prisma db seed
```

### Frontend:

```bash
# Create another Heroku app for frontend
cd ..
heroku create taskflow-frontend

# Set buildpack for static sites
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static

# Create static.json
echo '{"root": "dist"}' > static.json

# Deploy
git add static.json
git commit -m "Add static.json"
git push heroku main
```

**Note:** Heroku's free tier is discontinued. You'll need a paid plan.

---

## ⚪ Option F: Deploy to Netlify (Frontend) + Any Backend

### Frontend on Netlify:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**In Netlify Dashboard:**
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL` = your backend URL

### Backend:
Deploy backend separately on Railway, Render, or any VPS.

**✅ Done!**

---

## 📊 Comparison Table

| Platform | Frontend | Backend | Database | Cost | Difficulty |
|----------|----------|---------|----------|------|------------|
| VPS | ✅ | ✅ | ✅ | $5-10/mo | Medium |
| Docker | ✅ | ✅ | ✅ | Server cost | Medium |
| Railway + Vercel | ✅ | ✅ | ✅ | Free-$20/mo | Easy |
| Render | ✅ | ✅ | ✅ | Free-$15/mo | Easy |
| Heroku | ✅ | ✅ | ✅ | $7+/mo | Easy |
| Netlify + Any | ✅ | ❌ | ❌ | Free+ | Easy |

---

## 🎯 Recommended for Beginners

**Option C (Railway + Vercel)** - Easiest setup, generous free tier

## 🏆 Recommended for Production

**Option A (VPS)** or **Option B (Docker)** - Full control, best performance

---

## 🔧 Post-Deployment Checklist

After deploying, verify:

- [ ] Website loads without errors
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Can create/edit/delete tasks
- [ ] Calendar view works
- [ ] Statistics page loads
- [ ] Logout works
- [ ] HTTPS is enabled (SSL certificate)
- [ ] Database backups are configured

---

## 🆘 Troubleshooting

### Frontend shows "Network Error"
- Check that `VITE_API_URL` points to correct backend URL
- Verify CORS is configured in backend
- Check browser console for errors

### Backend won't start
- Check logs: `pm2 logs` or `docker-compose logs backend`
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

### Database connection failed
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure firewall allows database connections

### 404 on page refresh
- Configure web server to redirect all routes to index.html
- See Nginx config in DEPLOYMENT.md

---

## 📞 Need Help?

1. Check the full DEPLOYMENT.md for detailed instructions
2. Review logs for error messages
3. Verify all environment variables are set correctly
4. Ensure database migrations have run successfully

---

**Happy Deploying! 🚀**
