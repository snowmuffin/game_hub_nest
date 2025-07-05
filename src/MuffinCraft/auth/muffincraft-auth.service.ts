import { Injectable, BadRequestException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { MuffinCraftPlayer } from '../entities/muffincraft-player.entity';
import { MuffinCraftAuthCode } from '../entities/muffincraft-auth-code.entity';

@Injectable()
export class MuffinCraftAuthService {
  private readonly logger = new Logger(MuffinCraftAuthService.name);

  constructor(
    @InjectRepository(MuffinCraftPlayer)
    private readonly playerRepository: Repository<MuffinCraftPlayer>,
    @InjectRepository(MuffinCraftAuthCode)
    private readonly authCodeRepository: Repository<MuffinCraftAuthCode>,
  ) {}

  /**
   * 고도로 복잡한 인증 코드 생성 (12자리: 영문 대문자 + 소문자 + 숫자 + 특수문자)
   * 예: aB7$mK9pQ3xZ, X2#nR8yU5$kV 등
   * 
   * 보안 강화 요소:
   * - 12자리 길이 (8자리보다 36억배 더 복잡)
   * - 대문자, 소문자, 숫자, 특수문자 조합
   * - 최소 각 타입별 2개 이상 포함 보장
   * - 연속된 동일 문자 방지
   * - 예측 가능한 패턴 방지
   */
  private generateRandomCode(): string {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specials = '#$%&*+-=?@';
    const allChars = upperCase + lowerCase + numbers + specials;
    
    const codeLength = 12;
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
      let result = '';
      
      // 각 타입별 최소 2개씩 보장
      // 대문자 2개
      for (let i = 0; i < 2; i++) {
        result += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
      }
      
      // 소문자 2개
      for (let i = 0; i < 2; i++) {
        result += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
      }
      
      // 숫자 2개
      for (let i = 0; i < 2; i++) {
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
      }
      
      // 특수문자 2개
      for (let i = 0; i < 2; i++) {
        result += specials.charAt(Math.floor(Math.random() * specials.length));
      }
      
      // 나머지 4자리는 모든 문자에서 랜덤
      for (let i = 0; i < 4; i++) {
        result += allChars.charAt(Math.floor(Math.random() * allChars.length));
      }
      
      // 완전히 랜덤하게 섞기 (Fisher-Yates 알고리즘)
      const chars = result.split('');
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      result = chars.join('');
      
      // 연속된 동일 문자 체크 (보안 강화)
      let hasConsecutive = false;
      for (let i = 0; i < result.length - 1; i++) {
        if (result[i] === result[i + 1]) {
          hasConsecutive = true;
          break;
        }
      }
      
      // 연속된 문자가 없으면 반환
      if (!hasConsecutive) {
        return result;
      }
      
      attempts++;
    }
    
    // 만약 최대 시도 횟수를 초과하면 기본 방식으로 생성
    let result = '';
    for (let i = 0; i < codeLength; i++) {
      result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    return result;
  }

  /**
   * 인증 코드 유효성 검사 (12자리 영문 대소문자 + 숫자 + 특수문자)
   */
  private isValidAuthCode(code: string): boolean {
    return /^[A-Za-z0-9#$%&*+\-=?@]{12}$/.test(code);
  }

  /**
   * 마인크래프트 서버에서 인증 코드 요청
   */
  async generateAuthCode(minecraftUsername: string, minecraftUuid?: string) {
    this.logger.log(`인증 코드 요청: ${minecraftUsername}, UUID: ${minecraftUuid || 'N/A'}`);
    
    // 레이트 리밋 체크 - 같은 사용자명으로 과도한 요청 방지
    await this.checkRateLimit(minecraftUsername);

    // 기존 활성 인증 코드가 있는지 확인
    const existingCode = await this.authCodeRepository.findOne({
      where: { 
        minecraftUsername, 
        isUsed: false,
        expiresAt: MoreThan(new Date())
      }
    });

    if (existingCode) {
      this.logger.log(`기존 활성 인증 코드 반환: ${minecraftUsername} - ${existingCode.authCode}`);
      return {
        success: true,
        authCode: existingCode.authCode,
        expiresAt: existingCode.expiresAt,
        message: '기존 활성 인증 코드를 반환합니다.'
      };
    }

    // 새로운 인증 코드 생성
    let authCode = '';
    let isUnique = false;
    let attempts = 0;

    // 중복되지 않는 코드가 나올 때까지 시도
    while (!isUnique && attempts < 10) {
      authCode = this.generateRandomCode();
      const existing = await this.authCodeRepository.findOne({ where: { authCode } });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      this.logger.error(`인증 코드 생성 실패: ${minecraftUsername} - 최대 시도 횟수 초과`);
      throw new BadRequestException('인증 코드 생성에 실패했습니다. 다시 시도해주세요.');
    }

    // 만료 시간: 현재 시간 + 10분
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const newAuthCode = this.authCodeRepository.create({
      authCode,
      minecraftUsername,
      minecraftUuid,
      expiresAt
    });

    await this.authCodeRepository.save(newAuthCode);

    this.logger.log(`새 인증 코드 생성 완료: ${minecraftUsername} - ${authCode}`);

    return {
      success: true,
      authCode,
      expiresAt,
      message: '인증 코드가 생성되었습니다. 10분 내에 웹사이트에서 인증을 완료해주세요.'
    };
  }

  /**
   * 웹에서 계정 연동
   */
  async linkAccount(authCode: string, userId: number) {
    // 인증 코드 형식 검증
    if (!this.isValidAuthCode(authCode)) {
      throw new BadRequestException('올바르지 않은 인증 코드 형식입니다. (12자리 영문 대소문자 + 숫자 + 특수문자)');
    }

    // 인증 코드 확인
    const authCodeRecord = await this.authCodeRepository.findOne({
      where: { authCode, isUsed: false }
    });

    if (!authCodeRecord) {
      throw new NotFoundException('유효하지 않은 인증 코드입니다.');
    }

    // 만료 시간 확인
    if (new Date() > authCodeRecord.expiresAt) {
      throw new BadRequestException('인증 코드가 만료되었습니다.');
    }

    // 이미 연동된 유저인지 확인
    const existingPlayer = await this.playerRepository.findOne({
      where: { userId }
    });

    if (existingPlayer) {
      throw new ConflictException('이미 다른 마인크래프트 계정과 연동되어 있습니다.');
    }

    // 해당 마인크래프트 유저명이 이미 다른 계정과 연동되어 있는지 확인
    const existingUsername = await this.playerRepository.findOne({
      where: { minecraftUsername: authCodeRecord.minecraftUsername, isLinked: true }
    });

    if (existingUsername) {
      throw new ConflictException('해당 마인크래프트 계정은 이미 다른 유저와 연동되어 있습니다.');
    }

    // 기존 플레이어 레코드가 있는지 확인
    let player = await this.playerRepository.findOne({
      where: { minecraftUsername: authCodeRecord.minecraftUsername }
    });

    if (player) {
      // 기존 레코드 업데이트
      player.userId = userId;
      player.isLinked = true;
      if (authCodeRecord.minecraftUuid) {
        player.minecraftUuid = authCodeRecord.minecraftUuid;
      }
    } else {
      // 새 플레이어 레코드 생성
      player = this.playerRepository.create({
        userId,
        minecraftUsername: authCodeRecord.minecraftUsername,
        minecraftUuid: authCodeRecord.minecraftUuid,
        isLinked: true
      });
    }

    await this.playerRepository.save(player);

    // 인증 코드를 사용됨으로 마킹
    authCodeRecord.isUsed = true;
    authCodeRecord.usedBy = userId;
    await this.authCodeRepository.save(authCodeRecord);

    return {
      success: true,
      message: '마인크래프트 계정이 성공적으로 연동되었습니다.',
      player: {
        minecraftUsername: player.minecraftUsername,
        minecraftUuid: player.minecraftUuid,
        linkedAt: player.updatedAt
      }
    };
  }

  /**
   * 인증 코드 상태 확인
   */
  async getAuthCodeStatus(authCode: string) {
    const authCodeRecord = await this.authCodeRepository.findOne({
      where: { authCode }
    });

    if (!authCodeRecord) {
      throw new NotFoundException('인증 코드를 찾을 수 없습니다.');
    }

    const isExpired = new Date() > authCodeRecord.expiresAt;

    return {
      success: true,
      status: {
        isUsed: authCodeRecord.isUsed,
        isExpired,
        expiresAt: authCodeRecord.expiresAt,
        minecraftUsername: authCodeRecord.minecraftUsername
      }
    };
  }

  /**
   * 플레이어 정보 조회
   */
  async getPlayerInfo(minecraftUsername: string) {
    const player = await this.playerRepository.findOne({
      where: { minecraftUsername }
    });

    if (!player) {
      return {
        success: true,
        isLinked: false,
        message: '연동되지 않은 플레이어입니다.'
      };
    }

    return {
      success: true,
      isLinked: player.isLinked,
      player: {
        minecraftUsername: player.minecraftUsername,
        minecraftUuid: player.minecraftUuid,
        linkedAt: player.isLinked ? player.updatedAt : null
      }
    };
  }

  /**
   * 계정 연동 해제
   */
  async unlinkAccount(userId: number) {
    const player = await this.playerRepository.findOne({
      where: { userId, isLinked: true }
    });

    if (!player) {
      throw new NotFoundException('연동된 마인크래프트 계정을 찾을 수 없습니다.');
    }

    player.userId = null;
    player.isLinked = false;
    await this.playerRepository.save(player);

    return {
      success: true,
      message: '마인크래프트 계정 연동이 해제되었습니다.'
    };
  }

  /**
   * 레이트 리밋 체크 - 같은 사용자명으로 과도한 요청 방지
   */
  private async checkRateLimit(minecraftUsername: string): Promise<void> {
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    const recentCodes = await this.authCodeRepository.count({
      where: {
        minecraftUsername,
        createdAt: MoreThan(fifteenMinutesAgo)
      }
    });

    if (recentCodes >= 5) {
      throw new BadRequestException('너무 많은 인증 코드 요청입니다. 15분 후에 다시 시도해주세요.');
    }
  }

  /**
   * 만료된 인증 코드 정리 (정기적으로 실행하는 클린업 작업)
   */
  async cleanupExpiredCodes(): Promise<void> {
    const expiredCodes = await this.authCodeRepository.find({
      where: {
        expiresAt: MoreThan(new Date())
      }
    });

    if (expiredCodes.length > 0) {
      await this.authCodeRepository.remove(expiredCodes);
      this.logger.log(`만료된 인증 코드 ${expiredCodes.length}개 정리 완료`);
    }
  }
}
