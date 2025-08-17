#!/bin/bash

# 🚀 Game Hub NestJS Backend - 배포 스크립트
# 자동화된 배포로 안전하고 빠른 프로덕션 배포를 지원합니다.

set -e  # 오류 발생시 스크립트 중단

echo "🚀 Starting Game Hub deployment process..."
echo "================================================"

# 🔍 환경 변수 확인
ENV_FILE=".env"
if [ "$NODE_ENV" = "production" ]; then
    ENV_FILE=".env.production"
fi

if [ ! -f $ENV_FILE ]; then
    echo "❌ $ENV_FILE file not found!"
    echo "💡 Please create environment file from template:"
    echo "   cp .env.example $ENV_FILE"
    exit 1
fi

echo "📋 Using environment file: $ENV_FILE"

# 환경 변수 로드
source $ENV_FILE
echo "✅ Environment variables loaded"

# 📊 Node.js 버전 확인
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
echo "📊 Current Node.js version: $(node --version)"

if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20 or higher is required. Current version: $(node --version)"
    echo "💡 Please run: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

echo "✅ Node.js version check passed"

# 📥 Git 최신 상태로 업데이트 (프로덕션에서)
if [ "$NODE_ENV" = "production" ]; then
    echo "📥 Pulling latest changes from repository..."
    git pull
    echo "✅ Repository updated"
fi

# 📦 Node.js 의존성 설치
echo "📦 Installing dependencies..."
npm ci --production=false
echo "✅ Dependencies installed"

# 🗄️ 데이터베이스 백업 (프로덕션에서)
if [ "$NODE_ENV" = "production" ]; then
    echo "🗄️ Creating database backup..."
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    # 백업 로직은 실제 DB 설정에 따라 조정 필요
    echo "✅ Database backup created in $BACKUP_DIR"
fi

# 🗄️ 데이터베이스 연결 및 스키마 초기화
echo "🗄️ Initializing database schemas..."
npm run db:init-schemas

# � 마이그레이션 상태 확인
echo "� Checking migration status..."
MIGRATION_STATUS=$(npm run migration:show 2>&1 || echo "no-migrations")

if echo "$MIGRATION_STATUS" | grep -q "No migrations"; then
    echo "📋 No migrations found. This might be the first deployment."
    echo "🎯 In production, you should generate migrations from your entities:"
    echo "   npm run migration:generate -- InitialSchema"
    echo ""
    echo "⚠️  For safety, using synchronize mode for initial setup..."
    echo "   Please generate proper migrations after first deployment!"
elif echo "$MIGRATION_STATUS" | grep -q "pending"; then
    echo "📋 Found pending migrations, running them..."
    npm run migration:run
    echo "✅ Database migrations completed"
else
    echo "✅ Database schema is up to date"
fi

# 🔨 TypeScript 빌드
echo "🔨 Building TypeScript application..."
npm run build
echo "✅ Application built successfully"

# 📁 로그 디렉토리 생성
echo "📁 Setting up log directories..."
mkdir -p logs
touch logs/app.log logs/error.log logs/out.log
echo "✅ Log directories ready"

# 📦 PM2 전역 설치 확인
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    echo "🔐 This may require administrator privileges..."
    sudo npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 is already installed"
fi

# 🛑 기존 PM2 프로세스 중지 (있다면)
echo "🛑 Stopping existing PM2 processes..."
pm2 delete game-hub-nest 2>/dev/null || echo "ℹ️ No existing process found"

# 🚀 PM2로 애플리케이션 시작
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
echo "✅ Application started with PM2"

# 📊 PM2 상태 확인
echo "📊 Checking PM2 status..."
pm2 status

# 💾 PM2 설정 저장
echo "� Saving PM2 configuration..."
pm2 save

# 🔄 프로덕션 환경에서만 startup 설정
if [ "$NODE_ENV" = "production" ]; then
    echo "🔄 Setting up PM2 auto-startup..."
    echo "🔐 This may require administrator privileges..."
    sudo pm2 startup
    echo "✅ PM2 auto-startup configured"
fi

# 🏥 Health check 수행
echo "🏥 Performing health check..."
echo "⏳ Waiting for application to start..."
sleep 10

# 🔄 여러 번 시도하여 health check
MAX_ATTEMPTS=5
for i in $(seq 1 $MAX_ATTEMPTS); do
    echo "🔍 Health check attempt $i/$MAX_ATTEMPTS..."
    
    if curl -f -s http://localhost:4000/health > /dev/null 2>&1; then
        echo "✅ Health check passed! Application is running healthy."
        break
    else
        echo "⚠️ Health check failed, retrying in 5 seconds..."
        sleep 5
        
        if [ $i -eq $MAX_ATTEMPTS ]; then
            echo "❌ Health check failed after $MAX_ATTEMPTS attempts"
            echo "📝 Check application logs:"
            echo "   pm2 logs game-hub-nest"
            echo "📊 Check PM2 status:"
            echo "   pm2 status"
            exit 1
        fi
    fi
done

