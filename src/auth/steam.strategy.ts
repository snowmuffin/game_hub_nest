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
      id: profile.id,
      displayName: profile.displayName,
      _json: profile._json,
    };
  }
}
 