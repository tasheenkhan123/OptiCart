import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { ENV } from '../config/env.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled Server Error:', err);

  const errorMessage = ENV.isDevelopment
    ? err.message || 'Internal Server Error'
    : 'An unexpected internal server error occurred.';

  sendError(res, errorMessage, 500);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
