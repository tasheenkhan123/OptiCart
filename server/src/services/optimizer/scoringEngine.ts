import { NormalizedProduct } from '../../types/product.js';
import { ShoppingIntent } from '../../types/intent.js';
import { PurchaseStrategyType, StrategyScoreBreakdown } from '../../types/optimizer.js';

export interface EvaluatedProductScore {
  product: NormalizedProduct;
  scores: StrategyScoreBreakdown;
  parsedPaymentSavings: number;
  effectivePrice: number;
}

export class ScoringEngine {
  /**
   * Parse estimated monetary discount from product payment offers
   */
  static parsePaymentOfferSavings(product: NormalizedProduct): number {
    if (!product.paymentOffers || product.paymentOffers.length === 0) {
      return 0;
    }

    let maxSavings = 0;

    for (const offer of product.paymentOffers) {
      // Check for fixed rupee discount: e.g. "Flat ₹2,500 off", "₹3,000 Instant Cashback", "₹5,000 Instant Bank Offer"
      const fixedMatch = offer.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i);
      if (fixedMatch && fixedMatch[1]) {
        const val = parseFloat(fixedMatch[1].replace(/,/g, ''));
        if (!isNaN(val) && val > 0 && val < product.price * 0.5) {
          maxSavings = Math.max(maxSavings, val);
        }
      }

      // Check for percentage discount: e.g. "10% off with Razorpay", "5% Instant discount"
      const pctMatch = offer.match(/(\d+(?:\.\d+)?)\s*%\s*(?:off|discount|cashback)/i);
      if (pctMatch && pctMatch[1]) {
        const pct = parseFloat(pctMatch[1]);
        if (!isNaN(pct) && pct > 0 && pct <= 50) {
          const calculatedVal = Math.round((product.price * pct) / 100);
          maxSavings = Math.max(maxSavings, calculatedVal);
        }
      }
    }

    return maxSavings;
  }

  /**
   * Score an individual product across the 5 dimensions
   */
  static scoreProduct(
    product: NormalizedProduct,
    intent: ShoppingIntent,
    strategy: PurchaseStrategyType
  ): EvaluatedProductScore {
    const paymentSavings = product.paymentBenefit?.calculatedSavings ?? this.parsePaymentOfferSavings(product);
    const effectivePrice = product.effectivePrice ?? Math.max(0, product.price - paymentSavings);

    // 1. Quality Score (0-100)
    const ratingPart = ((product.rating || 4.2) / 5) * 60; // 0-60 pts from rating
    const confidencePart = (product.confidence || 0.9) * 20; // 0-20 pts from relevance confidence
    let specBonus = 0;
    if (intent.importantFeatures && intent.importantFeatures.length > 0) {
      const pTitleAndSpecs = (product.title + ' ' + JSON.stringify(product.specifications || {})).toLowerCase();
      const matchCount = intent.importantFeatures.filter((f) => pTitleAndSpecs.includes(f.toLowerCase())).length;
      specBonus = Math.min(20, (matchCount / intent.importantFeatures.length) * 20);
    } else {
      specBonus = 15;
    }
    const qualityScore = Math.round(Math.min(100, ratingPart + confidencePart + specBonus));

    // 2. Brand Score (0-100)
    let brandScore = 50; // Neutral baseline
    const pBrand = product.brand.toLowerCase();
    const pTitle = product.title.toLowerCase();

    if (intent.preferredBrands && intent.preferredBrands.length > 0) {
      const isPreferred = intent.preferredBrands.some(
        (b) => pBrand.includes(b.toLowerCase()) || pTitle.includes(b.toLowerCase())
      );
      if (isPreferred) {
        brandScore = 100;
      } else {
        brandScore = 35; // Lower if preferred brands are specified but this is not one of them
      }
    }

    if (intent.excludedBrands && intent.excludedBrands.length > 0) {
      const isExcluded = intent.excludedBrands.some(
        (b) => pBrand.includes(b.toLowerCase()) || pTitle.includes(b.toLowerCase())
      );
      if (isExcluded) {
        brandScore = 0;
      }
    }

    // 3. Savings Score (0-100)
    // Combines listing discount % + payment offer % + budget remaining headroom
    let discountPct = 0;
    if (product.originalPrice && product.originalPrice > product.price) {
      discountPct = ((product.originalPrice - product.price) / product.originalPrice) * 100;
    }
    const paymentSavingsPct = (paymentSavings / (product.price || 1)) * 100;
    
    let budgetHeadroomScore = 50;
    if (intent.budget?.amount && intent.budget.amount > 0) {
      const headroom = intent.budget.amount - effectivePrice;
      if (headroom >= 0) {
        budgetHeadroomScore = 50 + Math.min(50, (headroom / intent.budget.amount) * 50);
      } else {
        budgetHeadroomScore = Math.max(0, 50 - (Math.abs(headroom) / intent.budget.amount) * 50);
      }
    }

    const savingsScore = Math.round(
      Math.min(100, discountPct * 1.5 + paymentSavingsPct * 2.0 + budgetHeadroomScore * 0.4)
    );

    // 4. Merchant Score (0-100)
    const trustVal = product.merchantTrustScore || 4.5;
    const merchantScore = Math.round((Math.min(5, Math.max(1, trustVal)) / 5) * 100);

    // 5. Delivery Score (0-100)
    let deliveryScore = 80; // default
    const deliveryDays = product.deliveryInformation?.deliveryDays;
    if (typeof deliveryDays === 'number') {
      if (deliveryDays <= 1) deliveryScore = 100;
      else if (deliveryDays === 2) deliveryScore = 85;
      else if (deliveryDays === 3) deliveryScore = 70;
      else deliveryScore = 50;
    }

    // Overall Weighted Score based on active strategy profile
    let overallScore = 0;
    switch (strategy) {
      case 'BEST_VALUE':
        overallScore =
          qualityScore * 0.35 +
          savingsScore * 0.25 +
          brandScore * 0.15 +
          merchantScore * 0.15 +
          deliveryScore * 0.10;
        break;

      case 'BEST_FOR_BRANDS':
        overallScore =
          brandScore * 0.45 +
          qualityScore * 0.25 +
          savingsScore * 0.15 +
          merchantScore * 0.10 +
          deliveryScore * 0.05;
        break;

      case 'MAXIMUM_SAVINGS':
        overallScore =
          savingsScore * 0.50 +
          qualityScore * 0.20 +
          merchantScore * 0.15 +
          deliveryScore * 0.10 +
          brandScore * 0.05;
        break;
    }

    return {
      product,
      scores: {
        qualityScore,
        brandScore,
        savingsScore,
        merchantScore,
        deliveryScore,
        overallScore: Math.round(overallScore),
      },
      parsedPaymentSavings: paymentSavings,
      effectivePrice,
    };
  }
}
