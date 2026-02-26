#!/bin/bash

# ============================================
# TaskFlow - Simple Deployment Script
# ============================================
# Usage: ./deploy.sh [server-user] [server-host] [server-path]
# Example: ./deploy.sh user yourdomain.com /var/www/taskflow
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
SERVER_USER="${1:-}"
SERVER_HOST="${2:-}"
SERVER_PATH="${3:-/var/www/taskflow}"

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   TaskFlow Deployment Script          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if server details are provided
if [ -z "$SERVER_USER" ] || [ -z "$SERVER_HOST" ]; then
    echo -e "${YELLOW}📦 Step 1: Building frontend...${NC}"
    
    # Build frontend
    npm run build
    
    echo -e "${GREEN}✅ Frontend built successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📁 Files ready in: ${GREEN}dist/${NC}"
    echo ""
    echo "To deploy to a server, run:"
    echo "  ./deploy.sh your-user your-server.com /var/www/taskflow"
    echo ""
    echo "Or manually upload the dist/ folder via FTP/SFTP"
    exit 0
fi

echo -e "${YELLOW}📦 Step 1: Building frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend built!${NC}"
echo ""

echo -e "${YELLOW}📦 Step 2: Preparing server files...${NC}"

# Create a temporary deployment package
DEPLOY_DIR="/tmp/taskflow-deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy frontend
cp -r dist "$DEPLOY_DIR/frontend"

# Copy server files (excluding node_modules and unnecessary files)
mkdir -p "$DEPLOY_DIR/server"
cp -r server/package*.json "$DEPLOY_DIR/server/"
cp -r server/prisma "$DEPLOY_DIR/server/"
cp -r server/src "$DEPLOY_DIR/server/"
cp -r server/tsconfig.json "$DEPLOY_DIR/server/"
if [ -f server/.env.example ]; then
    cp server/.env.example "$DEPLOY_DIR/server/.env"
fi

echo -e "${GREEN}✅ Files prepared!${NC}"
echo ""

echo -e "${YELLOW}📦 Step 3: Uploading to server...${NC}"
echo "Uploading to: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}"
echo ""

# Create remote directory
ssh "${SERVER_USER}@${SERVER_HOST}" "mkdir -p ${SERVER_PATH}"

# Upload files
scp -r "$DEPLOY_DIR/frontend/"* "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/frontend/"
scp -r "$DEPLOY_DIR/server/"* "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/server/"

echo -e "${GREEN}✅ Files uploaded!${NC}"
echo ""

echo -e "${YELLOW}🔧 Step 4: Setting up backend on server...${NC}"
ssh "${SERVER_USER}@${SERVER_HOST}" << EOF
    cd ${SERVER_PATH}/server
    
    echo "Installing dependencies..."
    npm install
    
    echo "Generating Prisma client..."
    npx prisma generate
    
    echo "Running database migrations..."
    npx prisma migrate deploy
    
    echo "Seeding database (optional)..."
    npx prisma db seed || true
    
    echo "Setting up PM2..."
    pm2 delete taskflow-api || true
    pm2 start npm --name "taskflow-api" -- run start
    pm2 save
    
    echo "✅ Backend setup complete!"
EOF

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Complete! 🎉             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "1. Configure your web server (Nginx/Apache)"
echo "2. Setup SSL certificate"
echo "3. Update environment variables on the server"
echo ""
echo "Server paths:"
echo "  Frontend: ${SERVER_PATH}/frontend/"
echo "  Backend:  ${SERVER_PATH}/server/"
echo ""
echo "Check logs with: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs taskflow-api'"
echo ""

# Cleanup
rm -rf "$DEPLOY_DIR"
