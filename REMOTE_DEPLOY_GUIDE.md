# 🚀 원격 배포 가이드

## 개요
EC2 인스턴스에 자동으로 애플리케이션을 배포하는 스크립트입니다.

## 사전 준비

### 1. .env 파일 설정
`.env` 파일에 다음 환경변수를 추가하세요:

```bash
# EC2 배포 설정
EC2_KEY_PATH=~/Documents/AWS/snowmuffin.pem
EC2_HOST=ec2-13-125-32-159.ap-northeast-2.compute.amazonaws.com
EC2_USER=ec2-user
EC2_APP_PATH=/home/ec2-user/game_hub_nest
```

### 2. SSH 키 권한 설정
```bash
chmod 400 ~/Documents/AWS/snowmuffin.pem
```

### 3. EC2 서버 사전 설정
EC2 인스턴스에 필요한 소프트웨어가 설치되어 있어야 합니다:

```bash
# SSH로 EC2 접속
ssh -i "~/Documents/AWS/snowmuffin.pem" ec2-user@ec2-13-125-32-159.ap-northeast-2.compute.amazonaws.com

# Node.js 설치 (18.x 이상)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2

# PM2 자동 시작 설정
pm2 startup
# 출력된 명령어를 복사해서 실행하세요

# 애플리케이션 디렉토리 생성
mkdir -p /home/ec2-user/game_hub_nest
```

## 사용 방법

### 기본 배포
```bash
./remote-deploy.sh
```

### 배포 프로세스
스크립트는 다음 작업을 자동으로 수행합니다:

1. ✅ 환경 변수 검증
2. 🔨 로컬에서 애플리케이션 빌드
3. 📦 배포 패키지 준비
4. 🔗 SSH 연결 테스트
5. 📤 파일을 EC2로 전송 (rsync)
6. 📦 원격 서버에서 의존성 설치
7. 🔄 PM2로 애플리케이션 재시작

## 배포 후 확인

### 애플리케이션 상태 확인
```bash
ssh -i "~/Documents/AWS/snowmuffin.pem" ec2-user@ec2-13-125-32-159.ap-northeast-2.compute.amazonaws.com "pm2 status"
```

### 로그 확인
```bash
ssh -i "~/Documents/AWS/snowmuffin.pem" ec2-user@ec2-13-125-32-159.ap-northeast-2.compute.amazonaws.com "pm2 logs game-hub"
```

### 애플리케이션 재시작
```bash
ssh -i "~/Documents/AWS/snowmuffin.pem" ec2-user@ec2-13-125-32-159.ap-northeast-2.compute.amazonaws.com "pm2 restart game-hub"
```

## 주의사항

### 보안
- ⚠️ `.env` 파일은 절대 Git에 커밋하지 마세요
- ⚠️ SSH 키 파일 권한은 400으로 설정하세요
- ⚠️ EC2 보안 그룹에서 필요한 포트만 열어두세요

### 환경 변수
- 프로덕션 배포시 `.env.production` 파일이 있으면 자동으로 사용됩니다
- DB, Steam API Key 등 모든 필수 환경변수가 설정되어 있는지 확인하세요

### PM2 설정
`ecosystem.config.js` 파일이 있으면 PM2 설정을 활용합니다:
```javascript
module.exports = {
  apps: [{
    name: 'game-hub',
    script: './dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

## 트러블슈팅

### SSH 연결 실패
```bash
# 키 파일 권한 확인
ls -la ~/Documents/AWS/snowmuffin.pem

# 권한이 너무 열려있으면:
chmod 400 ~/Documents/AWS/snowmuffin.pem
```

### 포트 접근 불가
EC2 보안 그룹에서 인바운드 규칙을 확인하세요:
- HTTP: 80
- HTTPS: 443
- 애플리케이션 포트: 4000 (또는 설정한 포트)

### PM2 없음
```bash
# EC2에 SSH 접속 후
sudo npm install -g pm2
pm2 startup
```

## 롤백

문제 발생시 이전 버전으로 롤백:
```bash
ssh -i "~/Documents/AWS/snowmuffin.pem" ec2-user@ec2-13-125-32-159.ap-northeast-2.compute.amazonaws.com

# 이전 배포로 롤백 (backup이 있는 경우)
cd /home/ec2-user/game_hub_nest
pm2 stop game-hub
# 이전 버전 복구...
pm2 restart game-hub
```

## 고급 옵션

### 특정 브랜치 배포
```bash
# 원하는 브랜치로 체크아웃 후
git checkout production
./remote-deploy.sh
```

### 환경별 배포
```bash
# .env.staging 사용
cp .env.staging .env
./remote-deploy.sh
```

## 문의
문제가 발생하면 로그를 확인하고 관리자에게 문의하세요.
