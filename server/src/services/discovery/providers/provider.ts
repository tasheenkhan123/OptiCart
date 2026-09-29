import { NormalizedProduct, ProductSourceType } from '../../../types/product.js';
import { ShoppingIntent } from '../../../types/intent.js';

export interface SearchOptions {
  limit?: number;
  offset?: number;
  includeOutOfStock?: boolean;
}

/**
 * Interface for all Product Search Providers
 * Implemented by Mock Catalog, Web Search Adapters, and Direct Merchant API Adapters.
 */
export interface ProductSearchProvider {
  /** Unique provider identifier */
  readonly id: string;

  /** Human-readable provider name (e.g., 'Mock Multi-Merchant Catalog', 'Amazon Partner API') */
  readonly name: string;

  /** Explicit classification of source data */
  readonly sourceType: ProductSourceType;

  /** Whether this provider is currently configured and operational */
  isAvailable(): boolean;

  /** Execute product discovery based on structured ShoppingIntent */
  search(intent: ShoppingIntent, options?: SearchOptions): Promise<NormalizedProduct[]>;

  /** Execute direct keyword or category search */
  searchByQuery(query: string, category?: string, options?: SearchOptions): Promise<NormalizedProduct[]>;
}
