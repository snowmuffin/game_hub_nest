# 도메인을 통한 백엔드 배포 가이드

이 가이드는 NestJS 백엔드 애플리케이션을 도메인을 통해 접근할 수 있도록 배포하는 방법을 설명합니다.

## 1. 환경 설정

### 1.1 환경변수 파일 생성
`.env` 파일을 생성하고 다음과 같이 설정하세요:

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일에서 다음 값들을 실제 값으로 변경하세요:
- `DOMAIN`: 실제 도메인 (예: `api.yourdomain.com`)
- `BASE_URL`: 완전한 URL (예: `https://api.yourdomain.com`)
- `Whitelist`: 허용할 프론트엔드 도메인들

# 도메인을 통한 백엔드 배포 가이드

이 가이드는 NestJS 백엔드 애플리케이션을 PM2와 Nginx를 사용하여 도메인을 통해 접근할 수 있도록 배포하는 방법을 설명합니다.

## 1. 서버 준비

### 1.1 서버 초기 설정
```bash
# 서버 설정 스크립트 실행 (Ubuntu/Debian)
./server-setup.sh
```

### 1.2 수동 설치 (다른 OS의 경우)
```bash
# Node.js 20.x 설치
# Nginx 설치
# PM2 설치: npm install -g pm2
# Certbot 설치 (SSL용)
```

## 2. 애플리케이션 배포

### 2.1 소스코드 배포
```bash
# 서버에서 실행
cd /var/www
git clone https://github.com/your-username/game_hub_nest.git
cd game_hub_nest
```

### 2.2 환경 설정
```bash
# 환경변수 파일 생성
cp .env.example .env
nano .env  # 실제 값으로 수정
```

### 2.3 자동 배포
```bash
# 배포 스크립트 실행
./deploy.sh
```

## 3. Nginx 설정

### 3.1 Nginx 설정 파일 복사
```bash
# Nginx 설정 파일 생성
sudo cp nginx.conf.example /etc/nginx/sites-available/game-hub-nest
sudo ln -s /etc/nginx/sites-available/game-hub-nest /etc/nginx/sites-enabled/

# 기본 사이트 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 3.2 도메인 설정
`/etc/nginx/sites-available/game-hub-nest` 파일에서:
- `api.snowmuffingame.com`이 올바르게 설정되어 있는지 확인
- `https://snowmuffingame.com`이 프론트엔드 도메인으로 설정되어 있는지 확인

## 4. SSL 인증서 설정

### 4.1 Let's Encrypt 인증서 발급
```bash
# 인증서 발급 및 자동 Nginx 설정
sudo certbot --nginx -d api.snowmuffingame.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

## 5. 도메인 및 DNS 설정

### 5.1 DNS 설정
- A 레코드: `api.snowmuffingame.com` → 서버 IP
- CNAME 레코드 (선택사항): `*.snowmuffingame.com` → `snowmuffingame.com`

## 6. PM2 관리 명령어

### 6.1 기본 명령어
```bash
# 애플리케이션 시작
pm2 start ecosystem.config.js --env production

# 상태 확인
pm2 status

# 로그 확인
pm2 logs game-hub-nest

# 애플리케이션 재시작
pm2 restart game-hub-nest

# 애플리케이션 중지
pm2 stop game-hub-nest

# 애플리케이션 제거
pm2 delete game-hub-nest

# PM2 설정 저장
pm2 save

# 서버 재부팅시 자동 시작 설정
pm2 startup
```

### 6.2 모니터링
```bash
# 실시간 모니터링
pm2 monit

# 메모리 사용량 확인
pm2 list
```

## 7. 업데이트 및 재배포

### 7.1 코드 업데이트
```bash
# Git pull
git pull origin main

# 재배포
./deploy.sh
```

### 7.2 무중단 배포
```bash
# 클러스터 모드에서 순차적 재시작
pm2 reload game-hub-nest
```

## 8. 보안 설정

### 8.1 방화벽 설정
```bash
# UFW 상태 확인
sudo ufw status

