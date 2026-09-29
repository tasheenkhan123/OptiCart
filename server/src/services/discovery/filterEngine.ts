import { NormalizedProduct, ProductFilterOptions } from '../../types/product.js';
import { ShoppingIntent } from '../../types/intent.js';

export interface FilterResult {
  passed: NormalizedProduct[];
  filteredOutCount: number;
  appliedFilters: ProductFilterOptions;
}

/**
 * Product Filter Engine
 * Applies deterministic constraints (category, budget bounds, brand filters, quality tier, delivery)
 * derived from the structured ShoppingIntent.
 */
export class ProductFilterEngine {
  /**
   * Derive filter options from a structured ShoppingIntent
   */
  static extractFilterOptions(intent: ShoppingIntent): ProductFilterOptions {
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (intent.budget) {
      if (typeof intent.budget.amount === 'number' && intent.budget.amount > 0) {
        // If flexible, allow 10% ceiling headroom
        const ceilingMultiplier = intent.budget.isFlexible ? 1.10 : 1.05;
        maxPrice = Math.round(intent.budget.amount * ceilingMultiplier);
      }
    }

    return {
      category: intent.category,
      minPrice,
      maxPrice,
      preferredBrands: intent.preferredBrands && intent.preferredBrands.length > 0 ? intent.preferredBrands : undefined,
      excludedBrands: intent.excludedBrands && intent.excludedBrands.length > 0 ? intent.excludedBrands : undefined,
      qualityPreference: intent.qualityPreference,
      inStockOnly: true,
    };
  }

  /**
   * Apply filters to candidate products
   */
  static applyFilters(
    products: NormalizedProduct[],
    filters: ProductFilterOptions,
    intent?: ShoppingIntent
  ): FilterResult {
    let filteredOut = 0;

    const passed = products.filter((product) => {
      // 1. In-stock check
      if (filters.inStockOnly && product.availability === 'out_of_stock') {
        filteredOut++;
        return false;
      }

      // 2. Excluded brands check (Strict filter)
      if (filters.excludedBrands && filters.excludedBrands.length > 0) {
        const isExcluded = filters.excludedBrands.some((excluded) => {
          const ex = excluded.toLowerCase().trim();
          return (
            product.brand.toLowerCase().includes(ex) ||
            product.title.toLowerCase().includes(ex)
          );
        });
        if (isExcluded) {
          filteredOut++;
          return false;
        }
      }

      // 3. Preferred brands check (When brand is specified, filter for matching candidates)
      if (filters.preferredBrands && filters.preferredBrands.length > 0) {
        const anyMatchesPreferred = products.some((p) =>
          filters.preferredBrands!.some((preferred) => {
            const pref = preferred.toLowerCase().trim();
            return (
              p.brand.toLowerCase().includes(pref) ||
              p.title.toLowerCase().includes(pref)
            );
          })
        );

        if (anyMatchesPreferred) {
          const matchesPreferred = filters.preferredBrands.some((preferred) => {
            const pref = preferred.toLowerCase().trim();
            return (
              product.brand.toLowerCase().includes(pref) ||
              product.title.toLowerCase().includes(pref)
            );
          });

          if (!matchesPreferred) {
            filteredOut++;
            return false;
          }
        }
      }

      // 4. Budget constraints check
      if (typeof filters.maxPrice === 'number' && filters.maxPrice > 0) {
        if (product.price > filters.maxPrice) {
          filteredOut++;
          return false;
        }
      }
      if (typeof filters.minPrice === 'number' && filters.minPrice > 0) {
        if (product.price < filters.minPrice) {
          filteredOut++;
          return false;
        }
      }

      // 5. Category relevance check
      if (filters.category && filters.category.trim().length > 0 && filters.category.toLowerCase() !== 'general') {
        const filterCat = filters.category.toLowerCase().trim();
        const prodCat = product.category.toLowerCase().trim();
        const prodTitle = product.title.toLowerCase();

        const isAccessoryFilter =
          filterCat.includes('sleeve') ||
          filterCat.includes('case') ||
          filterCat.includes('cover') ||
          filterCat.includes('bag') ||
          filterCat.includes('stand') ||
          filterCat.includes('mouse') ||
          filterCat.includes('headset') ||
          filterCat.includes('headphone') ||
          filterCat.includes('earbud');

        const isProductAccessory =
          prodTitle.includes('sleeve') ||
          prodTitle.includes('case') ||
          prodTitle.includes('cover') ||
          prodTitle.includes('mouse') ||
          prodTitle.includes('headset') ||
          prodTitle.includes('headphone') ||
          prodTitle.includes('earbud');

        if ((filterCat.includes('laptop') || filterCat.includes('macbook')) && !isAccessoryFilter && isProductAccessory) {
          filteredOut++;
          return false;
        }

        const categoryMatches =
          prodCat.includes(filterCat) ||
          filterCat.includes(prodCat) ||
          prodTitle.includes(filterCat) ||
          this.matchesCategorySynonym(prodCat, filterCat) ||
          this.matchesCategorySynonym(prodTitle, filterCat);

        if (!categoryMatches) {
          filteredOut++;
          return false;
        }
      }

      // 5b. Specific Product Type / Requirement Relevance Check
      if (intent?.productType && intent.productType.trim().length > 0) {
        const pt = intent.productType.toLowerCase().trim();
        const prodTitle = product.title.toLowerCase();

        if (pt.includes('lip balm') || pt.includes('lipbalm') || pt.includes('lip care') || pt.includes('lip butter')) {
          if (!prodTitle.includes('lip') && !prodTitle.includes('balm')) {
            filteredOut++;
            return false;
          }
        } else if (pt.includes('toner')) {
          if (!prodTitle.includes('toner')) {
            filteredOut++;
            return false;
          }
        } else if (pt.includes('cleanser') || pt.includes('face wash') || pt.includes('facewash')) {
          if (!prodTitle.includes('cleanser') && !prodTitle.includes('wash')) {
            filteredOut++;
            return false;
          }
        } else if (pt.includes('sunscreen') || pt.includes('spf')) {
          if (!prodTitle.includes('sunscreen') && !prodTitle.includes('spf')) {
            filteredOut++;
            return false;
          }
        } else if (pt.includes('serum')) {
          if (!prodTitle.includes('serum')) {
            filteredOut++;
            return false;
          }
        } else if (pt.includes('macbook')) {
          if (!prodTitle.includes('macbook')) {
            filteredOut++;
            return false;
          }
        } else if (pt.includes('iphone')) {
          if (!prodTitle.includes('iphone')) {
            filteredOut++;
            return false;
          }
        }
      }

      // 6. Delivery Preference Check
      if (intent?.deliveryPreference === 'fastest') {
        if (product.deliveryInformation?.deliveryDays && product.deliveryInformation.deliveryDays > 2) {
          // Deprioritize rather than eliminate if few results
        }
      }

      return true;
    });

    // Sort passed products:
    // 1. Highest confidence
    // 2. Best rating * merchant trust score
    // 3. Price suitability based on qualityPreference
    passed.sort((a, b) => {
      // If preferred brands exist, prioritize them first
      if (filters.preferredBrands && filters.preferredBrands.length > 0) {
        const aPref = filters.preferredBrands.some((p) => a.brand.toLowerCase().includes(p.toLowerCase()));
        const bPref = filters.preferredBrands.some((p) => b.brand.toLowerCase().includes(p.toLowerCase()));
        if (aPref && !bPref) return -1;
        if (!aPref && bPref) return 1;
      }

      if (filters.qualityPreference === 'budget') {
        return a.price - b.price; // Cheapest first
      }

      if (filters.qualityPreference === 'premium') {
        return b.price - a.price; // Highest tier first
      }

      // Default / Best Value: Weighted score of rating, trust, and confidence
      const scoreA = (a.confidence || 0.9) * 0.4 + ((a.rating || 4.0) / 5) * 0.3 + ((a.merchantTrustScore || 4.5) / 5) * 0.3;
      const scoreB = (b.confidence || 0.9) * 0.4 + ((b.rating || 4.0) / 5) * 0.3 + ((b.merchantTrustScore || 4.5) / 5) * 0.3;
      return scoreB - scoreA;
    });

    return {
      passed,
      filteredOutCount: filteredOut,
      appliedFilters: filters,
    };
  }

