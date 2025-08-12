import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/shared/user.entity';
import { createuser } from 'src/utils/createuser';

interface UserPayload {
  id: number;
  username: string;
}

interface SteamProfile {
  steam_id: string;
  username: string;
  email?: string;
}

interface FormattedUserData {
  id: number;
  username: string;
  email: string;
  steamId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Generate access token
  generateJwtToken(user: UserPayload): string {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: '15m' }); // Access token expiry: 15 minutes
  }

  // Generate refresh token
  generateRefreshToken(user: UserPayload): string {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: '7d' }); // Refresh token expiry: 7 days
  }

  // Format user data
  formatUserData(user: User): FormattedUserData {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      steamId: user.steam_id,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findOrCreateUser(profile: SteamProfile): Promise<User> {
    console.log('Profile received:', profile);

    if (!profile.steam_id || !profile.username) {
      throw new Error('Invalid profile data received from Steam');
    }

    let user = await this.userRepository.findOne({
      where: { steam_id: profile.steam_id },
    });

    if (!user) {
      user = await createuser(profile, this.userRepository);
    }

    if (!user) {
      throw new Error('User not found or could not be created');
    }
    return user;
  }
}
