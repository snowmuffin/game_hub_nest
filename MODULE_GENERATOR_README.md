# Game Hub Module Generation System

이 시스템은 다양한 게임/서버 모듈을 자동으로 생성하고 관리할 수 있는 포괄적인 솔루션입니다.

## 🚀 주요 기능

### 1. 자동화된 모듈 생성
- **대화형 CLI**: 단계별 안내를 통한 모듈 설정
- **템플릿 기반 생성**: 미리 정의된 게임별 템플릿 사용
- **사용자 정의 설정**: 완전히 커스터마이징 가능한 모듈 구성

### 2. 다양한 게임 지원
- **Minecraft**: 블록, 아이템, 월드 관리
- **Terraria**: 캐릭터, 진행도, 월드 이벤트
- **Space Engineers**: 아이템, 데미지 로그, 서버 상태
- **MMORPG**: 길드, 퀘스트, 캐릭터 시스템
- **Survival Games**: 베이스 빌딩, 리소스 관리
- **Racing Games**: 트랙, 차량, 리더보드

### 3. 포괄적인 프로젝트 관리
- 프로젝트 목록 및 검증
- 백업 및 복원
- 문서 자동 생성
- 테스트 실행

## 📋 사용 가능한 스크립트

### 기본 모듈 생성기
```bash
npm run generate:game-module
```
- 기본적인 대화형 모듈 생성기
- 간단한 설정으로 빠른 모듈 생성

### 고급 모듈 생성기 v2.0
```bash
npm run generate:game-module-v2
```
- 템플릿 기반 생성 지원
- 고급 설정 및 유효성 검증
- 실시간 미리보기
- 설정 저장 및 재사용

### 프로젝트 매니저
```bash
npm run project-manager <command>
```
- 프로젝트 관리를 위한 종합 도구

## 🎮 사용 가이드

### 1. 새 게임 모듈 생성

#### 템플릿을 사용한 빠른 생성
```bash
npm run generate:game-module-v2
# 템플릿 사용을 선택하고 'minecraft' 입력
```

#### 완전 커스텀 모듈 생성
```bash
npm run generate:game-module-v2
# 커스텀 설정을 선택하고 단계별로 진행
```

### 2. 프로젝트 관리

#### 모든 프로젝트 확인
```bash
npm run project-manager list
```

#### 프로젝트 검증
```bash
npm run project-manager validate Minecraft
```

#### 프로젝트 백업
```bash
npm run project-manager backup SpaceEngineers
```

#### 문서 생성
```bash
npm run project-manager generate-docs Terraria
```

#### 새 템플릿 업데이트
```bash
npm run project-manager update-templates
```

## 🗂️ 디렉토리 구조

```
scripts/
├── generate-game-module.js          # 기본 생성기
├── generate-game-module-v2.js       # 고급 생성기 v2.0
├── project-manager.js               # 프로젝트 매니저
├── templates/                       # 게임 템플릿들
│   ├── default-game.json
│   ├── minecraft.json
│   ├── terraria.json
│   ├── mmorpg.json
│   ├── survival.json
│   └── racing.json
└── generated-configs/               # 저장된 설정들

src/
├── Space_Engineers/                 # 생성된 게임 모듈들
├── Minecraft/
├── Valheim/
└── ...

database/                           # 데이터베이스 스키마 파일들
docs/                              # 자동 생성된 문서들
backups/                           # 프로젝트 백업들
```

## 📋 템플릿 구조

각 템플릿은 다음 요소들을 포함합니다:

```json
{
  "name": "템플릿 이름",
  "description": "템플릿 설명",
  "game": {
    "playerIdField": "player_id",
    "playerIdType": "TEXT",
    "supportsMultiplayer": true,
    "hasInventorySystem": true,
    "hasPlayerStats": true
  },
  "modules": [
    {
      "name": "item",
      "displayName": "Item Management",
      "endpoints": [...],
      "dependencies": [...]
    }
  ],
  "database": {
    "tables": [...]
  },
  "features": {
    "authentication": {...},
    "rateLimit": {...},
    "adminPanel": {...}
  }
}
```

