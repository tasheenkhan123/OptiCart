import { NormalizedProduct } from '../../types/product.js';
import { ShoppingIntent, ShoppingItemRequirement } from '../../types/intent.js';
import { PurchaseStrategyType, StrategyScoreBreakdown, MerchantCartSplit } from '../../types/optimizer.js';
import { ScoringEngine, EvaluatedProductScore } from './scoringEngine.js';

export interface EvaluatedBasket {
  items: NormalizedProduct[];
  subtotal: number;
  originalTotal: number;
  totalDiscount: number;
  paymentSavings: number;
  effectiveTotal: number;
  budgetHeadroom: number;
  scoreBreakdown: StrategyScoreBreakdown;
  itemEvaluations: EvaluatedProductScore[];
  isMultiItem?: boolean;
  merchantSplit?: MerchantCartSplit[];
}

export class BasketEngine {
  /**
   * Determine whether the intent represents a multi-item routine / setup / bundle
   */
  static isBundleOrRoutine(intent: ShoppingIntent): boolean {
    if (intent.isMultiItem || (intent.items && intent.items.length > 1)) {
      return true;
    }

    const summary = (intent.summary || '').toLowerCase();
    const productType = (intent.productType || '').toLowerCase();
    const category = (intent.category || '').toLowerCase();

    return (
      summary.includes('routine') ||
      summary.includes('setup') ||
      summary.includes('bundle') ||
      summary.includes('kit') ||
      summary.includes('combo') ||
      productType.includes('routine') ||
      productType.includes('setup') ||
      productType.includes('bundle') ||
      (category === 'skincare' && (summary.includes('products') || summary.includes('routine'))) ||
      (intent.quantity !== undefined && intent.quantity > 1)
    );
  }

  /**
   * Evaluates and builds candidate baskets for a strategy
   */
  static buildCandidateBaskets(
    products: NormalizedProduct[],
    intent: ShoppingIntent,
    strategy: PurchaseStrategyType
  ): EvaluatedBasket[] {
    // 1. Check for structured Multi-Item Basket Request (e.g. Laptop + Mouse + Sleeve)
    if (intent.isMultiItem && intent.items && intent.items.length > 1) {
      return this.buildStructuredMultiItemBaskets(products, intent, strategy);
    }

    const isMulti = this.isBundleOrRoutine(intent);

    if (!isMulti || products.length <= 1) {
      // Single-item evaluation: Evaluate all candidate products and sort according to strategy
      const evaluatedItems = products.map((p) => ScoringEngine.scoreProduct(p, intent, strategy));

      if (strategy === 'MAXIMUM_SAVINGS') {
        evaluatedItems.sort((a, b) => {
          if (a.effectivePrice !== b.effectivePrice) return a.effectivePrice - b.effectivePrice;
          return b.scores.savingsScore - a.scores.savingsScore;
        });
      } else if (strategy === 'BEST_FOR_BRANDS') {
        evaluatedItems.sort((a, b) => {
          if (a.scores.brandScore !== b.scores.brandScore) return b.scores.brandScore - a.scores.brandScore;
          return b.scores.overallScore - a.scores.overallScore;
        });
      } else {
        // BEST_VALUE: Balanced overall score
        evaluatedItems.sort((a, b) => b.scores.overallScore - a.scores.overallScore);
      }

      // Desired number of distinct product recommendations
      const maxResults = Math.min(intent.requestedResultCount || 3, evaluatedItems.length);
      const selectedEvaluated = evaluatedItems.slice(0, maxResults);

      // Label each distinct product for shopper clarity
      const hasPreferredBrand = intent.preferredBrands && intent.preferredBrands.length > 0;
      const labeledProducts: NormalizedProduct[] = selectedEvaluated.map((e, idx) => {
        let label = '';
        if (strategy === 'BEST_VALUE') {
          if (idx === 0) label = hasPreferredBrand ? 'Option #1 (Top Pick)' : 'Best Overall';
          else if (idx === 1) label = hasPreferredBrand ? 'Option #2 (Best Value)' : 'Best Value';
          else if (idx === 2) label = hasPreferredBrand ? 'Option #3 (Premium Choice)' : 'Premium Choice';
          else label = `Option #${idx + 1}`;
        } else if (strategy === 'BEST_FOR_BRANDS') {
          label = idx === 0 ? 'Top Brand Pick' : `Brand Option #${idx + 1}`;
        } else {
          label = idx === 0 ? 'Lowest Outlay' : `Savings Option #${idx + 1}`;
        }

        return {
          ...e.product,
          recommendationLabel: label,
          effectivePrice: e.effectivePrice,
        };
      });

      const topItem = selectedEvaluated[0];
      const topProduct = topItem ? topItem.product : products[0];
      const originalTotal = topProduct.originalPrice || topProduct.price;
      const totalDiscount = Math.max(0, originalTotal - topProduct.price);
      const effectiveTotal = topItem ? topItem.effectivePrice : topProduct.price;
      const budgetHeadroom = intent.budget?.amount ? intent.budget.amount - effectiveTotal : 0;
      const paymentSavings = topItem ? topItem.parsedPaymentSavings : 0;

      const merchantSplit: MerchantCartSplit[] = [
        {
          merchantId: topProduct.merchantName.toLowerCase().replace(/\s+/g, '-'),
          merchantName: topProduct.merchantName,
          merchantDomain: topProduct.merchantDomain,
          itemCount: 1,
          subtotal: topProduct.price,
          paymentSavings,
          paymentDiscount: paymentSavings,
          effectiveTotal,
          effectiveSubtotal: effectiveTotal,
          items: [topProduct],
          checkoutUrl: topProduct.productUrl || BasketEngine.getMerchantSearchUrl(topProduct.merchantName, topProduct.title, topProduct.merchantDomain),
        },
      ];

      return [
        {
          items: labeledProducts,
          subtotal: topProduct.price,
          originalTotal,
          totalDiscount,
          paymentSavings,
          effectiveTotal,
          budgetHeadroom,
          scoreBreakdown: topItem ? topItem.scores : {
            qualityScore: 80,
            brandScore: 70,
            savingsScore: 75,
            merchantScore: 85,
            deliveryScore: 80,
            overallScore: 78,
          },
          itemEvaluations: selectedEvaluated,
          isMultiItem: false,
          merchantSplit,
        },
      ];
    }

    // Heuristic multi-item bundle construction (e.g. skincare routine)
    const evaluatedItems = products.map((p) => ScoringEngine.scoreProduct(p, intent, strategy));
    evaluatedItems.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

    const targetBudget = intent.budget?.amount || 100000;
    const baskets: EvaluatedBasket[] = [];

    // Bundle Option 1: Top items that fit under budget
    let currentBasketItems: EvaluatedProductScore[] = [];
    let runningTotal = 0;

    for (const item of evaluatedItems) {
      if (runningTotal + item.effectivePrice <= targetBudget * 1.05) {
        currentBasketItems.push(item);
        runningTotal += item.effectivePrice;
      }
    }

    if (currentBasketItems.length > 0) {
      baskets.push(this.composeBasket(currentBasketItems, intent));
    }

    // Bundle Option 2: Pair top 2 complementary items
    if (evaluatedItems.length >= 2) {
      const primaryItem = evaluatedItems[0];
      const secondaryItem = evaluatedItems.slice(1).find(
        (it) => it.effectivePrice + primaryItem.effectivePrice <= targetBudget * 1.05
      );

      if (secondaryItem) {
        baskets.push(this.composeBasket([primaryItem, secondaryItem], intent));
      }
    }

    // Also include top standalone items as fallback
    for (const item of evaluatedItems.slice(0, 3)) {
      baskets.push(this.composeBasket([item], intent));
    }

    return baskets;
  }

