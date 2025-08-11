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
    sudo apt update
    sudo apt install -y nginx
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
    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
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
        proxy_pass http://127.0.0.1:4000/api/health;
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
sudo mv /tmp/game-hub-nest-nginx.conf /etc/nginx/sites-available/game-hub-nest

# 심볼릭 링크 생성
sudo rm -f /etc/nginx/sites-enabled/game-hub-nest
sudo ln -s /etc/nginx/sites-available/game-hub-nest /etc/nginx/sites-enabled/

# 기본 사이트 비활성화
sudo rm -f /etc/nginx/sites-enabled/default

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
        sudo apt install -y certbot python3-certbot-nginx
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
    echo "   sudo apt install certbot python3-certbot-nginx"
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
echo "   • API: https://$DOMAIN/api/"
echo "   • Health: https://$DOMAIN/health"
echo ""
echo "🛠️ Management Commands:"
echo "   • Test config: sudo nginx -t"
echo "   • Reload: sudo systemctl reload nginx"
echo "   • Status: sudo systemctl status nginx"
echo "   • Logs: sudo tail -f /var/log/nginx/access.log"
echo ""
