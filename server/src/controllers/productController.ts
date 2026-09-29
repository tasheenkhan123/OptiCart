import { Request, Response } from 'express';
import { productDiscoveryService } from '../services/discovery/productDiscoveryService.js';
import { ShoppingIntent } from '../types/intent.js';
import { ApiResponse } from '../types/index.js';
import { DiscoveryResult } from '../types/product.js';

export class ProductController {
  /**
   * POST /api/products/discover
   * Discovers, normalizes, and filters products matching a structured ShoppingIntent.
   */
  async discoverByIntent(req: Request, res: Response): Promise<void> {
    try {
      const { intent, options } = req.body as {
        intent?: ShoppingIntent;
        options?: { limit?: number; offset?: number; includeOutOfStock?: boolean };
      };

      if (!intent || !intent.category) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'A valid ShoppingIntent with at least a category is required for product discovery.',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(errorResponse);
        return;
      }

      const discoveryResult: DiscoveryResult = await productDiscoveryService.discoverByIntent(intent, options);

      const response: ApiResponse<DiscoveryResult> = {
        success: true,
        message: `Discovered ${discoveryResult.filteredCount} matching products across ${discoveryResult.sources.length} sources`,
        data: discoveryResult,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in product discovery by intent:', error);
      const errorResponse: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal product discovery error',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(errorResponse);
    }
  }

  /**
   * GET /api/products/search
   * Ad-hoc keyword / category search across discovery providers.
   */
  async searchByQuery(req: Request, res: Response): Promise<void> {
    try {
      const q = (req.query.q as string) || '';
      const category = req.query.category as string | undefined;
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
      const preferredBrands = req.query.preferredBrands
        ? (req.query.preferredBrands as string).split(',').map((b) => b.trim())
        : undefined;
      const excludedBrands = req.query.excludedBrands
        ? (req.query.excludedBrands as string).split(',').map((b) => b.trim())
        : undefined;

      const discoveryResult: DiscoveryResult = await productDiscoveryService.searchByQuery(
        q,
        category,
        {
          category,
          minPrice,
          maxPrice,
          preferredBrands,
          excludedBrands,
        }
      );

      const response: ApiResponse<DiscoveryResult> = {
        success: true,
        message: `Found ${discoveryResult.filteredCount} matching products`,
        data: discoveryResult,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in product search query:', error);
      const errorResponse: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal product search error',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(errorResponse);
    }
  }

  /**
   * GET /api/products/providers
   * Returns list of configured search providers and their source types.
   */
  async getProviders(_req: Request, res: Response): Promise<void> {
    try {
      const providers = productDiscoveryService.getAvailableProviders();
      const response: ApiResponse = {
        success: true,
        data: { providers },
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(response);
    } catch (error) {
      const errorResponse: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve providers',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(errorResponse);
    }
  }
}

export const productController = new ProductController();
