# 게임별 스키마 분리 마이그레이션 계획

## 현재 상황
- 모든 테이블이 `public` 스키마에 위치
- 게임별 접두어로 테이블 구분 (valheim_, space_engineers_ 등)

## 제안: 하이브리드 스키마 구조

### Public 스키마 (공통 데이터)
```
public.users                    # 사용자 정보 (모든 게임 공통)
public.games                    # 게임 목록
public.game_servers            # 게임 서버 정보
public.currencies              # 화폐 정보
public.wallets                 # 지갑 (크로스 게임)
public.wallet_transactions     # 거래 내역
```

### 게임별 스키마
```
space_engineers.items
space_engineers.online_storage
space_engineers.online_storage_items
space_engineers.damage_logs

valheim.items
valheim.characters
valheim.inventories
valheim.buildings
valheim.worlds
valheim.biomes
valheim.boss_encounters
valheim.character_skills
```

## 장점
1. **공통 데이터 통합**: 사용자, 지갑, 거래 등은 게임 간 공유
2. **게임 데이터 분리**: 각 게임의 고유 데이터는 독립적 관리
3. **확장성**: 새 게임 추가 시 새 스키마만 생성
4. **권한 관리**: 게임별 팀에 스키마별 권한 부여 가능
5. **네임스페이스**: 게임별 테이블명 중복 방지

## 구현 계획
1. 게임별 스키마 생성
2. 기존 테이블을 적절한 스키마로 이동
3. Entity 파일 수정 (스키마 명시)
4. 마이그레이션 파일 작성

## 고려사항
- 크로스 게임 쿼리 시 스키마 간 JOIN 필요
- 마이그레이션 관리 복잡성 증가
- 개발 초기에는 단일 스키마가 더 간단할 수 있음
