# 🚀 AWS EC2 배포 가이드

## 📋 배포 환경

**타겟**: AWS EC2 + RDS (이미 설정됨)
**방법**: PM2 + Node.js
**도메인**: se.snowmuffingame.com

## 1️⃣ EC2 인스턴스 준비

### 권장 인스턴스 스펙
```
인스턴스 타입: t3.small 또는 t3.medium
OS: Ubuntu 22.04 LTS
RAM: 2GB 이상
스토리지: 20GB 이상
```

### 보안 그룹 설정
```
Port 22 (SSH): 관리자 IP만
Port 80 (HTTP): 0.0.0.0/0
Port 443 (HTTPS): 0.0.0.0/0  
Port 4000 (NestJS): Load Balancer/Nginx에서만
```

## 2️⃣ 서버 환경 설정

### Node.js 설치
```bash
# EC2 접속 후
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 버전 확인
node --version  # v20.x.x 확인
npm --version
```

### PM2 전역 설치
```bash
sudo npm install -g pm2
```

### Git 설치 및 프로젝트 클론
```bash
sudo apt update
sudo apt install git -y

# 프로젝트 클론
git clone <your-repo-url> /home/ubuntu/game-hub-nest
cd /home/ubuntu/game-hub-nest
```

## 3️⃣ 환경 설정

### 환경변수 파일 생성
```bash
# 프로덕션용 .env 파일 생성
cp .env.example .env.production

# 환경변수 편집
nano .env.production
```

### 프로덕션 환경변수 예시
```properties
# Server
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database (기존 RDS 사용)
DB_HOST=gamehub-spaceengineers.c9ecui4q2er7.ap-northeast-2.rds.amazonaws.com
DB_PORT=5432
DB_USER=Snowmuffin
DB_PASSWORD=Ov0CaSYp]wBEQ]8hj4rAKBfz5prB
DB_NAME=postgres
DB_SSL=true

# Auth
STEAM_API_KEY=E0ACE700D306A5880F0C3F6B393A5346
JWT_SECRET=your-super-secure-production-secret

# Domain
RETURN_URL=https://se.snowmuffingame.com/api/auth/steam/return
REALM=https://se.snowmuffingame.com/
Whitelist=https://se.snowmuffingame.com
```

## 4️⃣ 애플리케이션 배포

### 의존성 설치 및 빌드
```bash
cd /home/ubuntu/game-hub-nest

# 프로덕션 의존성 설치
npm ci --production=false

# 애플리케이션 빌드
npm run build
```

### 데이터베이스 마이그레이션
```bash
# 새로운 스키마 구조 적용
npm run migration:run
```

### PM2로 애플리케이션 시작
```bash
# PM2로 시작
pm2 start ecosystem.config.js --env production

# 상태 확인
pm2 status
pm2 logs game-hub-nest

# 부팅시 자동 시작 설정
pm2 startup
pm2 save
```

## 5️⃣ Nginx 설정 (선택사항)

### Nginx 설치
```bash
sudo apt install nginx -y
```

### Nginx 설정 파일
```bash
sudo nano /etc/nginx/sites-available/game-hub
```

```nginx
server {
    listen 80;
    server_name se.snowmuffingame.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Nginx 활성화
```bash
sudo ln -s /etc/nginx/sites-available/game-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6️⃣ SSL 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d se.snowmuffingame.com

# 자동 갱신 설정
sudo systemctl enable certbot.timer
```

## 7️⃣ 모니터링 설정

### PM2 모니터링
```bash
# PM2 대시보드
pm2 monit

# 로그 확인
pm2 logs game-hub-nest --lines 100
```

### CloudWatch 연동 (선택사항)
```bash
# CloudWatch 에이전트 설치
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

## 8️⃣ 배포 자동화 스크립트

### 업데이트 스크립트
```bash
#!/bin/bash
# update-app.sh

cd /home/ubuntu/game-hub-nest

echo "🔄 Updating application..."

# Git pull
git pull origin main

# Install dependencies
npm ci --production=false

# Build
npm run build

# Restart PM2
pm2 restart game-hub-nest

echo "✅ Update completed!"
```

## 🔍 배포 후 확인사항

1. **애플리케이션 상태**
   ```bash
   pm2 status
   curl http://localhost:4000/health  # health check
   ```

2. **로그 확인**
   ```bash
   pm2 logs game-hub-nest
   tail -f logs/app.log
   ```

3. **데이터베이스 연결**
   ```bash
   # API 테스트
   curl https://se.snowmuffingame.com/api/games
   ```

4. **메모리 사용량**
   ```bash
   pm2 monit
   htop
   ```

## 🚨 트러블슈팅

### 일반적인 문제들

1. **포트 충돌**
   ```bash
   sudo lsof -i :4000
   sudo kill -9 <PID>
   ```

2. **메모리 부족**
   ```bash
   # 스왑 파일 생성
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

3. **PM2 프로세스 문제**
   ```bash
   pm2 delete all
   pm2 start ecosystem.config.js --env production
   ```

4. **데이터베이스 연결 실패**
   - 보안 그룹에서 5432 포트 허용 확인
   - RDS 엔드포인트 및 자격증명 확인

## 📊 배포 체크리스트

- [ ] EC2 인스턴스 생성 및 설정
- [ ] Node.js 20.x 설치
- [ ] PM2 전역 설치  
- [ ] 프로젝트 클론
- [ ] 환경변수 설정
- [ ] 의존성 설치 및 빌드
- [ ] 데이터베이스 마이그레이션
- [ ] PM2로 애플리케이션 시작
- [ ] Nginx 설정 (선택사항)
- [ ] SSL 인증서 설정
- [ ] 도메인 DNS 설정
- [ ] API 엔드포인트 테스트
- [ ] 로그 및 모니터링 확인
