import { Router } from 'express';
import { optimizerController } from '../controllers/optimizerController.js';

const router = Router();

// POST /api/optimize
router.post('/', (req, res) => optimizerController.optimize(req, res));

export default router;
