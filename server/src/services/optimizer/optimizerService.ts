import {
  NormalizedProduct,
  ProductItem,
  PurchaseStrategyResult,
  ShoppingIntent,
  UserPreferences,
} from '../../types/index.js';
import { productDiscoveryService } from '../discovery/productDiscoveryService.js';
import { StrategyGenerator } from './strategyGenerator.js';
import { ProductNormalizer } from '../discovery/normalizer.js';
import { paymentService } from '../payment/paymentService.js';

export interface OptimizerServiceContract {
  optimizeByIntent(
    intent: ShoppingIntent,
    candidateProducts?: NormalizedProduct[]
  ): Promise<PurchaseStrategyResult[]>;

  computeStrategies(
    candidateProducts: (ProductItem | NormalizedProduct)[],
    preferences: UserPreferences | ShoppingIntent
  ): Promise<PurchaseStrategyResult[]>;
}

export class OptimizerService implements OptimizerServiceContract {
  /**
   * Primary Optimization Engine Entrypoint:
   * Takes a structured ShoppingIntent and optional candidate products.
   * If candidate products are not provided, it fetches them via ProductDiscoveryService.
   * Then generates the 3 core strategies: Best Value, Best for Your Brands, Maximum Savings.
   */
  async optimizeByIntent(
    intent: ShoppingIntent,
    candidateProducts?: NormalizedProduct[]
  ): Promise<PurchaseStrategyResult[]> {
    let products = candidateProducts;

    if (!products || products.length === 0) {
      const discoveryResult = await productDiscoveryService.discoverByIntent(intent);
      products = discoveryResult.products;
    }

    if (!products || products.length === 0) {
      return [];
    }

    // Apply and evaluate payment benefits (Razorpay offers / bank discounts)
    const productsWithBenefits = await paymentService.applyPaymentBenefits(products);

    return StrategyGenerator.generateStrategies(productsWithBenefits, intent);
  }

  /**
   * Legacy & Alternative Entrypoint for UserPreferences / ProductItems
   */
  async computeStrategies(
    candidateProducts: (ProductItem | NormalizedProduct)[],
    preferences: UserPreferences | ShoppingIntent
  ): Promise<PurchaseStrategyResult[]> {
    // Normalize products if needed
    const normalizedList: NormalizedProduct[] = candidateProducts.map((p) => {
      if ('title' in p && 'sourceType' in p) {
        return p as NormalizedProduct;
      }
      return ProductNormalizer.normalize(p as unknown as Partial<NormalizedProduct>);
    });

    // Convert UserPreferences to ShoppingIntent if needed
    let intent: ShoppingIntent;
    if ('category' in preferences && 'readinessState' in preferences) {
      intent = preferences as ShoppingIntent;
    } else {
      const pref = preferences as UserPreferences;
      intent = {
        category: pref.category || 'General',
        productType: 'General Item',
        budget: pref.budget ? { amount: pref.budget, currency: 'INR' } : undefined,
        preferredBrands: pref.preferredBrands || [],
        excludedBrands: pref.avoidBrands || [],
        qualityPreference: pref.qualityPreference === 'economy' ? 'budget' : pref.qualityPreference === 'premium' ? 'premium' : 'best-value',
        importantFeatures: [],
        userPriorities: [],
        assumptionsMade: [],
        readinessState: 'ready_for_recommendation',
        summary: `Purchase request in ${pref.category || 'General'}`,
      };
    }

    return this.optimizeByIntent(intent, normalizedList);
  }
}

export const optimizerService = new OptimizerService();
