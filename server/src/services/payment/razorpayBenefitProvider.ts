import { NormalizedProduct, PaymentBenefit } from '../../types/product.js';
import { PaymentBenefitProvider, PaymentBenefitOptions } from './paymentBenefitProvider.js';
import { ENV } from '../../config/env.js';

/**
 * Razorpay Payment Benefit Provider
 * 
 * Supports:
 * 1. Live Razorpay Offers API (when RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET are configured)
 * 2. Documented Demo Offer catalog clearly marked with source: 'demo_mock_benefit'
 * 3. Transparent mathematical deduction: Listed Price - Benefit = Effective Purchase Price
 */
export class RazorpayBenefitProvider implements PaymentBenefitProvider {
  readonly id = 'razorpay-benefit-provider';
  readonly name = 'Razorpay Payment & Instant Card Offers';

  isAvailable(): boolean {
    // Available for evaluation (in live API mode if keys present, else in verified demo mode)
    return true;
  }

  isLive(): boolean {
    return ENV.hasRazorpayApi;
  }

  /**
   * Evaluate applicable payment benefit for a given product
   */
  async evaluateBenefit(
    product: NormalizedProduct,
    _options?: PaymentBenefitOptions
  ): Promise<PaymentBenefit | null> {
    if (!product || typeof product.price !== 'number' || product.price <= 0) {
      return null;
    }

    // 0. If product already has an explicitly defined paymentBenefit, preserve it
    if (product.paymentBenefit !== undefined) {
      return product.paymentBenefit;
    }

    // 1. If Live Razorpay API keys are configured, query live Razorpay Offers endpoint
    if (this.isLive()) {
      try {
        const liveBenefit = await this.queryLiveRazorpayOffers(product);
        if (liveBenefit) {
          return liveBenefit;
        }
      } catch (err) {
        console.warn('[Razorpay Live API Warning]:', err instanceof Error ? err.message : err);
      }
    }

    // 2. Parse any explicit payment offer strings attached to the product
    if (product.paymentOffers && product.paymentOffers.length > 0) {
      const parsedFromProduct = this.parseProductPaymentOffers(product);
      if (parsedFromProduct) {
        return parsedFromProduct;
      }
    } else if (product.paymentOffers && product.paymentOffers.length === 0) {
      // Explicitly empty offers: product has no payment discounts
      return null;
    }

    // 3. Fallback to category/tier demo offers (strictly marked as demo_mock_benefit)
    return this.evaluateTierDemoOffer(product);
  }

  /**
   * Query live Razorpay Offers API (GET https://api.razorpay.com/v1/offers)
   */
  private async queryLiveRazorpayOffers(product: NormalizedProduct): Promise<PaymentBenefit | null> {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${ENV.RAZORPAY_KEY_ID}:${ENV.RAZORPAY_KEY_SECRET}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/offers', {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as {
        items?: Array<{
          id: string;
          name: string;
          percent_rate?: number;
          flat_amount?: number;
          min_amount?: number;
          max_cashback?: number;
          terms?: string;
        }>;
      };

      if (!data.items || data.items.length === 0) {
        return null;
      }

      // Find the highest applicable offer for this product's price (in paise: price * 100)
      const priceInPaise = product.price * 100;
      let bestOffer: PaymentBenefit | null = null;
      let maxDiscount = 0;

      for (const item of data.items) {
        if (item.min_amount && priceInPaise < item.min_amount) {
          continue;
        }

        let calculatedSavings = 0;
        let discountType: 'flat' | 'percentage' = 'flat';
        let discountValue = 0;

        if (item.flat_amount && item.flat_amount > 0) {
          calculatedSavings = item.flat_amount / 100;
          discountType = 'flat';
          discountValue = calculatedSavings;
        } else if (item.percent_rate && item.percent_rate > 0) {
          discountType = 'percentage';
          discountValue = item.percent_rate;
          const rawPct = (product.price * item.percent_rate) / 100;
          const maxCap = item.max_cashback ? item.max_cashback / 100 : product.price * 0.3;
          calculatedSavings = Math.min(rawPct, maxCap);
        }

        if (calculatedSavings > maxDiscount && calculatedSavings < product.price * 0.5) {
          maxDiscount = calculatedSavings;
          bestOffer = {
            id: `rzp-${item.id}`,
            provider: 'razorpay',
            title: item.name || 'Razorpay Instant Bank Offer',
            description: `Get ₹${calculatedSavings.toLocaleString('en-IN')} off at checkout with Razorpay`,
            discountType,
            discountValue,
            calculatedSavings: Math.round(calculatedSavings),
            minOrderValue: item.min_amount ? item.min_amount / 100 : undefined,
            source: 'live_razorpay_api',
            isLiveOffer: true,
            terms: item.terms,
          };
        }
      }

