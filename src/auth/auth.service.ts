import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { createuser } from 'src/utils/createuser';

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
    console.log('Profile received:', profile);

    if (!profile.steam_id || !profile.username) {
      throw new Error('Invalid profile data received from Steam');
    }

    let user = await this.userRepository.findOne({ where: { steam_id: profile.steam_id } });

    if (!user) {
      await createuser(profile, this.userRepository);
    }

    if (!user) {
      throw new Error('User not found or could not be created');
    }
    return user;
  }
}