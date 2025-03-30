import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // ConfigService 주입
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.error('Authorization header is missing or invalid');
      throw new UnauthorizedException('Authorization header is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const secret = this.configService.get<string>('JWT_SECRET');
    this.logger.log(`JWT Secret (from ConfigService): ${secret}`);

    try {
      const decoded = this.jwtService.verify(token, { secret });
      this.logger.log(`Decoded Token: ${JSON.stringify(decoded)}`);
      request.user = {
        id: decoded.sub, // id를 sub에서 가져옴
        username: decoded.username,
        ...decoded,
      };
      this.logger.log(`User attached to request: ${JSON.stringify(request.user)}`);
      return true;
    } catch (error) {
      this.logger.error(`JWT Verification Error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}