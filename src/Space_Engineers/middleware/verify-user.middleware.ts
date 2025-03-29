import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '../utils/logger';

@Injectable()
export class VerifyUserMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      Logger.warn('Unauthorized access attempt.');
      throw new HttpException({ error: 'Login is required.' }, HttpStatus.UNAUTHORIZED);
    }

    const requestedSteamId = req.params.steamid;
    const loggedSteamId = req.user.steamId;

    if (requestedSteamId !== loggedSteamId) {
      Logger.warn(`Forbidden access attempt. Requested Steam ID: ${requestedSteamId}, Logged Steam ID: ${loggedSteamId}`);
      throw new HttpException({ error: 'Access denied.' }, HttpStatus.FORBIDDEN);
    }

    next();
  }
}