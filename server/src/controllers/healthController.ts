import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';
import { HealthCheckResponse } from '../types/index.js';
import { ENV } from '../config/env.js';

const startTime = Date.now();

export function getHealthStatus(_req: Request, res: Response): void {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const healthData: HealthCheckResponse = {
    status: 'healthy',
    service: 'OptiCart Backend API',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    environment: ENV.NODE_ENV,
  };

  sendSuccess(res, healthData, 'OptiCart API service is operational');
}
