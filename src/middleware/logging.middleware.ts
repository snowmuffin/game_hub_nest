import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body, query, headers } = req;

    this.logger.log(`Request: ${method} ${originalUrl}`);
    this.logger.log(`Headers: ${JSON.stringify(headers)}`);
    this.logger.log(`Query: ${JSON.stringify(query)}`);
    this.logger.log(`Body: ${JSON.stringify(body)}`);

    next();
  }
}