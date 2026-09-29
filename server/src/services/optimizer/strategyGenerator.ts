import { NormalizedProduct } from '../../types/product.js';
import { ShoppingIntent } from '../../types/intent.js';
import { PurchaseStrategyResult, PurchaseStrategyType } from '../../types/optimizer.js';
import { BasketEngine, EvaluatedBasket } from './basketEngine.js';

export class StrategyGenerator {
  /**
   * Generates all 3 core purchase strategies from candidate products
   */
  static generateStrategies(
    candidateProducts: NormalizedProduct[],
    intent: ShoppingIntent
  ): PurchaseStrategyResult[] {
    if (!candidateProducts || candidateProducts.length === 0) {
      return [];
    }

    const strategies: PurchaseStrategyResult[] = [];
    const getBasketSignature = (b: EvaluatedBasket): string => {
      return b.items.map((it) => it.id || it.title).sort().join('::');
    };

    if (intent.isMultiItem) {
      const seenSignatures = new Set<string>();

      // Option 1: Top Best Value Basket
      const bestValueBaskets = BasketEngine.buildCandidateBaskets(candidateProducts, intent, 'BEST_VALUE');
      bestValueBaskets.sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore);
      const b1 = bestValueBaskets[0] || this.fallbackBasket(candidateProducts[0], intent);
      strategies.push(this.buildStrategyResult('BEST_VALUE', b1, intent));
      seenSignatures.add(getBasketSignature(b1));

      // Option 2: Brand / Quality alternative combination
      const brandBaskets = BasketEngine.buildCandidateBaskets(candidateProducts, intent, 'BEST_FOR_BRANDS');
      brandBaskets.sort((a, b) => {
        const aBrandScore = a.scoreBreakdown.brandScore;
        const bBrandScore = b.scoreBreakdown.brandScore;
        if (aBrandScore !== bBrandScore) return bBrandScore - aBrandScore;
        return b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore;
      });
      const b2 = brandBaskets.find((b) => !seenSignatures.has(getBasketSignature(b))) ||
                 bestValueBaskets.find((b) => !seenSignatures.has(getBasketSignature(b)));
      if (b2) {
        strategies.push(this.buildStrategyResult('BEST_FOR_BRANDS', b2, intent));
        seenSignatures.add(getBasketSignature(b2));
      }

      // Option 3: Maximum Savings / Economy alternative combination
      const savingsBaskets = BasketEngine.buildCandidateBaskets(candidateProducts, intent, 'MAXIMUM_SAVINGS');
      savingsBaskets.sort((a, b) => {
        if (a.effectiveTotal !== b.effectiveTotal) {
          return a.effectiveTotal - b.effectiveTotal; // Lowest effective price first
        }
        return b.scoreBreakdown.savingsScore - a.scoreBreakdown.savingsScore;
      });
      const b3 = savingsBaskets.find((b) => !seenSignatures.has(getBasketSignature(b))) ||
                 bestValueBaskets.find((b) => !seenSignatures.has(getBasketSignature(b)));
      if (b3) {
        strategies.push(this.buildStrategyResult('MAXIMUM_SAVINGS', b3, intent));
        seenSignatures.add(getBasketSignature(b3));
      }

      return strategies;
    }

    // Single item request: Build 3 core strategies
    const bestValueBaskets = BasketEngine.buildCandidateBaskets(candidateProducts, intent, 'BEST_VALUE');
    bestValueBaskets.sort((a, b) => b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore);
    const selectedBestValue = bestValueBaskets[0] || this.fallbackBasket(candidateProducts[0], intent);
    strategies.push(this.buildStrategyResult('BEST_VALUE', selectedBestValue, intent));

    const brandBaskets = BasketEngine.buildCandidateBaskets(candidateProducts, intent, 'BEST_FOR_BRANDS');
    brandBaskets.sort((a, b) => {
      const aBrandScore = a.scoreBreakdown.brandScore;
      const bBrandScore = b.scoreBreakdown.brandScore;
      if (aBrandScore !== bBrandScore) return bBrandScore - aBrandScore;
      return b.scoreBreakdown.overallScore - a.scoreBreakdown.overallScore;
    });
    const selectedBrand = brandBaskets[0] || selectedBestValue;
    strategies.push(this.buildStrategyResult('BEST_FOR_BRANDS', selectedBrand, intent));

    const savingsBaskets = BasketEngine.buildCandidateBaskets(candidateProducts, intent, 'MAXIMUM_SAVINGS');
    savingsBaskets.sort((a, b) => {
      if (a.effectiveTotal !== b.effectiveTotal) {
        return a.effectiveTotal - b.effectiveTotal;
      }
      return b.scoreBreakdown.savingsScore - a.scoreBreakdown.savingsScore;
    });
    const selectedSavings = savingsBaskets[0] || selectedBestValue;
    strategies.push(this.buildStrategyResult('MAXIMUM_SAVINGS', selectedSavings, intent));

