import { optimizerService } from './services/optimizer/optimizerService.js';
import { paymentService } from './services/payment/paymentService.js';
import { NormalizedProduct } from './types/product.js';
import { ShoppingIntent } from './types/intent.js';

async function runRazorpayOptimizationVerification() {
  console.log('================================================================');
  console.log('   OPTICART — RAZORPAY BENEFIT PURCHASE OPTIMIZER VERIFICATION  ');
  console.log('================================================================\n');

  // Define Product A (Higher listed price: ₹25,000, but with ₹3,000 Razorpay Benefit -> Effective: ₹22,000)
  const productA: NormalizedProduct = {
    id: 'prod-A-25k',
    title: 'BrandX UltraBook 14 (Core i5 12th Gen, 16GB RAM, 512GB SSD)',
    brand: 'BrandX',
    category: 'Laptops',
    price: 25000,
    originalPrice: 32000,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    rating: 4.6,
    reviewCount: 340,
    availability: 'in_stock',
    sourceType: 'mock',
    confidence: 0.95,
    paymentOffers: ['Flat ₹3,000 Instant Card Discount via Razorpay Gateway'],
    paymentBenefit: {
      id: 'rzp-benefit-prodA',
      provider: 'razorpay',
      title: 'Razorpay Instant Card Offer',
      description: 'Flat ₹3,000 instant discount on HDFC/ICICI/Axis Credit Cards',
      discountType: 'flat',
      discountValue: 3000,
      calculatedSavings: 3000,
      bankName: 'HDFC/ICICI/Axis',
      paymentMethod: 'credit_card',
      source: 'demo_mock_benefit',
      isLiveOffer: false,
      terms: 'Demo benefit: Verified Razorpay rule simulation',
    },
    effectivePrice: 22000, // 25,000 - 3,000 = 22,000
    merchantTrustScore: 4.8,
  };

  // Define Product B (Lower listed price: ₹23,000, but NO benefit -> Effective: ₹23,000)
  const productB: NormalizedProduct = {
    id: 'prod-B-23k',
    title: 'BrandY SlimBook 14 (Core i3 12th Gen, 8GB RAM, 256GB SSD)',
    brand: 'BrandY',
    category: 'Laptops',
    price: 23000,
    originalPrice: 26000,
    currency: 'INR',
    merchantName: 'Croma',
    merchantDomain: 'croma.com',
    rating: 4.3,
    reviewCount: 120,
    availability: 'in_stock',
    sourceType: 'mock',
    confidence: 0.90,
    paymentOffers: [], // No payment benefit
    effectivePrice: 23000, // 23,000 - 0 = 23,000
    merchantTrustScore: 4.5,
  };

  console.log('--- 1. Testing Transparent Pricing Formula on Products ---');
  console.log(`Product A:`);
  console.log(`  Listed Price: ₹${productA.price.toLocaleString('en-IN')}`);
  console.log(`  Payment Benefit: -₹${productA.paymentBenefit?.calculatedSavings.toLocaleString('en-IN')} (${productA.paymentBenefit?.title})`);
  console.log(`  Effective Purchase Price: = ₹${productA.effectivePrice?.toLocaleString('en-IN')}`);

  console.log(`\nProduct B:`);
  console.log(`  Listed Price: ₹${productB.price.toLocaleString('en-IN')}`);
  console.log(`  Payment Benefit: ₹0 (No offer)`);
  console.log(`  Effective Purchase Price: = ₹${productB.effectivePrice?.toLocaleString('en-IN')}`);

  // Test Intent
  const intent: ShoppingIntent = {
    category: 'Laptops',
    productType: 'Laptop',
    budget: { amount: 30000, currency: 'INR', raw: '₹30,000' },
    preferredBrands: [],
    excludedBrands: [],
    qualityPreference: 'best-value',
    importantFeatures: ['16GB RAM', '512GB SSD'],
    userPriorities: ['Value', 'Savings'],
    assumptionsMade: [],
    readinessState: 'ready_for_recommendation',
    summary: 'Laptop under ₹30,000 maximizing savings and value',
  };

  console.log('\n--- 2. Running Purchase Optimization Engine ---');
  const candidateProducts = [productA, productB];
  const strategies = await optimizerService.optimizeByIntent(intent, candidateProducts);

  console.log(`Generated ${strategies.length} Strategies:\n`);

  for (const strat of strategies) {
    console.log(`================== [${strat.strategy}: ${strat.title}] ==================`);
    console.log(`Listed Subtotal: ₹${strat.subtotal.toLocaleString('en-IN')}`);
    console.log(`Razorpay Benefit Estimate: -₹${strat.razorpaySavingsEstimate.toLocaleString('en-IN')}`);
    console.log(`Effective Total Outlay: = ₹${strat.effectiveTotal.toLocaleString('en-IN')}`);
    console.log(`Budget Headroom: ₹${strat.budgetHeadroom.toLocaleString('en-IN')}`);
    console.log(`Selected Top Item: ${strat.items[0]?.title} (ID: ${strat.items[0]?.id})`);
    console.log(`Explanation: "${strat.explanation}"`);
    console.log(`Highlights:`);
    strat.highlights.forEach((h) => console.log(`  • ${h}`));
    console.log('');
  }

  // Assertions for prompt criteria
  const maxSavingsStrat = strategies.find((s) => s.strategy === 'MAXIMUM_SAVINGS');
  const bestValueStrat = strategies.find((s) => s.strategy === 'BEST_VALUE');

  console.log('--- 3. Verifying Strategic Outcome ---');
  
  if (maxSavingsStrat?.items[0]?.id === 'prod-A-25k') {
    console.log('✅ PASS: Maximum Savings correctly recognized Product A (Effective ₹22,000) over Product B (Effective ₹23,000) despite Product A having a higher listed price!');
  } else {
    console.error('❌ FAIL: Maximum Savings did not pick Product A!');
    process.exit(1);
  }

  if (bestValueStrat?.items[0]?.id === 'prod-A-25k') {
    console.log('✅ PASS: Best Value correctly recognized Product A for superior specs and lower effective outlay!');
  } else {
    console.error('❌ FAIL: Best Value did not pick Product A!');
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log('  ALL RAZORPAY BENEFIT OPTIMIZATION TEST CRITERIA PASSED!       ');
  console.log('================================================================\n');
}

runRazorpayOptimizationVerification().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
