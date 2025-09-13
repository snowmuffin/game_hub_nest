import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SeIngestApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(SeIngestApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const requiredKey = process.env.SE_INGEST_API_KEY?.trim();
    if (!requiredKey) return true; // if not configured, allow

    // Accept from header or body.meta.apiKey
    const headerKey = (request.headers['x-api-key'] ||
      request.headers['x-ingest-api-key']) as string | undefined;

    let provided: string | undefined = headerKey?.toString().trim();
    if (!provided) {
      const rawBody = request.body as unknown;
      if (rawBody && typeof rawBody === 'object') {
        const meta = (rawBody as Record<string, unknown>).meta;
        if (meta && typeof meta === 'object') {
          const apiKey = (meta as Record<string, unknown>).apiKey;
          if (typeof apiKey === 'string') {
            provided = apiKey.trim();
          }
        }
      }
    }

    if (!provided || provided !== requiredKey) {
      this.logger.warn('Invalid or missing SE_INGEST_API_KEY');
      throw new UnauthorizedException('Invalid ingest API key');
    }
    return true;
  }
}
