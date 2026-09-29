import { NormalizedProduct, PaymentBenefit } from '../../types/product.js';

export interface PaymentBenefitOptions {
  preferredBank?: string;
  preferredPaymentMethod?: 'credit_card' | 'debit_card' | 'upi' | 'netbanking' | 'emi';
}

/**
 * Interface for Payment Benefit Providers (Razorpay Offers, Bank Gateways, Merchant Promos)
 */
export interface PaymentBenefitProvider {
  readonly id: string;
  readonly name: string;

  /** Whether this payment provider is currently configured and operational */
  isAvailable(): boolean;

  /** Whether this provider returns verified live gateway offers or simulated demo offers */
  isLive(): boolean;

  /** Evaluate the best applicable payment discount/cashback benefit for a given product */
  evaluateBenefit(
    product: NormalizedProduct,
    options?: PaymentBenefitOptions
  ): Promise<PaymentBenefit | null>;
}
