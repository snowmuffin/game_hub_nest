import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/shared/user.entity';

interface SteamProfileMinimal {
  steam_id: string;
  username: string;
}
import { createuser } from 'src/utils/createuser';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 액세스 토큰 생성
  generateJwtToken(user: Pick<User, 'id' | 'username'>): string {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: '15m' }); // 액세스 토큰 유효 기간: 15분
  }

  // 리프레시 토큰 생성
  generateRefreshToken(user: Pick<User, 'id' | 'username'>): string {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: '7d' }); // 리프레시 토큰 유효 기간: 7일
  }

  // 사용자 데이터 포맷팅
  formatUserData(user: User): {
    id: number;
    username: string;
    email: string | null;
    steamId: string;
    createdAt: Date;
    updatedAt: Date;
    lastActiveAt: Date | null;
  } {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      steamId: user.steam_id,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastActiveAt: user.last_active_at,
    };
  }

  async findOrCreateUser(profile: SteamProfileMinimal): Promise<User> {
    console.log('Profile received:', profile);

    if (!profile.steam_id || !profile.username) {
      throw new Error('Invalid profile data received from Steam');
    }

    let user = await this.userRepository.findOne({
      where: { steam_id: profile.steam_id },
    });

    if (!user) {
      user = await createuser(profile, this.userRepository);
      if (user) {
        user.last_active_at = new Date();
        await this.userRepository.save(user);
      }
    } else {
      // Update last_active_at on existing user login
      user.last_active_at = new Date();
      await this.userRepository.save(user);
    }

    if (!user) {
      throw new Error('User not found or could not be created');
    }
    return user;
  }
}
