import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface MinecraftJwtPayload {
  type: string;
  sub: string;
  steam_id: string;
  username: string;
  [key: string]: unknown;
}

function isMinecraftJwtPayload(
  payload: unknown,
): payload is MinecraftJwtPayload {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const obj = payload as Record<string, unknown>;
  return (
    'type' in obj &&
    'sub' in obj &&
    'steam_id' in obj &&
    'username' in obj &&
    typeof obj.type === 'string' &&
    typeof obj.sub === 'string' &&
    typeof obj.steam_id === 'string' &&
    typeof obj.username === 'string'
  );
}

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
      const payload: unknown = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'defaultSecret',
      });

      // Type guard to ensure payload has required properties
      if (!isMinecraftJwtPayload(payload)) {
        throw new UnauthorizedException('Invalid token payload structure');
      }

      // Check if it's a Minecraft token
      if (payload.type !== 'minecraft') {
        throw new UnauthorizedException(
          'Invalid token type for minecraft server',
        );
      }

      // Check required fields
      if (!payload.sub || !payload.steam_id || !payload.username) {
        throw new UnauthorizedException(
          'Invalid token payload - missing required fields',
        );
      }

      // Add user information to request (add id field for compatibility with regular tokens)
      request['user'] = {
        ...payload,
        id: payload.sub, // Add id field for compatibility with regular tokens
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
