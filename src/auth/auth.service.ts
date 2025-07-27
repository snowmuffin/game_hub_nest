import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { createuser } from 'src/utils/createuser';

interface UserTokenData {
  id: number;
  username: string;
  steam_id?: string;
  minecraft_uuid?: string;
}

interface SteamProfile {
  steam_id: string;
  username: string;
  email?: string;
  [key: string]: any;
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
  generateJwtToken(user: UserTokenData): string {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: '15m' }); // Access token validity: 15 minutes
  }

  // Generate refresh token
  generateRefreshToken(user: UserTokenData): string {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: '7d' }); // Refresh token validity: 7 days
  }

  // Generate Minecraft token (24 hours validity)
  generateMinecraftToken(user: UserTokenData): string {
    const payload = {
      sub: user.id,
      username: user.username,
      steam_id: user.steam_id,
      minecraft_uuid: user.minecraft_uuid,
      type: 'minecraft',
    };
    return this.jwtService.sign(payload, { expiresIn: '24h' });
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
      await createuser(profile, this.userRepository);
      user = await this.userRepository.findOne({
        where: { steam_id: profile.steam_id },
      });
    }

    if (!user) {
      throw new Error('User not found or could not be created');
    }
    return user;
  }
}
