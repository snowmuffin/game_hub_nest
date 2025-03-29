import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor() {
    super({
        returnURL: process.env.RETURN_URL || 'http://localhost:3000/api/auth/steam/return',
        realm: process.env.REALM || 'http://localhost:3000/',
        apiKey: process.env.STEAM_API_KEY
    });
  }

  async validate(identifier: string, profile: any): Promise<any> {
    return {
      steam_id: profile.id, // Steam ID를 steam_id로 매핑
      username: profile.displayName,
      email: null, // Steam 프로필에는 이메일 정보가 없으므로 null로 설정
    };
  }
}
