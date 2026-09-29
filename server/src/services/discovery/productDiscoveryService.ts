import { ShoppingIntent } from '../../types/intent.js';
import {
  DiscoveryResult,
  NormalizedProduct,
  ProductFilterOptions,
} from '../../types/product.js';
import { providerRegistry, ProviderRegistry } from './providerRegistry.js';
import { ProductNormalizer } from './normalizer.js';
import { ProductFilterEngine } from './filterEngine.js';
import { SearchOptions } from './providers/provider.js';
import { DynamicProductSynthesizer } from './dynamicProductSynthesizer.js';
import { getCuratedProductImage } from '../../utils/productImages.js';
import { buildVerifiedMerchantUrl } from '../../utils/merchantUrls.js';

export class ProductDiscoveryService {
  private registry: ProviderRegistry;

  constructor(registry: ProviderRegistry = providerRegistry) {
    this.registry = registry;
  }

  static async discoverProducts(intent: ShoppingIntent, options?: SearchOptions): Promise<DiscoveryResult> {
    const service = new ProductDiscoveryService();
    return service.discoverByIntent(intent, options);
  }

  /**
   * Primary Discovery Entrypoint:
   * Takes a structured ShoppingIntent, searches across all active search providers,
   * normalizes all candidate products, filters against constraints, and returns a structured DiscoveryResult.
   */
  async discoverByIntent(intent: ShoppingIntent, options?: SearchOptions): Promise<DiscoveryResult> {
    // If multi-item intent with multiple items, search per item requirement
    if (intent.isMultiItem && intent.items && intent.items.length > 1) {
      const allFoundProducts: NormalizedProduct[] = [];
      const combinedSourcesMap = new Map<string, import('../../types/product.js').DiscoverySourceSummary>();

      for (const itemReq of intent.items) {
        const subIntent: ShoppingIntent = {
          ...intent,
          category: itemReq.category || intent.category,
          productType: itemReq.name,
          preferredBrands: itemReq.preferredBrands || intent.preferredBrands,
          isMultiItem: false,
          items: undefined,
        };

        const { products: rawProducts, sources } = await this.registry.searchAll(subIntent, options);
        let normalized = rawProducts.map((p) => {
          const norm = ProductNormalizer.normalize(p);
          norm.targetItemId = itemReq.id || itemReq.name;
          norm.itemRequirementName = itemReq.name;
          norm.imageUrl = norm.imageUrl || getCuratedProductImage(norm.category, norm.title, norm.brand);
          norm.productUrl = buildVerifiedMerchantUrl(norm.merchantName, norm.title, norm.brand, norm.merchantDomain, norm.productUrl);
          norm.sourceUrl = buildVerifiedMerchantUrl(norm.merchantName, norm.title, norm.brand, norm.merchantDomain, norm.sourceUrl);
          return norm;
        });

        const deduplicated = ProductNormalizer.deduplicate(normalized);
        const filterOptions = ProductFilterEngine.extractFilterOptions(subIntent);
        const { passed } = ProductFilterEngine.applyFilters(deduplicated, filterOptions, subIntent);

        // If fewer than needed found, synthesize for this item requirement
        if (passed.length < 2) {
          const needed = 3 - passed.length;
          const synthesized = DynamicProductSynthesizer.synthesizeProducts(subIntent, needed);
          synthesized.forEach((s) => {
            s.targetItemId = itemReq.id || itemReq.name;
            s.itemRequirementName = itemReq.name;
            passed.push(s);
          });
        }

        // Ensure tagged products are added
        passed.forEach((p) => {
          p.targetItemId = itemReq.id || itemReq.name;
          p.itemRequirementName = itemReq.name;
          allFoundProducts.push(p);
        });

        sources.forEach((s) => {
          const existing = combinedSourcesMap.get(s.name);
          if (existing) {
            existing.count += s.count;
          } else {
            combinedSourcesMap.set(s.name, { ...s });
          }
        });
      }

      const sources = Array.from(combinedSourcesMap.values());
      const filterOptions = ProductFilterEngine.extractFilterOptions(intent);

      return {
        products: allFoundProducts,
        totalFound: allFoundProducts.length,
        filteredCount: allFoundProducts.length,
        sources,
        appliedFilters: filterOptions,
        intentSummary: intent.summary || `${intent.category} (${intent.items.map((i) => i.name).join(' + ')})`,
        timestamp: new Date().toISOString(),
      };
    }

    // 1. Single Item: Search all available providers concurrently
    const { products: rawProducts, sources } = await this.registry.searchAll(intent, options);

    // 2. Normalize and standardize each candidate product
    const normalizedProducts = rawProducts.map((p) => {
      const norm = ProductNormalizer.normalize(p);
      norm.imageUrl = norm.imageUrl || getCuratedProductImage(norm.category, norm.title, norm.brand);
      norm.productUrl = buildVerifiedMerchantUrl(norm.merchantName, norm.title, norm.brand, norm.merchantDomain, norm.productUrl);
      norm.sourceUrl = buildVerifiedMerchantUrl(norm.merchantName, norm.title, norm.brand, norm.merchantDomain, norm.sourceUrl);
      return norm;
    });

    // 3. Deduplicate across multiple merchants/sources
    const deduplicatedProducts = ProductNormalizer.deduplicate(normalizedProducts);

    // 4. Extract filter constraints from ShoppingIntent
    const filterOptions = ProductFilterEngine.extractFilterOptions(intent);

    // 5. Apply deterministic filters (budget ceiling, excluded brands, category relevance, stock)
    const { passed, appliedFilters } = ProductFilterEngine.applyFilters(
      deduplicatedProducts,
      filterOptions,
      intent
    );

    // 6. If fewer than requested options matched, dynamically synthesize options tailored to intent
    const neededCount = Math.max(3, intent.requestedResultCount || 3);
    if (passed.length < neededCount) {
      const needed = neededCount - passed.length;
      const synthesized = DynamicProductSynthesizer.synthesizeProducts(intent, needed);
      passed.push(...synthesized);
    }

    return {
      products: passed,
      totalFound: rawProducts.length + (passed.length > rawProducts.length ? passed.length - rawProducts.length : 0),
      filteredCount: passed.length,
      sources,
      appliedFilters,
      intentSummary: intent.summary || `${intent.category} (${intent.productType || 'any'})`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Direct Keyword / Category Discovery Entrypoint:
   * Useful for ad-hoc search queries or direct category browsing.
   */
  async searchByQuery(
    query: string,
    category?: string,
    customFilters?: Partial<ProductFilterOptions>,
    options?: SearchOptions
  ): Promise<DiscoveryResult> {
    // 1. Search providers
    const { products: rawProducts, sources } = await this.registry.searchByQueryAll(query, category, options);

    // 2. Normalize
    const normalizedProducts = rawProducts.map((p) => {
      const norm = ProductNormalizer.normalize(p);
      norm.imageUrl = norm.imageUrl || getCuratedProductImage(norm.category, norm.title, norm.brand);
      norm.productUrl = buildVerifiedMerchantUrl(norm.merchantName, norm.title, norm.brand, norm.merchantDomain, norm.productUrl);
      norm.sourceUrl = buildVerifiedMerchantUrl(norm.merchantName, norm.title, norm.brand, norm.merchantDomain, norm.sourceUrl);
      return norm;
    });

    // 3. Deduplicate
    const deduplicatedProducts = ProductNormalizer.deduplicate(normalizedProducts);

    // 4. Build filters
    const filterOptions: ProductFilterOptions = {
      category: category || customFilters?.category,
      minPrice: customFilters?.minPrice,
      maxPrice: customFilters?.maxPrice,
      preferredBrands: customFilters?.preferredBrands,
      excludedBrands: customFilters?.excludedBrands,
      qualityPreference: customFilters?.qualityPreference,
      inStockOnly: customFilters?.inStockOnly ?? true,
    };

    // 5. Apply filters
    const { passed, appliedFilters } = ProductFilterEngine.applyFilters(
      deduplicatedProducts,
      filterOptions
    );

    return {
      products: passed,
      totalFound: rawProducts.length,
      filteredCount: passed.length,
      sources,
      appliedFilters,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all registered providers and their current status
   */
  getAvailableProviders() {
    return this.registry.listProviders();
  }
}

export const productDiscoveryService = new ProductDiscoveryService();