      return bestOffer;
    } catch (err) {
      console.warn('[Razorpay Live Query Error]:', err);
      return null;
    }
  }

  /**
   * Parse explicit payment offers from product attributes (e.g. from catalog or web search)
   */
  private parseProductPaymentOffers(product: NormalizedProduct): PaymentBenefit | null {
    if (!product.paymentOffers || product.paymentOffers.length === 0) {
      return null;
    }

    for (const offerStr of product.paymentOffers) {
      // Check for flat rupee discount: e.g. "Flat ₹2,500 off on Credit Cards via Razorpay", "₹3,000 Instant Bank Discount"
      const flatMatch = offerStr.match(/(?:flat|instant|save)?\s*(?:₹|rs\.?|inr)\s*([\d,]+)/i);
      if (flatMatch && flatMatch[1]) {
        const val = parseFloat(flatMatch[1].replace(/,/g, ''));
        if (!isNaN(val) && val > 0 && val < product.price * 0.5) {
          return {
            id: `benefit-parsed-${product.id}`,
            provider: 'razorpay',
            title: 'Instant Bank Offer via Razorpay',
            description: offerStr,
            discountType: 'flat',
            discountValue: val,
            calculatedSavings: val,
            paymentMethod: 'credit_card',
            source: product.sourceType === 'web_search' ? 'live_razorpay_api' : 'demo_mock_benefit',
            isLiveOffer: product.sourceType === 'web_search',
            terms: 'Applicable on select credit/debit cards during Razorpay checkout',
          };
        }
      }

      // Check for percentage discount: e.g. "10% Instant Discount on HDFC Bank Cards"
      const pctMatch = offerStr.match(/(\d+(?:\.\d+)?)\s*%\s*(?:off|discount|cashback)/i);
      if (pctMatch && pctMatch[1]) {
        const pct = parseFloat(pctMatch[1]);
        if (!isNaN(pct) && pct > 0 && pct <= 30) {
          const savings = Math.round((product.price * pct) / 100);
          return {
            id: `benefit-parsed-pct-${product.id}`,
            provider: 'razorpay',
            title: `${pct}% Instant Card Discount via Razorpay`,
            description: offerStr,
            discountType: 'percentage',
            discountValue: pct,
            calculatedSavings: savings,
            paymentMethod: 'credit_card',
            source: product.sourceType === 'web_search' ? 'live_razorpay_api' : 'demo_mock_benefit',
            isLiveOffer: product.sourceType === 'web_search',
            terms: 'Maximum discount capped per transaction via Razorpay gateway',
          };
        }
      }
    }

    return null;
  }

  /**
   * Deterministic Demo Offer evaluator
   * Strictly marked with source: 'demo_mock_benefit' and isLiveOffer: false
   */
  private evaluateTierDemoOffer(product: NormalizedProduct): PaymentBenefit | null {
    const price = product.price;

    // High-value products (> ₹50,000): e.g. Gaming laptops, premium phones
    if (price >= 50000) {
      const savings = 3500;
      return {
        id: `demo-rzp-high-${product.id}`,
        provider: 'razorpay',
        title: 'Razorpay Instant Card Offer (Demo)',
        description: `Flat ₹${savings.toLocaleString('en-IN')} instant discount on HDFC/ICICI/Axis Credit Cards`,
        discountType: 'flat',
        discountValue: savings,
        calculatedSavings: savings,
        minOrderValue: 40000,
        bankName: 'HDFC / ICICI / Axis',
        paymentMethod: 'credit_card',
        source: 'demo_mock_benefit',
        isLiveOffer: false,
        terms: 'Demo benefit: Simulated Razorpay gateway card offer for testing optimization engine',
      };
    }

    // Mid-tier products (₹20,000 - ₹50,000): e.g. Budget laptops, mid-range smartphones
    if (price >= 20000) {
      const savings = 2000;
      return {
        id: `demo-rzp-mid-${product.id}`,
        provider: 'razorpay',
        title: 'Razorpay Instant Bank Discount (Demo)',
        description: `Flat ₹${savings.toLocaleString('en-IN')} instant savings on Credit Card EMI`,
        discountType: 'flat',
        discountValue: savings,
        calculatedSavings: savings,
        minOrderValue: 15000,
        bankName: 'Major Partner Banks',
        paymentMethod: 'credit_card',
        source: 'demo_mock_benefit',
        isLiveOffer: false,
        terms: 'Demo benefit: Simulated Razorpay payment offer',
      };
    }

    // Budget products (₹5,000 - ₹20,000): e.g. Audio, monitors, smartwatches
    if (price >= 5000) {
      const savings = 750;
      return {
        id: `demo-rzp-low-${product.id}`,
        provider: 'razorpay',
        title: 'Razorpay UPI / Card Savings (Demo)',
        description: `₹${savings.toLocaleString('en-IN')} instant cashback on UPI / Card payments`,
        discountType: 'flat',
        discountValue: savings,
        calculatedSavings: savings,
        minOrderValue: 4000,
        paymentMethod: 'upi',
        source: 'demo_mock_benefit',
        isLiveOffer: false,
        terms: 'Demo benefit: Simulated Razorpay gateway savings',
      };
    }

    return null;
  }
}

export const razorpayBenefitProvider = new RazorpayBenefitProvider();
