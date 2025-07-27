import { createLogger, format, transports } from 'winston';

/**
 * Winston logger configuration for application-wide logging
 * Outputs to both console and file (app.log)
 */
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      (info: { timestamp: string; level: string; message: string }) =>
        `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`,
    ),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'app.log' }),
  ],
});

export default logger;