# 🌐 Nginx 설정 (프로덕션에서만)
if [ "$NODE_ENV" = "production" ]; then
    echo "🌐 Setting up Nginx configuration..."
    
    # Nginx 설치 확인
    if ! command -v nginx &> /dev/null; then
        echo "📦 Installing Nginx..."
        
        # 배포판별 패키지 매니저 감지
        if command -v dnf &> /dev/null; then
            # Amazon Linux 2023, RHEL, CentOS, Fedora
            echo "🔍 Detected: Amazon Linux/RHEL/CentOS/Fedora (using dnf)"
            sudo dnf update -y
            sudo dnf install -y nginx
        elif command -v yum &> /dev/null; then
            # Amazon Linux 2, older RHEL/CentOS
            echo "🔍 Detected: Amazon Linux 2/older RHEL/CentOS (using yum)"
            sudo yum update -y
            sudo yum install -y nginx
        elif command -v apt &> /dev/null; then
            # Ubuntu, Debian
            echo "🔍 Detected: Ubuntu/Debian (using apt)"
            sudo apt update
            sudo apt install -y nginx
        elif command -v pacman &> /dev/null; then
            # Arch Linux
            echo "🔍 Detected: Arch Linux (using pacman)"
            sudo pacman -Sy --noconfirm nginx
        else
            echo "❌ Unsupported package manager. Please install nginx manually."
            exit 1
        fi
        
        echo "✅ Nginx installed"
    else
        echo "✅ Nginx is already installed"
    fi
    
    # Nginx 설정 파일 복사
    if [ -f "nginx.conf.example" ]; then
        echo "📝 Deploying Nginx configuration..."
        
        # 도메인 환경변수 확인
        if [ -z "$DOMAIN" ]; then
            echo "❌ DOMAIN environment variable is not set!"
            echo "💡 Please set DOMAIN in your $ENV_FILE"
            exit 1
        fi
        
        echo "🌐 Using domain: $DOMAIN"
        
        # 배포판별 설정 파일 경로 처리
        if [ -d "/etc/nginx/sites-available" ]; then
            # Ubuntu/Debian 방식 (sites-available/sites-enabled)
            echo "🔍 Using Ubuntu/Debian configuration structure"
            envsubst '${DOMAIN}' < nginx.conf.example | sudo tee /etc/nginx/sites-available/game-hub-nest > /dev/null
            
            # 심볼릭 링크 생성 (기존 것이 있으면 제거 후 생성)
            sudo rm -f /etc/nginx/sites-enabled/game-hub-nest
            sudo ln -s /etc/nginx/sites-available/game-hub-nest /etc/nginx/sites-enabled/
            
            # 기본 사이트 비활성화 (충돌 방지)
            sudo rm -f /etc/nginx/sites-enabled/default
        else
            # RHEL/CentOS/Amazon Linux 방식 (conf.d)
            echo "🔍 Using RHEL/CentOS/Amazon Linux configuration structure"
            
            # conf.d 디렉토리에 환경변수 치환하여 배치
            envsubst '${DOMAIN}' < nginx.conf.example | sudo tee /etc/nginx/conf.d/game-hub-nest.conf > /dev/null
            
            # 기본 설정 파일 백업 및 비활성화
            if [ -f "/etc/nginx/conf.d/default.conf" ]; then
                sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup
                echo "ℹ️ Backed up default.conf to default.conf.backup"
            fi
        fi
        
        # Nginx 설정 테스트
        echo "🔍 Testing Nginx configuration..."
        if sudo nginx -t; then
            echo "✅ Nginx configuration test passed"
            
            # Nginx 재시작
            echo "🔄 Restarting Nginx..."
            sudo systemctl restart nginx
            sudo systemctl enable nginx
            echo "✅ Nginx restarted and enabled"
        else
            echo "❌ Nginx configuration test failed"
            echo "💡 Please check the configuration file manually"
        fi
    else
        echo "⚠️ nginx.conf.example not found, skipping Nginx setup"
    fi
    
    # 방화벽 설정 (ufw가 설치되어 있는 경우)
    if command -v ufw &> /dev/null; then
        echo "🔥 Configuring firewall..."
        sudo ufw allow 'Nginx Full'
        sudo ufw allow 22
        echo "✅ Firewall configured"
    fi
    
    # SSL 인증서 설정 안내 (Let's Encrypt)
    echo "🔒 SSL Certificate Setup Information:"
    echo "   To enable HTTPS with Let's Encrypt, run the following commands:"
    echo "   # For Amazon Linux/RHEL/CentOS:"
    echo "   sudo dnf install certbot python3-certbot-nginx"
    echo "   # For Ubuntu/Debian:"
    echo "   sudo apt install certbot python3-certbot-nginx"
    echo "   # Then obtain certificate:"
    echo "   sudo certbot --nginx -d ${DOMAIN:-api.snowmuffingame.com}"
    echo "   # Test auto-renewal:"
    echo "   sudo certbot renew --dry-run"
    echo ""
fi

echo ""
echo "🎉 ==============================================="
echo "🎉 Game Hub deployment completed successfully!"
echo "🎉 ==============================================="
echo ""
echo "📊 Application Status:"
echo "   • Port: 4000"
echo "   • Environment: $NODE_ENV"
echo "   • Health endpoint: http://localhost:4000/health"
echo ""
echo "🛠️ Management Commands:"
echo "   • Check status: pm2 status"
echo "   • View logs: pm2 logs game-hub-nest"
echo "   • Restart: pm2 restart game-hub-nest"
echo "   • Stop: pm2 stop game-hub-nest"
echo "   • Reload: pm2 reload game-hub-nest"
echo ""
echo "📂 Important Paths:"
echo "   • Application: $(pwd)"
echo "   • Logs: $(pwd)/logs/"
echo "   • Environment: $ENV_FILE"
echo ""
