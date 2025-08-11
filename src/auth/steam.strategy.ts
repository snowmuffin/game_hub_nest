import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import * as dotenv from 'dotenv';
dotenv.config();
if (!process.env.STEAM_API_KEY) {
  throw new Error('STEAM_API_KEY is not defined in the environment variables');
}

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor() {
    super({
      returnURL:
        process.env.RETURN_URL || 'http://localhost:3000/api/auth/steam/return',
      realm: process.env.REALM || 'http://localhost:3000/',
      apiKey: process.env.STEAM_API_KEY,
    });
  }

  async validate(identifier: string, profile: any): Promise<any> {
    return {
      steam_id: profile.id,
      username: profile.displayName,
      email: null,
    };
  }
}
