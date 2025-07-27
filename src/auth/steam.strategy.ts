import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.STEAM_API_KEY) {
  throw new Error('STEAM_API_KEY is not defined in the environment variables');
}

// Type definitions for Steam profile
interface SteamProfile {
  id: string;
  displayName: string;
  photos?: Array<{ value: string }>;
}

interface ValidatedUser {
  steam_id: string;
  username: string;
  email: null;
}

/**
 * Steam authentication strategy using Passport
 * Handles Steam OAuth authentication flow
 */
@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor() {
    const steamApiKey = process.env.STEAM_API_KEY;
    if (!steamApiKey) {
      throw new Error(
        'STEAM_API_KEY is not defined in the environment variables',
      );
    }

    const strategyOptions = {
      returnURL:
        process.env.RETURN_URL || 'http://localhost:3000/api/auth/steam/return',
      realm: process.env.REALM || 'http://localhost:3000/',
      apiKey: steamApiKey,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(strategyOptions);
  }

  /**
   * Validates Steam user profile and returns user data
   * @param identifier Steam identifier
   * @param profile Steam user profile
   * @returns Validated user object
   */
  validate(identifier: string, profile: SteamProfile): ValidatedUser {
    return {
      steam_id: profile.id,
      username: profile.displayName,
      email: null,
    };
  }
}
