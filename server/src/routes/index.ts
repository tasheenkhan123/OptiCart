import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import chatRoutes from './chatRoutes.js';
import productRoutes from './productRoutes.js';
import optimizerRoutes from './optimizerRoutes.js';

const apiRouter = Router();

// Mount Health Check endpoint
apiRouter.use('/health', healthRoutes);

// Mount Conversational Shopping AI endpoint
apiRouter.use('/chat', chatRoutes);

// Mount Product Discovery & Search endpoint
apiRouter.use('/products', productRoutes);

// Mount Purchase Optimization Engine endpoint
apiRouter.use('/optimize', optimizerRoutes);

// Future endpoints:
// apiRouter.use('/checkout', checkoutRoutes);

export default apiRouter;


