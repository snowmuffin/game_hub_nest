#!/bin/bash

# 🌐 Game Hub NestJS - Nginx 설정 스크립트
# SSL/TLS 인증서 포함 완전한 웹서버 설정

set -e

echo "🌐 Starting Nginx setup for Game Hub..."
echo "========================================="

# .env 파일에서 DOMAIN 읽어오기
if [ -f ".env" ]; then
    source .env
    echo "✅ Loaded configuration from .env"
else
    echo "⚠️  .env file not found, using defaults"
fi

# 도메인 설정 확인 (명령행 인수 > .env > 기본값 순서)
DOMAIN=${1:-${DOMAIN:-api.snowmuffingame.com}}
echo "🔗 Domain: $DOMAIN"

# Nginx 설치
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

# 설정 파일 생성 (도메인 기반)
echo "📝 Creating Nginx configuration for $DOMAIN..."

cat > /tmp/game-hub-nest-nginx.conf << EOF
# Game Hub NestJS - Nginx Configuration

# HTTP Server (개발/테스트용 + HTTPS 리다이렉트)
server {
    listen 80;
    server_name $DOMAIN _;

    # IP로 직접 접근하는 경우 (개발/테스트용)
    location / {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers for development
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Cookie' always;
        
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Cookie';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # 헬스체크 엔드포인트
    location /health {
        proxy_pass http://127.0.0.1:4000/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # HTTPS로 리다이렉트 (도메인 접근시에만)
    if (\$host = $DOMAIN) {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

# 설정 파일 배포
echo "📝 Deploying Nginx configuration..."

# 배포판별 설정 파일 경로 처리
if [ -d "/etc/nginx/sites-available" ]; then
    # Ubuntu/Debian 방식 (sites-available/sites-enabled)
    echo "🔍 Using Ubuntu/Debian configuration structure"
    sudo mv /tmp/game-hub-nest-nginx.conf /etc/nginx/sites-available/game-hub-nest
    
    # 심볼릭 링크 생성
    sudo rm -f /etc/nginx/sites-enabled/game-hub-nest
    sudo ln -s /etc/nginx/sites-available/game-hub-nest /etc/nginx/sites-enabled/
    
    # 기본 사이트 비활성화
    sudo rm -f /etc/nginx/sites-enabled/default
else
    # RHEL/CentOS/Amazon Linux 방식 (conf.d)
    echo "🔍 Using RHEL/CentOS/Amazon Linux configuration structure"
    
    # conf.d 디렉토리에 직접 배치
    sudo mv /tmp/game-hub-nest-nginx.conf /etc/nginx/conf.d/game-hub-nest.conf
    
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
    exit 1
fi

# SSL 인증서 설정
echo ""
echo "🔒 Setting up SSL certificate with Let's Encrypt..."
read -p "Do you want to set up SSL certificate now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Certbot 설치
    if ! command -v certbot &> /dev/null; then
        echo "📦 Installing Certbot..."
        
        # 배포판별 certbot 설치
        if command -v dnf &> /dev/null; then
            # Amazon Linux 2023, RHEL, CentOS, Fedora
            sudo dnf install -y certbot python3-certbot-nginx
        elif command -v yum &> /dev/null; then
            # Amazon Linux 2, older RHEL/CentOS
            # EPEL 저장소 필요
            sudo yum install -y epel-release
            sudo yum install -y certbot python3-certbot-nginx
        elif command -v apt &> /dev/null; then
            # Ubuntu, Debian
            sudo apt install -y certbot python3-certbot-nginx
        elif command -v pacman &> /dev/null; then
            # Arch Linux
            sudo pacman -S --noconfirm certbot certbot-nginx
        else
            echo "❌ Unsupported package manager for certbot installation."
            echo "💡 Please install certbot manually for your distribution."
            exit 1
        fi
        
        echo "✅ Certbot installed"
    fi
    
    # SSL 인증서 획득
    echo "🔐 Obtaining SSL certificate for $DOMAIN..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@snowmuffingame.com
    
    # 자동 갱신 테스트
    echo "🔄 Testing certificate auto-renewal..."
    sudo certbot renew --dry-run
    
    echo "✅ SSL certificate setup completed"
else
    echo "⏭️ SSL setup skipped. You can run it later with:"
    echo "   # For Amazon Linux/RHEL/CentOS:"
    echo "   sudo dnf install certbot python3-certbot-nginx"
    echo "   # For Ubuntu/Debian:"
    echo "   sudo apt install certbot python3-certbot-nginx"
    echo "   # Then obtain certificate:"
    echo "   sudo certbot --nginx -d $DOMAIN"
fi

# 방화벽 설정
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 22
    echo "✅ Firewall configured"
fi

echo ""
echo "🎉 ==============================================="
echo "🎉 Nginx setup completed successfully!"
echo "🎉 ==============================================="
echo ""
echo "📊 Configuration Summary:"
echo "   • Domain: $DOMAIN"
echo "   • HTTP Port: 80 (redirects to HTTPS)"
echo "   • HTTPS Port: 443"
echo "   • Backend: http://127.0.0.1:4000"
echo ""
echo "🔗 URLs:"
echo "   • API: https://$DOMAIN/"
echo "   • Health: https://$DOMAIN/health"
echo ""
echo "🛠️ Management Commands:"
echo "   • Test config: sudo nginx -t"
echo "   • Reload: sudo systemctl reload nginx"
echo "   • Status: sudo systemctl status nginx"
echo "   • Logs: sudo tail -f /var/log/nginx/access.log"
echo ""
