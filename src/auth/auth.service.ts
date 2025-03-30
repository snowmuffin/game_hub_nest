import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 액세스 토큰 생성
  generateJwtToken(user: any): string {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: '15m' }); // 액세스 토큰 유효 기간: 15분
  }

  // 리프레시 토큰 생성
  generateRefreshToken(user: any): string {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: '7d' }); // 리프레시 토큰 유효 기간: 7일
  }

  // 사용자 데이터 포맷팅
  formatUserData(user: any): any {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      steamId: user.steam_id,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findOrCreateUser(profile: any): Promise<User> {
    console.log('Profile received:', profile); // 디버깅용 로그 추가

    if (!profile.steam_id || !profile.username) {
      throw new Error('Invalid profile data received from Steam');
    }

    // 유저를 steam_id로 조회
    let user = await this.userRepository.findOne({ where: { steam_id: profile.steam_id } });

    // 유저가 없으면 생성
    if (!user) {
      user = this.userRepository.create({
        steam_id: profile.steam_id, // steam_id가 null이 아니어야 함
        username: profile.username,
        email: profile.email, // Steam API에서 이메일은 제공되지 않으므로 null일 수 있음
      });
      await this.userRepository.save(user);
    }

    return user;
  }
}