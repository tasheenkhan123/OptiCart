import { NormalizedProduct } from '../../types/product.js';
import { PaymentBenefitProvider, PaymentBenefitOptions } from './paymentBenefitProvider.js';
import { razorpayBenefitProvider } from './razorpayBenefitProvider.js';

export class PaymentService {
  private providers: PaymentBenefitProvider[] = [];

  constructor() {
    this.providers.push(razorpayBenefitProvider);
  }

  /**
   * Register an additional payment benefit provider
   */
  registerProvider(provider: PaymentBenefitProvider): void {
    this.providers.push(provider);
  }

  /**
   * Evaluates and applies the highest available payment benefit to each product in a list,
   * calculating and populating `product.paymentBenefit` and `product.effectivePrice`.
   */
  async applyPaymentBenefits(
    products: NormalizedProduct[],
    options?: PaymentBenefitOptions
  ): Promise<NormalizedProduct[]> {
    if (!products || products.length === 0) {
      return [];
    }

    const processed = await Promise.all(
      products.map(async (product) => {
        // Deep copy or clone to avoid mutating unintended references
        const p = { ...product };

        // Evaluate benefits across all registered payment providers
        let bestBenefit: import('../../types/product.js').PaymentBenefit | null = null;
        let maxSavings = 0;

        for (const provider of this.providers) {
          if (provider.isAvailable()) {
            try {
              const benefit = await provider.evaluateBenefit(p, options);
              if (benefit && benefit.calculatedSavings > maxSavings) {
                maxSavings = benefit.calculatedSavings;
                bestBenefit = benefit;
              }
            } catch (err) {
              console.warn(`[PaymentService Warning]: Error evaluating provider ${provider.id}:`, err);
            }
          }
        }

        if (bestBenefit) {
          p.paymentBenefit = bestBenefit;
          // Math: Listed Product Price - Applicable Payment Benefit = Effective Purchase Price
          p.effectivePrice = Math.max(0, p.price - bestBenefit.calculatedSavings);
        } else {
          p.effectivePrice = p.price;
        }

        return p;
      })
    );

    return processed;
  }
}

export const paymentService = new PaymentService();
