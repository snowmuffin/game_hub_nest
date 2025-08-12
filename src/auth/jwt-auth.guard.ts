import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    sub: number;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.error('Authorization header is missing or invalid');
      throw new UnauthorizedException(
        'Authorization header is missing or invalid',
      );
    }

    const token = authHeader.split(' ')[1];
    const secret = this.configService.get<string>('JWT_SECRET');
    // this.logger.log(`JWT Secret (from ConfigService): ${secret}`);

    try {
      const decoded = this.jwtService.verify(token, {
        secret,
      }) as unknown as JwtPayload;
      this.logger.log(`Decoded Token: ${JSON.stringify(decoded)}`);
      request.user = {
        id: decoded.sub,
        username: decoded.username,
        sub: decoded.sub,
      };
      this.logger.log(
        `User attached to request: ${JSON.stringify(request.user)}`,
      );
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`JWT Verification Error: ${errorMessage}`, errorStack);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
