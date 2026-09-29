import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

const app = express();

// Core Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Root Welcome Route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to OptiCart AI Purchase Optimizer API',
    status: 'online',
    version: '0.1.0',
    docs: '/api/health',
  });
});

// API Routes
app.use('/api', apiRouter);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const server = app.listen(ENV.PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 OptiCart Server running on port ${ENV.PORT}`);
  console.log(`🔗 Health Check: http://localhost:${ENV.PORT}/api/health`);
  console.log(`🌐 Allowed Client: ${ENV.CLIENT_URL}`);
  console.log(`⚙️  Environment: ${ENV.NODE_ENV}`);
  console.log(`=========================================`);
});

export { app, server };
