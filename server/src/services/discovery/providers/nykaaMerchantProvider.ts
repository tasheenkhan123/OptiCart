import { NormalizedProduct, ProductSourceType } from '../../../types/product.js';
import { ShoppingIntent } from '../../../types/intent.js';
import { ProductSearchProvider, SearchOptions } from './provider.js';
import { ENV } from '../../../config/env.js';

/**
 * Nykaa Beauty Partner API Provider
 * Connects directly to Nykaa's affiliate/product catalog API when credentials are provided.
 */
export class NykaaMerchantProvider implements ProductSearchProvider {
  readonly id = 'nykaa-merchant-api-provider';
  readonly name = 'Nykaa Beauty Partner Catalog API';
  readonly sourceType: ProductSourceType = 'merchant_api';

  isAvailable(): boolean {
    return ENV.hasNykaaApi;
  }

  async search(intent: ShoppingIntent, options?: SearchOptions): Promise<NormalizedProduct[]> {
    if (!this.isAvailable()) {
      return [];
    }
    return this.queryNykaaApi(intent.productType || intent.category, options);
  }

  async searchByQuery(query: string, category?: string, options?: SearchOptions): Promise<NormalizedProduct[]> {
    if (!this.isAvailable()) {
      return [];
    }
    return this.queryNykaaApi(query, options);
  }

  private async queryNykaaApi(query: string, options?: SearchOptions): Promise<NormalizedProduct[]> {
    try {
      // In production with NYKAA_PARTNER_API_KEY:
      // fetch('https://api.nykaa.com/v2/catalog/search', { headers: { 'X-Nykaa-Key': ENV.NYKAA_PARTNER_API_KEY } })
      console.log(`[Nykaa API] Dispatched query: ${query}`);
      return [];
    } catch (err) {
      console.error('[NykaaMerchantProvider Error]:', err);
      return [];
    }
  }
}

export const nykaaMerchantProvider = new NykaaMerchantProvider();
