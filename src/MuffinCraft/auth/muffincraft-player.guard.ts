import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MuffinCraftPlayerGuard implements CanActivate {
  private readonly logger = new Logger(MuffinCraftPlayerGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

    try {
      const decoded = this.jwtService.verify(token, { secret });
      this.logger.log(`Decoded Player Token: ${JSON.stringify(decoded)}`);

      // 마인크래프트 플레이어 토큰인지 확인
      if (decoded.type !== 'minecraft_player') {
        // 일반 유저 토큰인 경우도 허용 (호환성을 위해)
        if (decoded.sub && decoded.username) {
          request.user = {
            id: decoded.sub,
            username: decoded.username,
            type: 'web_user',
            ...decoded,
          };
          this.logger.log(`Web user attached to request: ${JSON.stringify(request.user)}`);
          return true;
        }
        
        throw new UnauthorizedException('Invalid token type for MuffinCraft player');
      }

      // 마인크래프트 플레이어 정보를 request에 첨부
      request.user = {
        type: 'minecraft_player',
        playerId: decoded.playerId,
        minecraftUsername: decoded.minecraftUsername,
        minecraftUuid: decoded.minecraftUuid,
        isLinked: decoded.isLinked,
        userId: decoded.userId,
        id: decoded.isLinked ? decoded.userId : decoded.playerId,
        username: decoded.minecraftUsername,
        ...decoded,
      };

      this.logger.log(`Minecraft player attached to request: ${JSON.stringify(request.user)}`);
      return true;
    } catch (error) {
      this.logger.error(`JWT Verification Error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
