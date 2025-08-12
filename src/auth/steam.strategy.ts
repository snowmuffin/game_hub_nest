import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import * as dotenv from 'dotenv';

dotenv.config();

const steamApiKey = process.env.STEAM_API_KEY;
if (!steamApiKey) {
  throw new Error('STEAM_API_KEY is not defined in the environment variables');
}

interface SteamProfile {
  id: string;
  displayName: string;
  photos?: Array<{ value: string }>;
  _json?: {
    steamid: string;
    personaname: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
  };
}

interface ValidatedUser {
  steam_id: string;
  username: string;
  email: string | null;
}

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor() {
    const config = {
      returnURL:
        process.env.RETURN_URL || 'http://localhost:3000/auth/steam/return',
      realm: process.env.REALM || 'http://localhost:3000/',
      apiKey: steamApiKey as string, // We've already validated this is not null above
    };

    super(config);
  }

  validate(identifier: string, profile: SteamProfile): ValidatedUser {
    return {
      steam_id: profile.id,
      username: profile.displayName,
      email: null,
    };
  }
}
