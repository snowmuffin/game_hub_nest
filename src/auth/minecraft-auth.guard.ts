import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class MinecraftAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'defaultSecret',
      });

      // 마인크래프트 토큰인지 확인
      if (payload.type !== 'minecraft') {
        throw new UnauthorizedException('Invalid token type for minecraft server');
      }

      // 필수 필드 확인
      if (!payload.sub || !payload.steam_id || !payload.username) {
        throw new UnauthorizedException('Invalid token payload - missing required fields');
      }

      // 요청에 사용자 정보 추가 (일반 토큰과 호환성을 위해 id 필드도 추가)
      request['user'] = {
        ...payload,
        id: payload.sub  // 일반 토큰과의 호환성을 위해 id 필드 추가
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
