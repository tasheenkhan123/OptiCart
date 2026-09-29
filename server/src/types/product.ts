/**
 * OptiCart Normalized Product & Discovery Type Definitions
 */

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

/**
 * Normalized Product Model
 * Standardized across all search providers (Mock, Web Search, Merchant Direct APIs).
 */
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
  confidence?: number; // 0.0 - 1.0 confidence match score
  paymentOffers?: string[];
  paymentBenefit?: PaymentBenefit;
  effectivePrice?: number; // Listed Price - Calculated Payment Benefit
  merchantTrustScore?: number;
  targetItemId?: string; // Links product to a specific ShoppingItemRequirement
  itemRequirementName?: string; // Name of the requirement it satisfies (e.g. "Wireless Mouse")
  recommendationCategory?: 'best-overall' | 'best-value' | 'premium' | string;
  recommendationLabel?: string;
}

export interface ProductFilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  preferredBrands?: string[];
  excludedBrands?: string[];
  minRating?: number;
  inStockOnly?: boolean;
  maxDeliveryDays?: number;
  qualityPreference?: 'budget' | 'mid-range' | 'premium' | 'best-value';
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
  appliedFilters: ProductFilterOptions;
  intentSummary?: string;
  timestamp: string;
}
