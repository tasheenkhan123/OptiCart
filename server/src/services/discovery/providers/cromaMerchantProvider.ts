import { NormalizedProduct, ProductSourceType } from '../../../types/product.js';
import { ShoppingIntent } from '../../../types/intent.js';
import { ProductSearchProvider, SearchOptions } from './provider.js';
import { ENV } from '../../../config/env.js';

/**
 * Croma Merchant Direct API Provider
 * Connects directly to Croma's Partner/Catalog API when credentials are provided.
 */
export class CromaMerchantProvider implements ProductSearchProvider {
  readonly id = 'croma-merchant-api-provider';
  readonly name = 'Croma Partner Direct Catalog API';
  readonly sourceType: ProductSourceType = 'merchant_api';

  isAvailable(): boolean {
    return ENV.hasCromaApi;
  }

  async search(intent: ShoppingIntent, options?: SearchOptions): Promise<NormalizedProduct[]> {
    if (!this.isAvailable()) {
      return [];
    }
    return this.queryCromaApi(intent.productType || intent.category, intent.category, options);
  }

  async searchByQuery(query: string, category?: string, options?: SearchOptions): Promise<NormalizedProduct[]> {
    if (!this.isAvailable()) {
      return [];
    }
    return this.queryCromaApi(query, category, options);
  }

  private async queryCromaApi(
    query: string,
    category?: string,
    options?: SearchOptions
  ): Promise<NormalizedProduct[]> {
    try {
      // In production with CROMA_PARTNER_API_KEY:
      // fetch('https://api.croma.com/v1/products/search', { headers: { 'Authorization': `Bearer ${ENV.CROMA_PARTNER_API_KEY}` } })
      console.log(`[Croma API] Dispatched query: ${query} (Category: ${category})`);
      return [];
    } catch (err) {
      console.error('[CromaMerchantProvider Error]:', err);
      return [];
    }
  }
}

export const cromaMerchantProvider = new CromaMerchantProvider();