## 🔧 생성되는 파일들

각 모듈 생성시 다음 파일들이 자동으로 생성됩니다:

### NestJS 모듈 파일들
- `src/{GameName}/{game}.module.ts` - 메인 모듈
- `src/{GameName}/{submodule}/{submodule}.module.ts` - 서브모듈
- `src/{GameName}/{submodule}/{submodule}.controller.ts` - 컨트롤러
- `src/{GameName}/{submodule}/{submodule}.service.ts` - 서비스

### 데이터베이스 스키마
- `database/create-{schema}-schema.sql` - 스키마 생성 SQL

### 문서
- `docs/{GameName}/API.md` - API 문서
- `docs/{GameName}/SETUP.md` - 설정 가이드

## 🛠️ 고급 기능

### 1. 설정 유효성 검증
- 모듈 의존성 검증
- 데이터베이스 스키마명 유효성
- TypeScript 컴파일 검증

### 2. 자동 통합
- `app.module.ts` 자동 업데이트
- 라우팅 자동 설정
- 의존성 주입 설정

### 3. 확장성
- 새로운 템플릿 쉽게 추가
- 커스텀 필드 및 엔드포인트
- 모듈간 의존성 관리

## 🎯 사용 예시

### Minecraft 서버 모듈 생성
```bash
# 1. 고급 생성기 실행
npm run generate:game-module-v2

# 2. 템플릿 사용 선택
Use existing template? (y/n): y

# 3. Minecraft 템플릿 선택
Enter template name (without .json): minecraft

# 4. 게임 정보 입력
Game name: MyMinecraft
Display name: My Minecraft Server

# 5. 모듈 선택
Include item module? (y/n): y
Include world module? (y/n): y
Include player-stats module? (y/n): y

# 6. 생성 확인
Generate module with this configuration? (y/n): y
```

### 커스텀 MMORPG 모듈 생성
```bash
# 1. 고급 생성기 실행
npm run generate:game-module-v2

# 2. 커스텀 설정 선택
Use existing template? (y/n): n

# 3. 게임 정보 설정
Game name: MyMMORPG
Player ID field name: character_uuid
Player ID type: UUID
Supports multiplayer? (y/n): y
Has guild system? (y/n): y

# 4. 모듈 구성
# ... 상세 설정 진행
```

## 🔍 문제 해결

### 공통 문제들

1. **TypeScript 컴파일 오류**
   ```bash
   npm run project-manager validate {ProjectName}
   ```

2. **모듈이 app.module.ts에 추가되지 않음**
   - 수동으로 import 추가 필요
   - 또는 재생성

3. **데이터베이스 스키마 오류**
   ```bash
   # 스키마 재생성
   psql -d database_name -f database/create-{schema}-schema.sql
   ```

### 로그 확인
생성 과정에서 오류가 발생하면 상세한 오류 메시지가 출력됩니다.

## 🚀 향후 계획

- [ ] GUI 기반 모듈 생성기
- [ ] 더 많은 게임 템플릿 추가
- [ ] 실시간 코드 생성 미리보기
- [ ] 모듈 간 통신 자동 설정
- [ ] Docker 컨테이너 자동 생성
- [ ] CI/CD 파이프라인 통합

## 💡 기여하기

새로운 게임 템플릿이나 기능을 추가하고 싶다면:

1. `scripts/templates/` 에 새 템플릿 추가
2. `project-manager.js` 에 새 기능 구현
3. 테스트 후 PR 제출

---

이 시스템을 통해 다양한 게임 서버의 백엔드를 빠르고 일관성 있게 구축할 수 있습니다. 질문이나 제안사항이 있으면 언제든 알려주세요!