  /**
   * Combinatorial Multi-Item Cross-Merchant Basket Optimizer
   * Builds candidate baskets selecting 1 product for each required item slot.
   */
  private static buildStructuredMultiItemBaskets(
    products: NormalizedProduct[],
    intent: ShoppingIntent,
    strategy: PurchaseStrategyType
  ): EvaluatedBasket[] {
    const itemRequirements = intent.items || [];
    const targetBudget = intent.budget?.amount;

    // Partition candidate products by requirement
    const slotCandidates: EvaluatedProductScore[][] = [];

    for (const req of itemRequirements) {
      const reqName = req.name.toLowerCase();
      const reqId = req.id;

      // Find candidate products matching this requirement
      const matchingProducts = products.filter((p) => {
        if (p.targetItemId && reqId && p.targetItemId === reqId) return true;
        if (p.itemRequirementName && p.itemRequirementName.toLowerCase() === reqName) return true;

        // Keyword heuristics
        const pTitle = p.title.toLowerCase();
        const pCat = p.category.toLowerCase();

        if (reqName.includes('laptop') && !pTitle.includes('sleeve') && !pTitle.includes('bag') && !pTitle.includes('case') && !pTitle.includes('mouse') && !pTitle.includes('headset') && (pCat.includes('laptop') || pTitle.includes('laptop') || pTitle.includes('macbook'))) return true;
        if (reqName.includes('mouse') && pTitle.includes('mouse')) return true;
        if ((reqName.includes('headset') || reqName.includes('headphone')) && (pTitle.includes('headset') || pTitle.includes('headphone') || pTitle.includes('earbud'))) return true;
        if ((reqName.includes('sleeve') || reqName.includes('bag')) && (pTitle.includes('sleeve') || pTitle.includes('bag') || pTitle.includes('case'))) return true;
        if (reqName.includes('case') && (pTitle.includes('case') || pTitle.includes('cover'))) return true;
        if (reqName.includes('earbud') && (pTitle.includes('earbud') || pTitle.includes('buds') || pTitle.includes('headphone'))) return true;
        if (reqName.includes('toner') && pTitle.includes('toner')) return true;
        if (reqName.includes('cleanser') && (pTitle.includes('cleanser') || pTitle.includes('wash'))) return true;
        if (reqName.includes('moisturizer') && (pTitle.includes('moisturizer') || pTitle.includes('cream'))) return true;
        if (reqName.includes('cream') && (pTitle.includes('cream') || pTitle.includes('moisturizer') || pTitle.includes('gel'))) return true;
        if (reqName.includes('serum') && pTitle.includes('serum')) return true;
        if (reqName.includes('sunscreen') && (pTitle.includes('sunscreen') || pTitle.includes('spf'))) return true;
        if (reqName.includes('dress') && (pTitle.includes('dress') || pTitle.includes('frock') || pTitle.includes('gown'))) return true;
        if (reqName.includes('phone') && (pCat.includes('phone') || pTitle.includes('phone') || pTitle.includes('galaxy') || pTitle.includes('iphone'))) return true;
        if (reqName.includes('shoe') && (pCat.includes('shoe') || pTitle.includes('shoe') || pTitle.includes('running') || pTitle.includes('sneaker'))) return true;
        if (reqName.includes('jean') && (pCat.includes('fashion') || pTitle.includes('jean'))) return true;

        if (pTitle.includes(reqName) || pCat.includes(reqName) || reqName.includes(pCat)) return true;

        return false;
      });

      // Tag matching products with item slot requirement name
      const taggedProducts = matchingProducts.map((p) => ({
        ...p,
        itemRequirementName: req.name,
      }));

      // Score and rank candidates for this slot
      const evaluated = taggedProducts.map((p) => ScoringEngine.scoreProduct(p, intent, strategy));

      // Sort according to strategy
      if (strategy === 'MAXIMUM_SAVINGS') {
        evaluated.sort((a, b) => a.effectivePrice - b.effectivePrice);
      } else if (strategy === 'BEST_FOR_BRANDS') {
        evaluated.sort((a, b) => {
          if (a.scores.brandScore !== b.scores.brandScore) return b.scores.brandScore - a.scores.brandScore;
          return b.scores.overallScore - a.scores.overallScore;
        });
      } else {
        evaluated.sort((a, b) => b.scores.overallScore - a.scores.overallScore);
      }

      // Take top 4 candidates for each slot
      slotCandidates.push(evaluated.slice(0, 4));
    }

    // Check if any required slot has 0 candidates
    const missingSlotIdx = slotCandidates.findIndex((c) => c.length === 0);
    if (missingSlotIdx !== -1) {
      // Fallback: If some slot had 0 matching items, evaluate available candidates
      const fallbackList = products.map((p) => ScoringEngine.scoreProduct(p, intent, strategy));
      return [this.composeBasket(fallbackList.slice(0, itemRequirements.length), intent)];
    }

    // Generate Cartesian product combinations of candidate items across all slots
    const combinations: EvaluatedProductScore[][] = [];

    const generateCombos = (slotIndex: number, currentCombo: EvaluatedProductScore[]) => {
      if (slotIndex === slotCandidates.length) {
        combinations.push([...currentCombo]);
        return;
      }

      for (const candidate of slotCandidates[slotIndex]) {
        generateCombos(slotIndex + 1, [...currentCombo, candidate]);
      }
    };

    generateCombos(0, []);

    // Build EvaluatedBasket for each combination
    const candidateBaskets = combinations.map((combo) => this.composeBasket(combo, intent));

    // Filter combinations by budget tolerance (+5% max) if budget is set
    const validBaskets = targetBudget
      ? candidateBaskets.filter((b) => b.effectiveTotal <= targetBudget * 1.05)
      : candidateBaskets;

    return validBaskets.length > 0 ? validBaskets : candidateBaskets;
  }

