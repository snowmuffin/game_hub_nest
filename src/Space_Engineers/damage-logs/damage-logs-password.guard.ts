import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class DamageLogsPasswordGuard implements CanActivate {
  private readonly logger = new Logger(DamageLogsPasswordGuard.name);
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const provided = (request.headers['x-damage-logs-password'] ||
      request.headers['x-damage-logs-pass']) as string | undefined;

    const expected = this.configService.get<string>('DAMAGE_LOGS_PASSWORD');

    if (!expected) {
      this.logger.error('DAMAGE_LOGS_PASSWORD env var not set');
      throw new InternalServerErrorException('Server misconfiguration');
    }

    if (!provided) {
      this.logger.warn('Missing x-damage-logs-password header');
      throw new UnauthorizedException('Password header required');
    }

    if (provided !== expected) {
      this.logger.warn('Invalid damage logs password attempt');
      throw new UnauthorizedException('Invalid password');
    }

    return true;
  }
}