    return strategies;
  }

  private static buildStrategyResult(
    strategy: PurchaseStrategyType,
    basket: EvaluatedBasket,
    intent: ShoppingIntent
  ): PurchaseStrategyResult {
    const itemNames = basket.items.map((i) => i.title).join(' + ');
    const brands = Array.from(new Set(basket.items.map((i) => i.brand))).join(', ');
    const merchants = Array.from(new Set(basket.items.map((i) => i.merchantName))).join(', ');
    const budgetAmount = intent.budget?.amount;

    let title = '';
    let tagline = '';
    let description = '';
    const highlights: string[] = [];
    const tradeoffs: string[] = [];
    let explanation = '';

    const currencySymbol = '₹';
    const formattedEffective = `${currencySymbol}${basket.effectiveTotal.toLocaleString('en-IN')}`;
    const formattedSavings = `${currencySymbol}${(basket.totalDiscount + basket.paymentSavings).toLocaleString('en-IN')}`;
    const formattedHeadroom = `${currencySymbol}${Math.max(0, basket.budgetHeadroom).toLocaleString('en-IN')}`;

    switch (strategy) {
      case 'BEST_VALUE':
        title = 'Best Value Champion';
        tagline = 'Optimal balance of product quality, ratings, and price.';
        description = `Curated selection providing the best value-per-rupee ratio across ${merchants}.`;
        
        if (basket.isMultiItem && basket.merchantSplit && basket.merchantSplit.length > 0) {
          highlights.push(`🛒 Multi-Item Basket: ${basket.items.length} items across ${basket.merchantSplit.length} merchant(s)`);
          highlights.push(`🏪 Merchant Split: ${basket.merchantSplit.map(m => `${m.merchantName} (${m.itemCount} item${m.itemCount > 1 ? 's' : ''}: ${currencySymbol}${m.effectiveTotal.toLocaleString('en-IN')})`).join(' | ')}`);
        }

        highlights.push(`Overall Score: ${basket.scoreBreakdown.overallScore}/100 with strong ratings (avg ${(basket.items.reduce((s, i) => s + (i.rating || 4.5), 0) / basket.items.length).toFixed(1)}/5)`);
        if (basket.paymentSavings > 0) {
          highlights.push(`💳 Price Math: Listed ${currencySymbol}${basket.subtotal.toLocaleString('en-IN')} - ${currencySymbol}${basket.paymentSavings.toLocaleString('en-IN')} Razorpay Benefit = ${formattedEffective} Effective Purchase Price`);
        } else {
          highlights.push(`Effective Cost: ${formattedEffective}`);
        }
        if (budgetAmount) {
          highlights.push(`Fits comfortably within your ${currencySymbol}${budgetAmount.toLocaleString('en-IN')} budget (${formattedHeadroom} headroom)`);
        }

        tradeoffs.push(`Selected for maximum real-world reliability rather than solely chasing the lowest bargain.`);
        
        explanation = basket.isMultiItem
          ? `Optimized complete basket across ${merchants}. Delivers quality items with balanced ratings and verified merchant trust. Total effective outlay comes down to ${formattedEffective} after ₹${basket.paymentSavings.toLocaleString('en-IN')} in Razorpay benefits.`
          : `Selected because it delivers excellent quality and verified trust scores (${basket.scoreBreakdown.merchantScore}/100) from ${merchants}. ${basket.paymentSavings > 0 ? `After factoring in ₹${basket.paymentSavings.toLocaleString('en-IN')} in applicable Razorpay payment benefits, the effective price comes down from ₹${basket.subtotal.toLocaleString('en-IN')} to just ${formattedEffective}, delivering superior value.` : `At ${formattedEffective}, you secure top-tier options within budget.`}`;
        break;

      case 'BEST_FOR_BRANDS':
        title = 'Best for Your Brands';
        tagline = intent.preferredBrands?.length
          ? `Top-rated configuration prioritizing ${intent.preferredBrands.join(' & ')}.`
          : 'Premium branded setup from top industry leaders.';
        description = `Tailored for brand reliability, official merchant warranties, and quality.`;

        if (basket.isMultiItem && basket.merchantSplit && basket.merchantSplit.length > 0) {
          highlights.push(`🛒 Multi-Item Brand Cart: ${basket.items.length} items across ${basket.merchantSplit.length} merchant(s)`);
          highlights.push(`🏪 Cart Split: ${basket.merchantSplit.map(m => `${m.merchantName} (${currencySymbol}${m.effectiveTotal.toLocaleString('en-IN')})`).join(' | ')}`);
        }

        highlights.push(`Brand alignment: ${brands} (${basket.scoreBreakdown.brandScore}/100 brand score)`);
        highlights.push(`Direct official warranty & merchant reliability via ${merchants}`);
        if (basket.paymentSavings > 0) {
          highlights.push(`💳 Effective Price: ${formattedEffective} (Listed: ${currencySymbol}${basket.subtotal.toLocaleString('en-IN')} - ${currencySymbol}${basket.paymentSavings.toLocaleString('en-IN')} Benefit)`);
        } else {
          highlights.push(`Effective Price: ${formattedEffective}`);
        }

        tradeoffs.push(`Brand focus may command a slight premium over unbranded generic alternatives.`);

        explanation = basket.isMultiItem
          ? `Selected to prioritize your preferred brands (${brands}) across the entire cart. Sourced via ${merchants} with direct official manufacturer warranty at an effective total of ${formattedEffective}.`
          : `Chosen because it directly prioritizes ${brands}, offering peace of mind, strong build quality, and verified support while staying within your budget envelope.`;
        break;

      case 'MAXIMUM_SAVINGS':
        title = 'Maximum Savings & Smart Economy';
        tagline = 'Lowest effective out-of-pocket spend with maximum discount realization.';
        description = `Strategically combines instant merchant discounts, Razorpay bank offers, and budget headroom.`;

        if (basket.isMultiItem && basket.merchantSplit && basket.merchantSplit.length > 0) {
          highlights.push(`🛒 Multi-Item Savings Cart: ${basket.items.length} items across ${basket.merchantSplit.length} merchant(s)`);
          highlights.push(`🏪 Lowest Outlay Split: ${basket.merchantSplit.map(m => `${m.merchantName} (${currencySymbol}${m.effectiveTotal.toLocaleString('en-IN')})`).join(' | ')}`);
        }

        highlights.push(`Lowest Effective Outlay: ${formattedEffective}`);
        if (basket.paymentSavings > 0) {
          highlights.push(`💳 Price Math: Listed ${currencySymbol}${basket.subtotal.toLocaleString('en-IN')} - ${currencySymbol}${basket.paymentSavings.toLocaleString('en-IN')} Payment Benefit = ${formattedEffective} Net Cost`);
        }
        highlights.push(`Total Combined Savings: ${formattedSavings} (${currencySymbol}${basket.totalDiscount.toLocaleString('en-IN')} catalog discount + ${currencySymbol}${basket.paymentSavings.toLocaleString('en-IN')} payment offers)`);
        if (budgetAmount) {
          highlights.push(`Leaves ${formattedHeadroom} unspent budget in your pocket`);
        }

        tradeoffs.push(`Prioritizes net effective cost efficiency and budget retention over cosmetic extras.`);

        explanation = basket.isMultiItem
          ? `Engineered specifically to minimize total out-of-pocket spend across all ${basket.items.length} items. Sourcing from ${merchants} minimizes the effective cart total down to ${formattedEffective} with ${formattedSavings} in combined savings.`
          : `Selected specifically to minimize your net expenditure. By evaluating the effective purchase price (Listed ₹${basket.subtotal.toLocaleString('en-IN')} - ₹${basket.paymentSavings.toLocaleString('en-IN')} Razorpay benefit = ${formattedEffective}), you get the lowest possible out-of-pocket spend on ${merchants}.`;
        break;
    }

    return {
      strategy,
      title,
      tagline,
      description,
      items: basket.items,
      subtotal: basket.subtotal,
      totalDiscount: basket.totalDiscount,
      razorpaySavingsEstimate: basket.paymentSavings,
      effectiveTotal: basket.effectiveTotal,
      budgetHeadroom: basket.budgetHeadroom,
      explanation,
      scoreBreakdown: basket.scoreBreakdown,
      highlights,
      tradeoffs,
      isMultiItem: basket.isMultiItem,
      merchantSplit: basket.merchantSplit,
    };
  }

  private static fallbackBasket(product: NormalizedProduct, intent: ShoppingIntent): EvaluatedBasket {
    const originalTotal = product.originalPrice || product.price;
    const totalDiscount = Math.max(0, originalTotal - product.price);
    const effectiveTotal = product.price;
    const budgetHeadroom = intent.budget?.amount ? intent.budget.amount - effectiveTotal : 0;

    return {
      items: [product],
      subtotal: product.price,
      originalTotal,
      totalDiscount,
      paymentSavings: 0,
      effectiveTotal,
      budgetHeadroom,
      scoreBreakdown: {
        qualityScore: 80,
        brandScore: 70,
        savingsScore: 75,
        merchantScore: 85,
        deliveryScore: 80,
        overallScore: 78,
      },
      itemEvaluations: [],
    };
  }
}