  /**
   * Composes and calculates basket-level totals, transparent Razorpay benefits, and merchant split
   */
  private static composeBasket(
    evaluatedItems: EvaluatedProductScore[],
    intent: ShoppingIntent
  ): EvaluatedBasket {
    const items = evaluatedItems.map((e) => e.product);
    const subtotal = items.reduce((sum, it) => sum + it.price, 0);
    const originalTotal = items.reduce((sum, it) => sum + (it.originalPrice || it.price), 0);
    const totalDiscount = Math.max(0, originalTotal - subtotal);
    const paymentSavings = evaluatedItems.reduce((sum, e) => sum + e.parsedPaymentSavings, 0);
    const effectiveTotal = Math.max(0, subtotal - paymentSavings);
    const budgetHeadroom = intent.budget?.amount ? intent.budget.amount - effectiveTotal : 0;
    const isMultiItem = items.length > 1;

    // Group items by merchant for MerchantCartSplit
    const merchantMap = new Map<string, {
      merchantName: string;
      merchantDomain?: string;
      items: NormalizedProduct[];
      subtotal: number;
      paymentSavings: number;
      effectiveTotal: number;
    }>();

    for (let i = 0; i < evaluatedItems.length; i++) {
      const itemScore = evaluatedItems[i];
      const product = itemScore.product;
      const mName = product.merchantName;
      const mDomain = product.merchantDomain;
      const itemSavings = itemScore.parsedPaymentSavings;
      const itemEffective = itemScore.effectivePrice;

      const existing = merchantMap.get(mName);
      if (existing) {
        existing.items.push(product);
        existing.subtotal += product.price;
        existing.paymentSavings += itemSavings;
        existing.effectiveTotal += itemEffective;
      } else {
        merchantMap.set(mName, {
          merchantName: mName,
          merchantDomain: mDomain,
          items: [product],
          subtotal: product.price,
          paymentSavings: itemSavings,
          effectiveTotal: itemEffective,
        });
      }
    }

    const merchantSplit: MerchantCartSplit[] = Array.from(merchantMap.values()).map((m) => ({
      merchantId: m.merchantName.toLowerCase().replace(/\s+/g, '-'),
      merchantName: m.merchantName,
      merchantDomain: m.merchantDomain,
      itemCount: m.items.length,
      subtotal: m.subtotal,
      paymentSavings: m.paymentSavings,
      paymentDiscount: m.paymentSavings,
      effectiveTotal: m.effectiveTotal,
      effectiveSubtotal: m.effectiveTotal,
      items: m.items,
      checkoutUrl: m.items[0]?.productUrl || BasketEngine.getMerchantSearchUrl(m.merchantName, m.items[0]?.title || '', m.merchantDomain),
    }));

    // Aggregate score breakdown across all items
    const count = evaluatedItems.length || 1;
    const avgQuality = Math.round(evaluatedItems.reduce((s, e) => s + e.scores.qualityScore, 0) / count);
    const avgBrand = Math.round(evaluatedItems.reduce((s, e) => s + e.scores.brandScore, 0) / count);
    const avgSavings = Math.round(evaluatedItems.reduce((s, e) => s + e.scores.savingsScore, 0) / count);
    const avgMerchant = Math.round(evaluatedItems.reduce((s, e) => s + e.scores.merchantScore, 0) / count);
    const avgDelivery = Math.round(evaluatedItems.reduce((s, e) => s + e.scores.deliveryScore, 0) / count);
    const avgOverall = Math.round(evaluatedItems.reduce((s, e) => s + e.scores.overallScore, 0) / count);

    return {
      items,
      subtotal,
      originalTotal,
      totalDiscount,
      paymentSavings,
      effectiveTotal,
      budgetHeadroom,
      scoreBreakdown: {
        qualityScore: avgQuality,
        brandScore: avgBrand,
        savingsScore: avgSavings,
        merchantScore: avgMerchant,
        deliveryScore: avgDelivery,
        overallScore: avgOverall,
      },
      itemEvaluations: evaluatedItems,
      isMultiItem,
      merchantSplit,
    };
  }

