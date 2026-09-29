export interface HealthCheckData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export type StrategyType = 'BEST_VALUE' | 'BEST_FOR_BRANDS' | 'MAXIMUM_SAVINGS';

export interface StrategyInfo {
  type: StrategyType;
  title: string;
  tagline: string;
  description: string;
  badgeColor: string;
  iconName: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ShoppingBudget {
  amount?: number;
  currency: string;
  raw?: string;
  isFlexible?: boolean;
}

export interface ShoppingItemRequirement {
  id?: string;
  name: string; // e.g. "Gaming Laptop", "Wireless Mouse", "Laptop Sleeve"
  category?: string; // e.g. "Laptops", "Electronics", "Accessories"
  targetBudget?: number;
  preferredBrands?: string[];
  importantFeatures?: string[];
  quantity?: number;
}

export interface ShoppingIntent {
  category: string;
  productType: string;
  budget?: ShoppingBudget;
  preferredBrands: string[];
  excludedBrands: string[];
  qualityPreference: 'budget' | 'mid-range' | 'premium' | 'best-value';
  deliveryPreference?: string;
  importantFeatures: string[];
  quantity?: number;
  requestedResultCount?: number;
  concern?: string;
  userPriorities: string[];
  assumptionsMade: string[];
  readinessState: 'needs_budget' | 'ready_for_recommendation' | 'refining';
  summary: string;
  changeSummary?: string;
  items?: ShoppingItemRequirement[];
  isMultiItem?: boolean;
}



export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  budget?: string;
  category?: string;
  intent?: ShoppingIntent;
  strategies?: PurchaseStrategyResult[];
  isMockResponse?: boolean;
}

export interface SuggestedPromptItem {
  id: string;
  category: string;
  prompt: string;
  iconName?: string;
  tag?: string;
}

export type ProductSourceType = 'mock' | 'web_search' | 'merchant_api';

export type ProductAvailability = 'in_stock' | 'out_of_stock' | 'limited_stock' | 'pre_order';

export interface ProductDeliveryInfo {
  deliveryDays?: number;
  freeDelivery?: boolean;
  estimatedDeliveryDate?: string;
  shippingFee?: number;
  details?: string;
}

export interface ProductSpecification {
  [key: string]: string | number | boolean | undefined;
}

export interface PaymentBenefit {
  id: string;
  provider: 'razorpay' | 'merchant_bank';
  title: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  calculatedSavings: number;
  minOrderValue?: number;
  maxDiscount?: number;
  bankName?: string;
  paymentMethod?: 'credit_card' | 'debit_card' | 'upi' | 'netbanking' | 'emi';
  source: 'live_razorpay_api' | 'demo_mock_benefit';
  isLiveOffer: boolean;
  terms?: string;
}

export interface NormalizedProduct {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  currency: string;
  merchantName: string;
  merchantDomain?: string;
  productUrl?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  availability: ProductAvailability;
  deliveryInformation?: ProductDeliveryInfo;
  specifications?: ProductSpecification;
  sourceType: ProductSourceType;
  sourceUrl?: string;
  confidence?: number;
  paymentOffers?: string[];
  paymentBenefit?: PaymentBenefit;
  effectivePrice?: number;
  merchantTrustScore?: number;
  targetItemId?: string;
  itemRequirementName?: string;
  recommendationCategory?: 'best-overall' | 'best-value' | 'premium' | string;
  recommendationLabel?: string;
}

export interface DiscoverySourceSummary {
  name: string;
  sourceType: ProductSourceType;
  count: number;
  isAvailable: boolean;
}

export interface DiscoveryResult {
  products: NormalizedProduct[];
  totalFound: number;
  filteredCount: number;
  sources: DiscoverySourceSummary[];
  appliedFilters: Record<string, unknown>;
  intentSummary?: string;
  timestamp: string;
}

export type PurchaseStrategyType = 'BEST_VALUE' | 'BEST_FOR_BRANDS' | 'MAXIMUM_SAVINGS';

export interface StrategyScoreBreakdown {
  qualityScore: number;
  brandScore: number;
  savingsScore: number;
  merchantScore: number;
  deliveryScore: number;
  overallScore: number;
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

export interface OptimizationResponse {
  strategies: PurchaseStrategyResult[];
  intent: ShoppingIntent;
  totalCandidatesEvaluated: number;
  timestamp: string;
}


