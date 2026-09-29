import { geminiService } from './services/ai/geminiService.js';
import { productDiscoveryService } from './services/discovery/productDiscoveryService.js';
import { optimizerService } from './services/optimizer/optimizerService.js';
import { ShoppingIntent } from './types/intent.js';

async function runMultiItemBasketTests() {
  console.log('================================================================');
  console.log('   OPTICART — MULTI-ITEM BASKET & CROSS-MERCHANT OPTIMIZER TEST ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // Helper assertion
  const assert = (condition: boolean, msg: string) => {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${msg}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    }
  };

  // =========================================================================
  // TEST 1: GAMING LAPTOP + WIRELESS MOUSE + LAPTOP SLEEVE (Cross-Merchant)
  // =========================================================================
  console.log('>>> TEST 1: Gaming Laptop, Wireless Mouse & Sleeve under ₹90,000 <<<');
  const userPrompt1 = 'I need a gaming laptop, wireless mouse and laptop sleeve under ₹90,000.';
  console.log(`User Input: "${userPrompt1}"`);

  const response1 = await geminiService.generateChatResponse({
    message: userPrompt1,
    conversationHistory: [],
    budget: '90000',
  });

  console.log(`AI Reply: "${response1.reply}"`);
  console.log(`Readiness State: ${response1.intent.readinessState}`);
  console.log(`Is Multi-Item: ${response1.intent.isMultiItem}`);
  console.log(`Extracted Items (${response1.intent.items?.length || 0}):`, response1.intent.items?.map((i) => i.name));

  assert(response1.intent.isMultiItem === true, 'Intent identified as multi-item');
  assert((response1.intent.items?.length || 0) >= 2, 'Extracted at least 2 distinct item requirements');
  assert(response1.intent.budget?.amount === 90000, 'Budget parsed as ₹90,000');

  // Discover candidate products across items
  console.log('\n--> Executing Cross-Merchant Discovery...');
  const discovery1 = await productDiscoveryService.discoverByIntent(response1.intent);
  console.log(`Discovered ${discovery1.products.length} candidate products across ${discovery1.sources.length} sources.`);
  assert(discovery1.products.length > 0, 'Found candidate products across multi-item queries');

  // Verify that products have target item markers
  const uniqueItemsFound = new Set(discovery1.products.map((p) => p.itemRequirementName).filter(Boolean));
  console.log(`Discovered candidate slots: ${Array.from(uniqueItemsFound).join(', ')}`);
  assert(uniqueItemsFound.size >= 2, 'Candidate products cover multiple required slots');

  // Optimize multi-item baskets
  console.log('\n--> Running Multi-Item Basket Combinatorial Optimizer...');
  const strategies1 = await optimizerService.optimizeByIntent(response1.intent, discovery1.products);
  assert(strategies1.length >= 2, 'Generated multi-item purchase strategies');

  for (const strat of strategies1) {
    console.log(`\n  • Strategy [${strat.strategy}]: "${strat.title}"`);
    console.log(`    Tagline: ${strat.tagline}`);
    console.log(`    Overall Score: ${strat.scoreBreakdown.overallScore}/100 | Quality: ${strat.scoreBreakdown.qualityScore} | Savings: ${strat.scoreBreakdown.savingsScore}`);
    console.log(`    Subtotal: ₹${strat.subtotal} | Razorpay Savings: -₹${strat.razorpaySavingsEstimate} | Effective Total: ₹${strat.effectiveTotal}`);
    console.log(`    Budget Headroom: ₹${strat.budgetHeadroom}`);
    console.log(`    Items in Basket (${strat.items.length}):`);
    strat.items.forEach((it, idx) => {
      const bAmount = it.paymentBenefit?.calculatedSavings || 0;
      console.log(`      ${idx + 1}. [${it.merchantName}] ${it.brand} ${it.title} - Listed: ₹${it.price}, Benefit: -₹${bAmount}`);
    });

    console.log(`    Merchant Split Breakdown (${strat.merchantSplit?.length || 0} stores):`);
    strat.merchantSplit?.forEach((sp) => {
      const discount = sp.paymentDiscount ?? sp.paymentSavings ?? 0;
      const effective = sp.effectiveSubtotal ?? sp.effectiveTotal ?? sp.subtotal;
      console.log(`      - ${sp.merchantName}: ${sp.itemCount} item(s), Subtotal ₹${sp.subtotal}, Offers -₹${discount}, Effective ₹${effective}`);
    });

    assert(strat.items.length >= 2, `${strat.strategy} contains multi-product basket`);
    assert(strat.effectiveTotal <= strat.subtotal, `${strat.strategy} effective total accounts for payment discounts`);
    assert(strat.subtotal - strat.razorpaySavingsEstimate === strat.effectiveTotal, `${strat.strategy} transparent math holds`);
    if (strat.merchantSplit && strat.merchantSplit.length > 0) {
      const sumSplitEffective = strat.merchantSplit.reduce((s, m) => s + (m.effectiveSubtotal ?? m.effectiveTotal ?? m.subtotal), 0);
      assert(sumSplitEffective === strat.effectiveTotal, `${strat.strategy} merchant splits sum up to effective total`);
    }
  }

  // =========================================================================
  // TEST 2: SKINCARE 3-STEP ROUTINE (Cleanser + Serum + Moisturizer)
  // =========================================================================
  console.log('\n>>> TEST 2: Skincare 3-Step Routine under ₹2,000 <<<');
  const userPrompt2 = 'I want a skincare set with gentle cleanser, vitamin C serum and ceramide moisturizer under ₹2000.';
  console.log(`User Input: "${userPrompt2}"`);

  const response2 = await geminiService.generateChatResponse({
    message: userPrompt2,
    conversationHistory: [],
    budget: '2000',
  });

  console.log(`AI Reply: "${response2.reply}"`);
  console.log(`Is Multi-Item: ${response2.intent.isMultiItem}`);
  console.log(`Items:`, response2.intent.items?.map((i) => i.name));

  const discovery2 = await productDiscoveryService.discoverByIntent(response2.intent);
  const strategies2 = await optimizerService.optimizeByIntent(response2.intent, discovery2.products);

  assert(strategies2.length > 0, 'Skincare multi-item basket generated successfully');
  console.log(`Best Value Skincare Basket Effective Total: ₹${strategies2[0]?.effectiveTotal}`);

  // =========================================================================
  // TEST 3: SMARTPHONE + CASE + EARBUDS (Croma, Amazon, Reliance Digital)
  // =========================================================================
  console.log('\n>>> TEST 3: Smartphone + Case + Earbuds under ₹35,000 <<<');
  const userPrompt3 = 'I need a smartphone, protective case and wireless earbuds under ₹35,000.';
  const response3 = await geminiService.generateChatResponse({
    message: userPrompt3,
    conversationHistory: [],
    budget: '35000',
  });

  const discovery3 = await productDiscoveryService.discoverByIntent(response3.intent);
  const strategies3 = await optimizerService.optimizeByIntent(response3.intent, discovery3.products);
  assert(strategies3.length > 0, 'Tech bundle generated successfully');

  const bestVal3 = strategies3.find((s) => s.strategy === 'BEST_VALUE') || strategies3[0];
  console.log(`Tech Bundle Merchants: ${bestVal3.merchantSplit?.map((m) => m.merchantName).join(', ')}`);
  assert((bestVal3.merchantSplit?.length || 0) >= 1, 'Tech bundle includes verified merchant splits');

  // =========================================================================
  // TEST 4: SINGLE-ITEM REGRESSION TEST (Ensure Single-Product Still 100% Intact)
  // =========================================================================
  console.log('\n>>> TEST 4: Single-Item Regression (Sony WH-1000XM5 under ₹25,000) <<<');
  const userPrompt4 = 'I want Sony WH-1000XM5 noise cancelling headphones under ₹25,000.';
  const response4 = await geminiService.generateChatResponse({
    message: userPrompt4,
    conversationHistory: [],
    budget: '25000',
  });

  assert(response4.intent.isMultiItem === false, 'Single item query is NOT marked as multi-item');
  const discovery4 = await productDiscoveryService.discoverByIntent(response4.intent);
  const strategies4 = await optimizerService.optimizeByIntent(response4.intent, discovery4.products);

  assert(strategies4.length === 3, 'Single item generates 3 strategies (Best Value, Brand, Savings)');
  assert(strategies4[0].items.length === 1, 'Single item strategy contains 1 product');
  console.log(`Single Item Top Product: ${strategies4[0].items[0].title} from ${strategies4[0].items[0].merchantName}`);

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n================================================================');
  console.log(`   ALL MULTI-ITEM BASKET TESTS PASSED (${passedTests}/${totalTests}) `);
  console.log('================================================================\n');
}

runMultiItemBasketTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