  /**
   * Helper to construct a clean, merchant-store-specific search URL when direct URL is missing
   */
  static getMerchantSearchUrl(merchantName: string, query: string, merchantDomain?: string): string {
    const q = encodeURIComponent(query.trim());
    const m = (merchantName || '').toLowerCase();
    const d = (merchantDomain || '').toLowerCase();

    if (m.includes('nykaa') || d.includes('nykaa')) {
      return `https://www.nykaa.com/search/result/?q=${q}`;
    }
    if (m.includes('amazon') || d.includes('amazon')) {
      return `https://www.amazon.in/s?k=${q}`;
    }
    if (m.includes('croma') || d.includes('croma')) {
      return `https://www.croma.com/searchB?q=${q}`;
    }
    if (m.includes('reliance') || d.includes('reliancedigital')) {
      return `https://www.reliancedigital.in/search?q=${q}`;
    }
    if (m.includes('myntra') || d.includes('myntra')) {
      return `https://www.myntra.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`;
    }
    if (m.includes('flipkart') || d.includes('flipkart')) {
      return `https://www.flipkart.com/search?q=${q}`;
    }
    if (m.includes('samsung') || d.includes('samsung')) {
      return `https://www.samsung.com/in/search/?searchvalue=${q}`;
    }
    if (merchantDomain && merchantDomain.includes('.')) {
      return `https://${merchantDomain}/search?q=${q}`;
    }
    return `https://www.nykaa.com/search/result/?q=${q}`;
  }
}

