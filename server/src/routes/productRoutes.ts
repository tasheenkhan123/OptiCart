import { Router } from 'express';
import { productController } from '../controllers/productController.js';

const router = Router();

// Discover products by ShoppingIntent (Primary pipeline)
router.post('/discover', (req, res) => productController.discoverByIntent(req, res));

// Direct search by query / filters
router.get('/search', (req, res) => productController.searchByQuery(req, res));

// List configured providers
router.get('/providers', (req, res) => productController.getProviders(req, res));

export default router;
