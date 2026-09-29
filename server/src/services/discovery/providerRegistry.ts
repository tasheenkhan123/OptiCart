import { NormalizedProduct, DiscoverySourceSummary, ProductSourceType } from '../../types/product.js';
import { ShoppingIntent } from '../../types/intent.js';
import { ProductSearchProvider, SearchOptions } from './providers/provider.js';
import { mockCatalogProvider } from './providers/mockCatalogProvider.js';
import { webSearchGroundingProvider } from './providers/webSearchGroundingProvider.js';
import { amazonPartnerProvider } from './providers/amazonPartnerProvider.js';
import { cromaMerchantProvider } from './providers/cromaMerchantProvider.js';
import { nykaaMerchantProvider } from './providers/nykaaMerchantProvider.js';

export interface MultiProviderSearchResult {
  products: NormalizedProduct[];
  sources: DiscoverySourceSummary[];
}

/**
 * Provider Registry
 * Manages registered product search providers and orchestrates multi-source concurrent search.
 */
export class ProviderRegistry {
  private providers: Map<string, ProductSearchProvider> = new Map();

  constructor() {
    // 1. Register Mock Multi-Merchant Catalog (sourceType: 'mock', always active)
    this.registerProvider(mockCatalogProvider);

    // 2. Register Live Web Search Grounding Provider (sourceType: 'web_search', active when GEMINI_API_KEY present)
    this.registerProvider(webSearchGroundingProvider);

    // 3. Register Amazon India PA-API 5.0 Adapter (sourceType: 'merchant_api', active when AMAZON_PAAPI_* present)
    this.registerProvider(amazonPartnerProvider);

    // 4. Register Croma Partner API Adapter (sourceType: 'merchant_api', active when CROMA_PARTNER_API_KEY present)
    this.registerProvider(cromaMerchantProvider);

    // 5. Register Nykaa Beauty API Adapter (sourceType: 'merchant_api', active when NYKAA_PARTNER_API_KEY present)
    this.registerProvider(nykaaMerchantProvider);
  }

  /**
   * Register a new search provider
   */
  registerProvider(provider: ProductSearchProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Unregister a provider by id
   */
  unregisterProvider(providerId: string): boolean {
    return this.providers.delete(providerId);
  }

  /**
   * Get a registered provider by id
   */
  getProvider(providerId: string): ProductSearchProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * List all registered providers with their availability, sourceType, and connection status
   */
  listProviders(): {
    id: string;
    name: string;
    sourceType: ProductSourceType;
    available: boolean;
    statusDescription: string;
  }[] {
    return Array.from(this.providers.values()).map((p) => {
      const isAvailable = p.isAvailable();
      let statusDescription = 'Active & Connected';

      if (!isAvailable) {
        if (p.id === 'amazon-partner-api-provider') {
          statusDescription = 'Placeholder (Requires AMAZON_PAAPI_KEY in .env)';
        } else if (p.id === 'croma-merchant-api-provider') {
          statusDescription = 'Placeholder (Requires CROMA_PARTNER_API_KEY in .env)';
        } else if (p.id === 'nykaa-merchant-api-provider') {
          statusDescription = 'Placeholder (Requires NYKAA_PARTNER_API_KEY in .env)';
        } else if (p.id === 'google-search-grounding-provider') {
          statusDescription = 'Placeholder (Requires GEMINI_API_KEY in .env)';
        } else {
          statusDescription = 'Inactive / Not configured';
        }
      }

      return {
        id: p.id,
        name: p.name,
        sourceType: p.sourceType,
        available: isAvailable,
        statusDescription,
      };
    });
  }

  /**
   * Execute search across all available providers concurrently
   */
  async searchAll(intent: ShoppingIntent, options?: SearchOptions): Promise<MultiProviderSearchResult> {
    const activeProviders = Array.from(this.providers.values()).filter((p) => p.isAvailable());

    const searchPromises = activeProviders.map(async (provider) => {
      try {
        const results = await provider.search(intent, options);
        return {
          providerId: provider.id,
          providerName: provider.name,
          sourceType: provider.sourceType,
          products: results,
          error: null,
        };
      } catch (err) {
        return {
          providerId: provider.id,
          providerName: provider.name,
          sourceType: provider.sourceType,
          products: [] as NormalizedProduct[],
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    const settledResults = await Promise.all(searchPromises);

    const aggregatedProducts: NormalizedProduct[] = [];
    const sourceSummaries: DiscoverySourceSummary[] = [];

    // Also include inactive providers in the source summary so callers know their status
    for (const provider of this.providers.values()) {
      const activeResult = settledResults.find((r) => r.providerId === provider.id);
      if (activeResult) {
        sourceSummaries.push({
          name: activeResult.providerName,
          sourceType: activeResult.sourceType,
          count: activeResult.products.length,
          isAvailable: activeResult.error === null,
        });

        if (activeResult.products.length > 0) {
          aggregatedProducts.push(...activeResult.products);
        }
      } else {
        sourceSummaries.push({
          name: provider.name,
          sourceType: provider.sourceType,
          count: 0,
          isAvailable: false,
        });
      }
    }

    return {
      products: aggregatedProducts,
      sources: sourceSummaries,
    };
  }

  /**
   * Execute direct keyword query search across all available providers concurrently
   */
  async searchByQueryAll(query: string, category?: string, options?: SearchOptions): Promise<MultiProviderSearchResult> {
    const activeProviders = Array.from(this.providers.values()).filter((p) => p.isAvailable());

    const searchPromises = activeProviders.map(async (provider) => {
      try {
        const results = await provider.searchByQuery(query, category, options);
        return {
          providerId: provider.id,
          providerName: provider.name,
          sourceType: provider.sourceType,
          products: results,
          error: null,
        };
      } catch (err) {
        return {
          providerId: provider.id,
          providerName: provider.name,
          sourceType: provider.sourceType,
          products: [] as NormalizedProduct[],
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    const settledResults = await Promise.all(searchPromises);

    const aggregatedProducts: NormalizedProduct[] = [];
    const sourceSummaries: DiscoverySourceSummary[] = [];

    for (const provider of this.providers.values()) {
      const activeResult = settledResults.find((r) => r.providerId === provider.id);
      if (activeResult) {
        sourceSummaries.push({
          name: activeResult.providerName,
          sourceType: activeResult.sourceType,
          count: activeResult.products.length,
          isAvailable: activeResult.error === null,
        });

        if (activeResult.products.length > 0) {
          aggregatedProducts.push(...activeResult.products);
        }
      } else {
        sourceSummaries.push({
          name: provider.name,
          sourceType: provider.sourceType,
          count: 0,
          isAvailable: false,
        });
      }
    }

    return {
      products: aggregatedProducts,
      sources: sourceSummaries,
    };
  }
}

export const providerRegistry = new ProviderRegistry();
