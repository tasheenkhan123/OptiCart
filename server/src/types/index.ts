/**
 * OptiCart System-wide Type Definitions
 */

export type PurchaseStrategyType = 'BEST_VALUE' | 'BEST_FOR_BRANDS' | 'MAXIMUM_SAVINGS';

export interface HealthCheckResponse {
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

export interface UserPreferences {
  budget?: number;
  preferredBrands?: string[];
  avoidBrands?: string[];
  qualityPreference?: 'economy' | 'standard' | 'premium';
  deliveryMaxDays?: number;
  category?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  originalPrice: number;
  discountedPrice: number;
  merchantName: string;
  merchantTrustScore: number; // 1-5 or 0-100
  rating: number;
  deliveryDays: number;
  inStock: boolean;
  image?: string;
  specifications?: Record<string, string>;
  paymentOffers?: string[];
}

export * from './product.js';
export * from './intent.js';
export * from './optimizer.js';

