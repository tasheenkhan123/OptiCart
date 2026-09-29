import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;

  _res.on('finish', () => {
    const duration = Date.now() - start;
    const status = _res.statusCode;
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} -> ${status} (${duration}ms)`);
  });

  next();
}
