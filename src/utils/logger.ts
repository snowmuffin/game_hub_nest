import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      (info) =>
        `${String(info.timestamp)} [${String(info.level).toUpperCase()}]: ${String(info.message)}`,
    ),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'app.log' }),
  ],
});

export default logger;
