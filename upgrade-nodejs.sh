#!/bin/bash

# Node.js 20.x 설치 스크립트

echo "🔄 Updating Node.js to version 20.x..."

# 현재 Node.js 버전 확인
echo "Current Node.js version:"
node --version

# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 새 버전 확인
echo "New Node.js version:"
node --version
npm --version

# PM2 재설치
sudo npm install -g pm2

echo "✅ Node.js 20.x installed successfully!"
