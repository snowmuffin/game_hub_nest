import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request as ExpressRequest } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<ExpressRequest & { user?: Record<string, unknown> }>();
    const authHeader = request.headers['authorization'];

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      this.logger.error('Authorization header is missing or invalid');
      throw new UnauthorizedException(
        'Authorization header is missing or invalid',
      );
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const secret = this.configService.get<string>('JWT_SECRET');
    // this.logger.log(`JWT Secret (from ConfigService): ${secret}`);

    try {
      type DecodedToken = {
        sub: number | string;
        username?: string;
        iat?: number;
        exp?: number;
        [key: string]: unknown;
      };

      const decoded = this.jwtService.verify<DecodedToken>(token, {
        secret,
      });
      this.logger.log(`Decoded Token: ${JSON.stringify(decoded)}`);
      const id = Number(decoded.sub);
      request.user = {
        id,
        username: decoded.username ?? '',
        ...decoded,
      } as Record<string, unknown>;
      this.logger.log(
        `User attached to request: ${JSON.stringify(request.user)}`,
      );
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(`JWT Verification Error: ${err.message}`, err.stack);
      } else {
        this.logger.error('JWT Verification Error', String(err));
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
