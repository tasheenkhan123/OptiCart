import { Request, Response } from 'express';
import { optimizerService } from '../services/optimizer/optimizerService.js';
import { ShoppingIntent } from '../types/intent.js';
import { NormalizedProduct } from '../types/product.js';
import { ApiResponse } from '../types/index.js';
import { OptimizationResponse } from '../types/optimizer.js';

export class OptimizerController {
  /**
   * POST /api/optimize
   * Computes the 3 purchase strategies for a ShoppingIntent and optional candidate products.
   */
  async optimize(req: Request, res: Response): Promise<void> {
    try {
      const { intent, candidateProducts } = req.body as {
        intent?: ShoppingIntent;
        candidateProducts?: NormalizedProduct[];
      };

      if (!intent || !intent.category) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'A valid ShoppingIntent is required to generate purchase strategies.',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(errorResponse);
        return;
      }

      const strategies = await optimizerService.optimizeByIntent(intent, candidateProducts);

      const responseData: OptimizationResponse = {
        strategies,
        intent,
        totalCandidatesEvaluated: candidateProducts?.length || 0,
        timestamp: new Date().toISOString(),
      };

      const response: ApiResponse<OptimizationResponse> = {
        success: true,
        message: `Generated ${strategies.length} purchase strategies successfully`,
        data: responseData,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in purchase optimization:', error);
      const errorResponse: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal purchase optimization error',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(errorResponse);
    }
  }
}

export const optimizerController = new OptimizerController();
