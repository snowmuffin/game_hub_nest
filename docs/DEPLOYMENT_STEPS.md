# 🚀 AWS 실제 배포 단계별 가이드

## Step 1: EC2 인스턴스 접속
```bash
# EC2 인스턴스에 SSH 접속
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# 또는 기존에 설정된 방법으로 접속
```

## Step 2: 서버 환경 준비
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 버전 확인
node --version  # v20.x.x 확인
npm --version

# PM2 전역 설치
sudo npm install -g pm2

# Git 설치 (아직 없다면)
sudo apt install git -y
```

## Step 3: 프로젝트 배포
```bash
# 프로젝트 디렉토리 생성 및 이동
mkdir -p /home/ubuntu/game-hub-nest
cd /home/ubuntu/game-hub-nest

# Git 저장소에서 코드 가져오기 (방법 1: 직접 클론)
git clone https://github.com/your-username/game-hub-nest.git .

# 또는 (방법 2: 로컬에서 파일 전송)
# scp -i "your-key.pem" -r ./game_hub_nest/* ubuntu@your-ec2-ip:/home/ubuntu/game-hub-nest/
```

## Step 4: 환경 설정
```bash
# 프로덕션 환경변수 파일 생성
nano .env.production

# 아래 내용을 붙여넣고 필요시 수정:
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

DB_HOST=gamehub-spaceengineers.c9ecui4q2er7.ap-northeast-2.rds.amazonaws.com
DB_PORT=5432
DB_USER=Snowmuffin
DB_PASSWORD=Ov0CaSYp]wBEQ]8hj4rAKBfz5prB
DB_NAME=postgres
DB_SSL=true

STEAM_API_KEY=E0ACE700D306A5880F0C3F6B393A5346
JWT_SECRET=your-super-secure-production-jwt-secret-key-change-this-in-production

STEAM_RETURN_URL=https://se.snowmuffingame.com/api/auth/steam/return
STEAM_REALM=https://se.snowmuffingame.com/
STEAM_API_URL=https://api.steampowered.com

ALLOWED_ORIGINS=https://se.snowmuffingame.com,https://www.snowmuffingame.com
FRONTEND_URL=https://se.snowmuffingame.com

LOG_LEVEL=info
LOG_FILE=./logs/app.log
HEALTH_CHECK_KEY=health-check-secret-key
```

## Step 5: 배포 실행
```bash
# 배포 스크립트 실행 권한 부여
chmod +x deploy.sh

# NODE_ENV 환경변수 설정
export NODE_ENV=production

# 배포 실행
./deploy.sh
```

## Step 6: 배포 확인
```bash
# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs game-hub-nest

# Health check 테스트
curl http://localhost:4000/health

# 특정 API 테스트
curl http://localhost:4000/api/users
```

## Step 7: Nginx 설정 (리버스 프록시)
```bash
# Nginx 설치
sudo apt install nginx -y

# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/game-hub

# 아래 내용 입력:
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

# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/game-hub /etc/nginx/sites-enabled/

# 기본 설정 제거
sudo rm /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 8: SSL 인증서 설정 (Let's Encrypt)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d se.snowmuffingame.com

# 자동 갱신 설정
sudo systemctl enable certbot.timer
```

## Step 9: 방화벽 설정
```bash
# UFW 설정
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Step 10: 모니터링 설정
```bash
# PM2 모니터링
pm2 monit

# 시스템 부팅시 PM2 자동 시작
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# PM2 현재 상태 저장
pm2 save
```

## 🔍 문제 해결

### 일반적인 문제들:
1. **포트 4000 접근 불가**: AWS 보안 그룹에서 포트 4000 허용 확인
2. **데이터베이스 연결 실패**: RDS 보안 그룹에서 EC2 접근 허용 확인
3. **메모리 부족**: EC2 인스턴스 크기 증가 또는 PM2 인스턴스 수 감소
4. **빌드 실패**: Node.js 버전 확인 (20.x 필요)

### 로그 확인:
```bash
# PM2 로그
pm2 logs game-hub-nest

# Nginx 로그
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# 시스템 로그
sudo journalctl -u nginx
```

### 재배포:
```bash
# 코드 업데이트 후
git pull origin main
./deploy.sh
```

## ✅ 배포 완료 체크리스트

- [ ] EC2 인스턴스 접속 가능
- [ ] Node.js 20.x 설치 완료
- [ ] PM2 설치 완료
- [ ] 프로젝트 코드 배포 완료
- [ ] 환경변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] PM2로 애플리케이션 실행 중
- [ ] Health check 응답 정상
- [ ] Nginx 리버스 프록시 설정 완료
- [ ] SSL 인증서 설정 완료
- [ ] 도메인 접속 가능
- [ ] API 엔드포인트 정상 동작

이제 실제 배포를 진행해보세요! 각 단계별로 진행하시고 문제가 생기면 언제든 말씀해주세요.
