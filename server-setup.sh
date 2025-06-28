#!/bin/bash

# 서버 초기 설정 스크립트 (Ubuntu/Debian 기준)

set -e

echo "🔧 Setting up server for Game Hub NestJS Backend..."

# 시스템 업데이트
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Node.js 설치 (NodeSource repository 사용)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx 설치
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# 방화벽 설정
echo "🔥 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# PM2 전역 설치
echo "📦 Installing PM2 globally..."
sudo npm install -g pm2

# SSL 인증서용 Certbot 설치
echo "🔒 Installing Certbot for SSL..."
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# PostgreSQL 설치 (선택사항)
read -p "Do you want to install PostgreSQL? (y/n): " install_postgres
if [[ $install_postgres == "y" || $install_postgres == "Y" ]]; then
    echo "📦 Installing PostgreSQL..."
    sudo apt install postgresql postgresql-contrib -y
    
    echo "Setting up PostgreSQL user..."
    sudo -u postgres createuser --interactive
fi

# 애플리케이션 디렉토리 생성
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/game-hub-nest
sudo chown $USER:$USER /var/www/game-hub-nest

echo "✅ Server setup completed!"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /var/www/game-hub-nest"
echo "2. Create .env file with your configuration"
echo "3. Run ./deploy.sh to deploy the application"
echo "4. Configure Nginx with api.snowmuffingame.com domain (copy nginx.conf.example)"
echo "5. Get SSL certificate: sudo certbot --nginx -d api.snowmuffingame.com"