# 필요한 포트만 열기
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
```

### 8.2 추가 보안 설정
- SSH 키 인증 설정
- root 로그인 비활성화
- 정기적인 시스템 업데이트
- 로그 모니터링 설정

## 9. 백업 설정

### 9.1 데이터베이스 백업
```bash
# PostgreSQL 백업 스크립트 예시
pg_dump -h localhost -U username dbname > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 9.2 애플리케이션 백업
```bash
# 소스코드 및 설정 파일 백업
tar -czf game-hub-nest-backup-$(date +%Y%m%d).tar.gz /var/www/game-hub-nest
```

## 10. 모니터링 및 로깅

### 10.1 로그 위치
- 애플리케이션 로그: `./logs/`
- Nginx 로그: `/var/log/nginx/`
- PM2 로그: `~/.pm2/logs/`

### 10.2 로그 로테이션
```bash
# PM2 로그 로테이션 설치
pm2 install pm2-logrotate

# 설정
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 11. 트러블슈팅

### 11.1 일반적인 문제들
- **502 Bad Gateway**: PM2 프로세스 상태 확인
- **SSL 인증서 오류**: Certbot 갱신 확인
- **CORS 에러**: 환경변수 및 Nginx 설정 확인
- **메모리 부족**: PM2 메모리 제한 조정

### 11.2 로그 확인 명령어
```bash
# 애플리케이션 로그
pm2 logs game-hub-nest --lines 100

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# 시스템 로그
sudo journalctl -u nginx -f
```

## 12. 성능 최적화

### 12.1 PM2 클러스터 모드
```javascript
// ecosystem.config.js에서
instances: 'max',  // CPU 코어 수만큼 인스턴스 생성
```

### 12.2 Nginx 캐싱 (선택사항)
```nginx
# Nginx 설정에 추가
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=10g inactive=60m;
```

## 3. 도메인 설정

### 3.1 DNS 설정
- A 레코드: `yourdomain.com` → 서버 IP
- CNAME 레코드: `api.yourdomain.com` → `yourdomain.com`

### 3.2 SSL 인증서
- Let's Encrypt 사용 (무료)
- Cloudflare 사용
- 유료 SSL 인증서 구매

## 4. 보안 설정

### 4.1 CORS 설정
- 프론트엔드 도메인만 허용
- 개발환경과 프로덕션 환경 분리

### 4.2 방화벽 설정
- 필요한 포트만 열기 (80, 443, 22)
- 애플리케이션 포트는 내부에서만 접근

## 5. 모니터링

### 5.1 로그 관리
```bash
# PM2 로그 확인
pm2 logs

# Docker 로그 확인
docker-compose logs -f
```

### 5.2 헬스체크
- `/api/health` 엔드포인트 추가 권장
- 모니터링 도구 연동 (예: DataDog, New Relic)

## 6. 접근 방법

### 6.1 도메인 접근 (프로덕션)
배포 후 다음과 같은 URL로 접근 가능합니다:

- API Base: `https://api.snowmuffingame.com/api`
- Steam Auth: `https://api.snowmuffingame.com/api/auth/steam`
- Users: `https://api.snowmuffingame.com/api/users`
- Items: `https://api.snowmuffingame.com/api/space-engineers/item`
- Health Check: `https://api.snowmuffingame.com/health`

### 6.2 IP 직접 접근 (개발/테스트)
SSL 설정 전이나 프론트엔드 업데이트 전까지 IP로 직접 접근 가능:

- API Base: `http://your-server-ip/api` (Nginx 사용시)
- 또는: `http://your-server-ip:4000/api` (직접 접근)
- Health Check: `http://your-server-ip/health`

### 6.3 로컬 개발
- API Base: `http://localhost:4000/api`
- 시작 명령어: `./start-dev.sh` 또는 `npm run start:dev`

## 7. 트러블슈팅

### 7.1 CORS 에러
- `Whitelist` 환경변수 확인
- 프론트엔드 도메인이 올바르게 설정되어 있는지 확인

### 7.2 502 Bad Gateway
- 백엔드 애플리케이션이 실행 중인지 확인
- Nginx proxy_pass 설정 확인

### 7.3 SSL 인증서 에러
- 인증서 만료일 확인
- 인증서 경로 확인
