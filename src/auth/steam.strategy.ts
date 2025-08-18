import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import * as dotenv from 'dotenv';
dotenv.config();
if (!process.env.STEAM_API_KEY) {
  throw new Error('STEAM_API_KEY is not defined in the environment variables');
}

// Resolve returnURL / realm with backward compatibility + diagnostics
const resolvedReturnUrl =
  process.env.RETURN_URL ||
  process.env.STEAM_RETURN_URL ||
  'http://localhost:3000/auth/steam/return';
const resolvedRealm =
  process.env.REALM || process.env.STEAM_REALM || 'http://localhost:3000/';

// Lightweight one-time diagnostic log (helps detect redirect loop causes)
// Avoid printing in test to keep logs clean
if (process.env.NODE_ENV !== 'test') {
  // Redact potential query strings (none expected here, but defensive)
  const safeReturn = resolvedReturnUrl.split('?')[0];
  const safeRealm = resolvedRealm.split('?')[0];
  console.log(
    `[SteamStrategy] Config -> realm: ${safeRealm}, returnURL: ${safeReturn}, apiKey: present=${!!process.env.STEAM_API_KEY}`,
  );
  if (/localhost/.test(safeReturn) && process.env.NODE_ENV === 'production') {
    console.warn(
      '[SteamStrategy] WARNING: returnURL points to localhost while in production. This will cause Steam OpenID redirect issues / loops.',
    );
  }
  if (/localhost/.test(safeRealm) && process.env.NODE_ENV === 'production') {
    console.warn(
      '[SteamStrategy] WARNING: realm points to localhost while in production. Adjust REALM/STEAM_REALM env var.',
    );
  }
}

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor() {
    // Explicit typing to satisfy strict lint rules (passport-steam lacks TS declarations)
    const options: Record<string, unknown> = {
      returnURL: resolvedReturnUrl,
      realm: resolvedRealm,
      apiKey: process.env.STEAM_API_KEY,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(options as any);
  }

  validate(identifier: string, profile: { id: string; displayName: string }) {
    return { steam_id: profile.id, username: profile.displayName, email: null };
  }
}
