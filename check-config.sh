#!/bin/bash

# 빠른 도메인 설정 확인 스크립트

echo "🔍 Checking domain configuration for api.snowmuffingame.com..."

echo ""
echo "📝 Environment Configuration:"
echo "PORT: $(grep PORT .env | cut -d'=' -f2)"
echo "DOMAIN: $(grep DOMAIN .env | cut -d'=' -f2)"
echo "BASE_URL: $(grep BASE_URL .env | cut -d'=' -f2)"
echo "Whitelist: $(grep Whitelist .env | cut -d'=' -f2)"

echo ""
echo "🌐 Access URLs:"
echo "📍 After full deployment (with SSL):"
echo "  - https://api.snowmuffingame.com/api"
echo "  - https://api.snowmuffingame.com/api/auth/steam"
echo "  - https://api.snowmuffingame.com/health"
echo ""
echo "🔧 During setup/development (IP access):"
echo "  - http://your-server-ip:4000/api (direct)"
echo "  - http://your-server-ip/api (with Nginx)"
echo ""
echo "💻 Local development:"
echo "  - http://localhost:4000/api"

echo ""
echo "📋 Deployment options:"
echo "1. Full production: ./deploy.sh (requires PM2, Nginx, SSL)"
echo "2. Quick start: ./start-dev.sh (simple Node.js server)"
echo "3. Development: npm run start:dev (with file watching)"
echo ""
echo "🔄 Migration steps:"
echo "1. Deploy with IP access first: allows immediate frontend connection"
echo "2. Set up domain DNS: A record for api.snowmuffingame.com"
echo "3. Configure SSL: sudo certbot --nginx -d api.snowmuffingame.com"
echo "4. Update frontend to use domain URLs"

echo ""
echo "🔧 Local development:"
echo "- npm run start:dev (runs on http://localhost:4000)"
echo "- Access API at: http://localhost:4000/api"
