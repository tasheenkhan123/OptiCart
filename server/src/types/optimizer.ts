import { NormalizedProduct } from './product.js';
import { ShoppingIntent } from './intent.js';

export type PurchaseStrategyType = 'BEST_VALUE' | 'BEST_FOR_BRANDS' | 'MAXIMUM_SAVINGS';

export interface StrategyScoreBreakdown {
  qualityScore: number;    // 0-100: Specs, rating, feature alignment
  brandScore: number;      // 0-100: Preferred brand match bonus
  savingsScore: number;    // 0-100: Discount rate + payment offers + headroom
  merchantScore: number;   // 0-100: Trust score & merchant reliability
  deliveryScore: number;   // 0-100: Delivery speed & cost
  overallScore: number;    // 0-100: Weighted combination based on strategy profile
}

export interface MerchantCartSplit {
  merchantId?: string;
  merchantName: string;
  merchantDomain?: string;
  itemCount: number;
  subtotal: number;
  paymentSavings: number;
  paymentDiscount?: number;
  effectiveTotal: number;
  effectiveSubtotal?: number;
  items: NormalizedProduct[];
  checkoutUrl?: string;
}

export interface PurchaseStrategyResult {
  strategy: PurchaseStrategyType;
  title: string;
  tagline: string;
  description: string;
  items: NormalizedProduct[];
  subtotal: number;
  totalDiscount: number;
  razorpaySavingsEstimate: number;
  effectiveTotal: number;
  budgetHeadroom: number;
  explanation: string;
  scoreBreakdown: StrategyScoreBreakdown;
  highlights: string[];
  tradeoffs: string[];
  isMultiItem?: boolean;
  merchantSplit?: MerchantCartSplit[];
}


export interface OptimizationRequest {
  intent: ShoppingIntent;
  candidateProducts?: NormalizedProduct[];
}

export interface OptimizationResponse {
  strategies: PurchaseStrategyResult[];
  intent: ShoppingIntent;
  totalCandidatesEvaluated: number;
  timestamp: string;
}
