# 🚀 서버 Node.js 업그레이드 및 재배포 가이드

## Step 1: Node.js 20.x 업그레이드

서버에서 다음 명령어들을 순서대로 실행하세요:

```bash
# 현재 실행 중인 애플리케이션 중지
pm2 stop game-hub-nest

# Node.js 20.x 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js 20.x 설치
sudo apt-get install -y nodejs

# 버전 확인
node --version  # v20.x.x가 출력되어야 함
npm --version

# PM2 재설치 (글로벌)
sudo npm install -g pm2
```

## Step 2: 프로젝트 정리 및 재빌드

```bash
cd /home/ec2-user/game_hub_nest

# 기존 node_modules 및 lock 파일 제거
rm -rf node_modules package-lock.json

# 의존성 재설치
npm install

# TypeScript 빌드
npm run build
```

## Step 3: 환경변수 업데이트 (중요!)

현재 .env 파일에 누락된 중요한 환경변수들을 추가:

```bash
# NODE_ENV 추가 (가장 중요!)
echo "NODE_ENV=production" >> .env

# STEAM_API_URL 추가
echo "STEAM_API_URL=https://api.steampowered.com" >> .env

# 로깅 설정 추가
echo "LOG_LEVEL=info" >> .env
echo "LOG_FILE=./logs/app.log" >> .env

# Health Check 키 추가
echo "HEALTH_CHECK_KEY=production-health-secret-2024" >> .env

# JWT 시크릿 업데이트 (보안 강화)
sed -i 's/JWT_SECRET=your-secret-key/JWT_SECRET=GameHub-Production-JWT-Secret-2024-SuperSecure-Key/' .env

# 최종 .env 파일 확인
cat .env
```

## Step 4: 데이터베이스 마이그레이션

```bash
# 마이그레이션 실행
npm run migration:run
```

## Step 5: 애플리케이션 시작

```bash
# PM2로 시작
pm2 start ecosystem.config.js --env production

# 상태 확인
pm2 status
pm2 logs game-hub-nest

# Health check
curl http://localhost:4000/health

# 부팅시 자동 시작 설정
pm2 save
pm2 startup
```

## 🔍 문제 해결

### Node.js 업그레이드 실패시:
```bash
# 기존 Node.js 완전 제거 후 재설치
sudo apt-get remove -y nodejs npm
sudo apt-get autoremove -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 마이그레이션 실패시:
```bash
# 로그 확인
npm run migration:run 2>&1 | tee migration.log

# 특정 마이그레이션 롤백 (필요시)
npm run migration:revert
```

### PM2 문제시:
```bash
# PM2 완전 재시작
pm2 kill
pm2 start ecosystem.config.js --env production
```

## ✅ 성공 확인 체크리스트

- [ ] Node.js v20.x.x 설치 완료
- [ ] npm 10.x.x 설치 완료
- [ ] 프로젝트 빌드 성공
- [ ] 환경변수 업데이트 완료
- [ ] 데이터베이스 마이그레이션 성공
- [ ] PM2로 애플리케이션 실행 중
- [ ] Health check 응답 (200 OK)
- [ ] 로그에 에러 없음

## 🌐 최종 테스트

```bash
# API 테스트
curl http://localhost:4000/health
curl http://localhost:4000/api/users
curl http://localhost:4000/api/auth/test-token

# 외부에서 접근 테스트 (다른 터미널에서)
curl http://13.125.32.159:4000/health
```

모든 단계가 완료되면 애플리케이션이 Node.js 20에서 안정적으로 실행될 것입니다! 🚀