  private static matchesCategorySynonym(catA: string, catB: string): boolean {
    const synonyms: Record<string, string[]> = {
      laptops: ['laptop', 'notebook', 'ultrabook', 'macbook', 'pc', 'gaming laptop', 'computer'],
      phones: ['phone', 'smartphone', 'mobile', 'cellphone', '5g phone', 'iphone', 'galaxy'],
      skincare: ['skin', 'skincare', 'serum', 'moisturizer', 'sunscreen', 'cleanser', 'toner', 'cream', 'face wash', 'pimple', 'acne', 'cosmetics', 'beauty', 'face', 'lotion', 'gel'],
      gaming: ['gaming', 'game', 'playstation', 'xbox', 'controller', 'console', 'headset'],
      electronics: ['electronics', 'headphones', 'headset', 'earphones', 'earbuds', 'mouse', 'sleeve', 'audio', 'gadget', 'wearables', 'smartwatch', 'watch'],
      shoes: ['shoe', 'shoes', 'running shoes', 'sneaker', 'sneakers', 'footwear', 'trainers', 'pegasus', 'running'],
      fashion: ['fashion', 'clothing', 'apparel', 'dress', 'summer dress', 'jeans', 'shirt', 'denim', 'wear', 'hoodie', 'top', 't-shirt', 'outfit', 'skirt'],
      groceries: ['groceries', 'grocery', 'food', 'oil', 'nutrition', 'staples', 'personal care'],
      home: ['home', 'living', 'bedsheet', 'lamp', 'kitchen', 'decor', 'appliances', 'cookware'],
    };

    for (const [, list] of Object.entries(synonyms)) {
      const aInList = list.some((term) => catA.includes(term) || term.includes(catA));
      const bInList = list.some((term) => catB.includes(term) || term.includes(catB));
      if (aInList && bInList) return true;
    }

    return false;
  }
}
