# Game Hub NestJS Backend - 프로젝트 구조 가이드

## 📁 디렉토리 구조

```
game_hub_nest/
├── 📝 환경 설정 및 문서
│   ├── .env.example                    # 환경변수 템플릿
│   ├── package.json                    # 프로젝트 의존성 및 스크립트
│   ├── tsconfig.json                   # TypeScript 설정
│   ├── nest-cli.json                   # NestJS CLI 설정
│   ├── ecosystem.config.js             # PM2 배포 설정
│   ├── docker-compose.yml              # Docker 개발환경
│   ├── Dockerfile                      # Docker 이미지 빌드
│   ├── nginx.conf.example              # Nginx 설정 템플릿
│   └── .gitignore                      # Git 제외 파일 목록
│
├── 🚀 배포 및 운영
│   ├── deploy.sh                       # 자동 배포 스크립트
│   ├── start-dev.sh                    # 개발환경 시작 스크립트
│   ├── cleanup.sh                      # 프로젝트 정리 스크립트
│   ├── server-setup.sh                 # 서버 초기 설정
│   ├── DEPLOYMENT.md                   # 배포 가이드
│   ├── AWS_DEPLOYMENT_GUIDE.md         # AWS 배포 가이드
│   └── logs/                           # 애플리케이션 로그
│
├── 🗄️ 데이터베이스 관리
│   ├── src/data-source.ts              # TypeORM 데이터소스 설정
│   ├── src/migrations/                 # 데이터베이스 마이그레이션
│   ├── SCHEMA_DESIGN.md                # 스키마 설계 문서
│   ├── MIGRATION_SAFETY_GUIDE.md       # 안전한 마이그레이션 가이드
│   └── WALLET_SYSTEM.md                # 지갑 시스템 설계 문서
│
├── 📚 프로젝트 문서
│   ├── README.md                       # 프로젝트 메인 문서
│   ├── PROJECT_STRUCTURE.md            # 프로젝트 구조 가이드
│   └── PROJECT_CLEANUP_REPORT.md       # 정리 작업 보고서
│
├── 🎯 핵심 애플리케이션
│   ├── src/
│   │   ├── main.ts                     # 애플리케이션 진입점
│   │   ├── app.module.ts               # 루트 모듈
│   │   ├── app.controller.ts           # 기본 컨트롤러
│   │   └── app.service.ts              # 기본 서비스
│   │
│   ├── 🔐 인증 시스템
│   │   └── src/auth/
│   │       ├── auth.module.ts          # 인증 모듈
│   │       ├── auth.controller.ts      # 인증 컨트롤러
│   │       ├── auth.service.ts         # 인증 서비스
│   │       ├── jwt-auth.guard.ts       # JWT 가드
│   │       └── steam.strategy.ts       # Steam OAuth 전략
│   │
│   ├── 👤 사용자 관리
│   │   └── src/user/                   # 사용자 모듈
│   │
│   ├── 💰 지갑 시스템
│   │   └── src/wallet/
│   │       └── src/entities/
│   │           ├── wallet.entity.ts
│   │           ├── currency.entity.ts
│   │           └── wallet-transaction.entity.ts
│   │
│   ├── 🎮 게임 공통
│   │   ├── src/game/                   # 게임 관리 모듈
│   │   └── src/entities/
│   │       ├── game.entity.ts
│   │       └── game-server.entity.ts
│   │
│   ├── 🚀 Space Engineers
│   │   └── src/Space_Engineers/
│   │       ├── space-engineers.module.ts
│   │       ├── item/                   # 아이템 관리
│   │       ├── storage/                # 온라인 스토리지
│   │       └── damage-logs/            # 데미지 로그
│   │
│   ├── ⚔️ Valheim
│   │   └── src/Valheim/
│   │       ├── valheim.module.ts
│   │       ├── character/              # 캐릭터 관리
│   │       ├── world/                  # 월드 관리
│   │       └── inventory/              # 인벤토리 관리
│   │
│   ├── 🛠️ 유틸리티
│   │   ├── src/middleware/             # 미들웨어 (로깅 등)
│   │   └── src/utils/                  # 공통 유틸리티
│   │
│   └── 🧪 테스트
│       └── test/                       # 테스트 파일들
```

## 🔧 주요 구성 요소

### 1. 환경 설정
- **개발/프로덕션 환경 분리**: `.env` 파일 기반
- **TypeScript 설정**: 엄격한 타입 체크
- **ESLint + Prettier**: 코드 품질 관리

### 2. 데이터베이스 아키텍처
- **하이브리드 스키마 구조**:
  - `public`: 공통 데이터 (users, wallets, games)
  - `space_engineers`: Space Engineers 전용 데이터
  - `valheim`: Valheim 전용 데이터
- **TypeORM**: ORM 및 마이그레이션 관리
- **PostgreSQL**: 프로덕션 데이터베이스

### 3. 인증 시스템
- **JWT 토큰**: API 인증
- **Steam OAuth**: 게임 플랫폼 연동
- **Role-based Access Control**: 권한 기반 접근 제어

### 4. 멀티게임 지갑 시스템
- **통합 지갑**: 게임 간 화폐 공유
- **거래 내역**: 모든 거래 추적
- **다중 화폐**: 게임별 화폐 지원

### 5. 배포 및 운영
- **PM2**: 프로세스 관리
- **Nginx**: 리버스 프록시
- **Docker**: 컨테이너화
- **자동 배포**: 스크립트 기반 배포

## 📊 모듈 의존성

```
AppModule
├── ConfigModule (전역)
├── TypeOrmModule (전역)
├── AuthModule
│   ├── JwtModule
│   └── PassportModule
├── UserModule
├── WalletModule
├── GameModule
├── SpaceEngineersModule
│   ├── ItemModule
│   ├── StorageModule
│   └── DamageLogsModule
└── ValheimModule
    ├── CharacterModule
    ├── WorldModule
    └── InventoryModule
```

## 🎯 개발 가이드라인

### 1. 새 게임 추가 시
1. `src/{GameName}/` 디렉토리 생성
2. `{GameName}Module` 생성
3. 게임별 스키마 생성
4. Entity 클래스에 스키마 명시
5. `AppModule`에 등록

### 2. API 개발 시
1. DTO 클래스 정의
2. Entity 관계 설정
3. Service 로직 구현
4. Controller 엔드포인트 작성
5. 가드 및 인터셉터 적용

### 3. 데이터베이스 변경 시
1. 마이그레이션 생성: `npm run migration:generate`
2. 백업 생성: 자동화된 백업 스크립트 사용
3. 안전한 배포: 단계별 마이그레이션

## 🔍 코드 품질 관리

- **ESLint**: 코드 스타일 체크
- **Prettier**: 코드 포맷팅
- **Jest**: 단위 테스트
- **TypeScript**: 타입 안전성
- **Husky**: Git 훅 (예정)

## 📈 성능 최적화

- **PM2 클러스터 모드**: 멀티 프로세스
- **데이터베이스 인덱싱**: 쿼리 최적화
- **캐싱 전략**: Redis (예정)
- **API 응답 압축**: gzip

## 🛡️ 보안 고려사항

- **환경변수**: 민감한 정보 분리
- **CORS 설정**: 화이트리스트 기반
- **Rate Limiting**: API 호출 제한 (예정)
- **Input Validation**: DTO 기반 검증
