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

    // Accept only from headers (x-api-key or x-ingest-api-key)
    const headerKey = (request.headers['x-api-key'] ||
      request.headers['x-ingest-api-key']) as string | undefined;

    const provided: string | undefined = headerKey?.toString().trim();

    if (!provided || provided !== requiredKey) {
      this.logger.warn('Invalid or missing SE_INGEST_API_KEY in headers');
      throw new UnauthorizedException('Invalid ingest API key');
    }
    return true;
  }
}
