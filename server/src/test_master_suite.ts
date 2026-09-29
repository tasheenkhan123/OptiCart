import { GeminiService } from './services/ai/geminiService.js';
import { ProductDiscoveryService } from './services/discovery/productDiscoveryService.js';
import { StrategyGenerator } from './services/optimizer/strategyGenerator.js';
import { BasketEngine } from './services/optimizer/basketEngine.js';

async function runMasterTestSuite() {
  console.log('================================================================');
  console.log('       OPTICART MASTER IMPLEMENTATION VERIFICATION SUITE       ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 9;

  // -------------------------------------------------------------
  // TEST 1: Skincare Multi-Item ("My budget is ₹3000. I want a toner and cleanser.")
  // -------------------------------------------------------------
  console.log('TEST 1: Skincare Multi-Item');
  console.log('Prompt: "My budget is ₹3000. I want a toner and cleanser."');
  const t1Prompt = 'My budget is ₹3000. I want a toner and cleanser.';
  const t1Intent = await GeminiService.extractIntent(t1Prompt);
  console.log('Extracted Intent 1:', {
    category: t1Intent.category,
    budget: t1Intent.budget,
    isMultiItem: t1Intent.isMultiItem,
    items: t1Intent.items?.map(i => ({ name: i.name, category: i.category })),
    readiness: t1Intent.readinessState,
    preferredBrands: t1Intent.preferredBrands
  });

  const t1Discovery = await ProductDiscoveryService.discoverProducts(t1Intent);
  const t1Strategies = StrategyGenerator.generateStrategies(t1Discovery.products, t1Intent);
  const t1Best = t1Strategies[0];

  const t1Pass =
    t1Intent.category.toLowerCase().includes('skincare') &&
    t1Intent.budget?.amount === 3000 &&
    t1Intent.isMultiItem === true &&
    (t1Intent.items?.length || 0) >= 2 &&
    t1Intent.readinessState === 'ready_for_recommendation' &&
    t1Best.effectiveTotal <= 3000 &&
    t1Best.items.length >= 2;

  console.log(`Result 1: ${t1Pass ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Basket Items: ${t1Best.items.map(i => `${i.title} (${i.brand}) - ₹${i.price}`).join(' + ')}`);
  console.log(`Basket Effective Total: ₹${t1Best.effectiveTotal}, Headroom: ₹${t1Best.budgetHeadroom}\n`);
  if (t1Pass) passedTests++;

  // -------------------------------------------------------------
  // TEST 2: Branded Skincare ("I want a Minimalist toner and cleanser under ₹3000.")
  // -------------------------------------------------------------
  console.log('TEST 2: Branded Skincare');
  console.log('Prompt: "I want a Minimalist toner and cleanser under ₹3000."');
  const t2Prompt = 'I want a Minimalist toner and cleanser under ₹3000.';
  const t2Intent = await GeminiService.extractIntent(t2Prompt);
  const t2Discovery = await ProductDiscoveryService.discoverProducts(t2Intent);
  const t2Strategies = StrategyGenerator.generateStrategies(t2Discovery.products, t2Intent);
  const t2Best = t2Strategies[0];

  const t2AllMinimalist = t2Best.items.every(i => i.brand.toLowerCase().includes('minimalist'));
  const t2Pass =
    t2Intent.preferredBrands.some(b => b.toLowerCase().includes('minimalist')) &&
    t2Intent.isMultiItem === true &&
    t2Best.effectiveTotal <= 3000 &&
    t2AllMinimalist &&
    t2Best.items.length >= 2;

  console.log(`Result 2: ${t2Pass ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Basket Items: ${t2Best.items.map(i => `${i.title} (${i.brand}) - ₹${i.price}`).join(' + ')}`);
  console.log(`Basket Effective Total: ₹${t2Best.effectiveTotal}\n`);
  if (t2Pass) passedTests++;

  // -------------------------------------------------------------
  // TEST 3: Natural Skincare Concern ("I'm getting pimples and I have ₹1000. Suggest me a cream.")
  // -------------------------------------------------------------
  console.log('TEST 3: Natural Skincare Concern');
  console.log('Prompt: "I\'m getting pimples and I have ₹1000. Suggest me a cream."');
  const t3Prompt = "I'm getting pimples and I have ₹1000. Suggest me a cream.";
  const t3Intent = await GeminiService.extractIntent(t3Prompt);
  const t3Discovery = await ProductDiscoveryService.discoverProducts(t3Intent);
  const t3Strategies = StrategyGenerator.generateStrategies(t3Discovery.products, t3Intent);
  const t3Best = t3Strategies[0];

  const t3Pass =
    t3Intent.budget?.amount === 1000 &&
    t3Intent.readinessState === 'ready_for_recommendation' &&
    t3Best.items.length > 0 &&
    t3Best.items.some(i => i.title.toLowerCase().includes('pimple') || i.title.toLowerCase().includes('salicylic') || i.title.toLowerCase().includes('cream') || i.title.toLowerCase().includes('acne'));

  console.log(`Result 3: ${t3Pass ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Items: ${t3Best.items.map(i => `${i.title} (${i.brand}) - ₹${i.price}`).join(', ')}\n`);
  if (t3Pass) passedTests++;

  // -------------------------------------------------------------
  // TEST 4: ASUS Laptop 3 Options ("I need a good ASUS gaming laptop under ₹90000. Show me 3 options and give me the product links.")
  // -------------------------------------------------------------
  console.log('TEST 4: ASUS Gaming Laptop (3 Options)');
  console.log('Prompt: "I need a good ASUS gaming laptop under ₹90000. Show me 3 options and give me the product links."');
  const t4Prompt = 'I need a good ASUS gaming laptop under ₹90000. Show me 3 options and give me the product links.';
  const t4Intent = await GeminiService.extractIntent(t4Prompt);
  const t4Discovery = await ProductDiscoveryService.discoverProducts(t4Intent);
  const t4Strategies = StrategyGenerator.generateStrategies(t4Discovery.products, t4Intent);
  const t4Best = t4Strategies[0];

  const t4DistinctTitles = new Set(t4Best.items.map(i => i.title));
  const t4AllAsus = t4Best.items.every(i => i.brand.toLowerCase().includes('asus'));
  const t4AllUnder90k = t4Best.items.every(i => i.price <= 90000 * 1.05);

  const t4Pass =
    t4Intent.preferredBrands.some(b => b.toLowerCase().includes('asus')) &&
    t4Intent.requestedResultCount === 3 &&
    t4Best.items.length === 3 &&
    t4DistinctTitles.size === 3 &&
    t4AllAsus &&
    t4AllUnder90k;

  console.log(`Result 4: ${t4Pass ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Distinct Options (${t4Best.items.length}):`);
  t4Best.items.forEach((item, idx) => {
    console.log(`  #${idx + 1} [${item.recommendationLabel || 'Option'}]: ${item.title} (${item.brand}) - ₹${item.price} -> Link: ${item.productUrl || 'verified search link'}`);
  });
  console.log();
  if (t4Pass) passedTests++;

  // -------------------------------------------------------------
  // TEST 5: Apple Laptops ("Find me 3 Apple laptops under ₹1 lakh.")
  // -------------------------------------------------------------
  console.log('TEST 5: Apple Laptops (3 Options under ₹1 Lakh)');
  console.log('Prompt: "Find me 3 Apple laptops under ₹1 lakh."');
  const t5Prompt = 'Find me 3 Apple laptops under ₹1 lakh.';
  const t5Intent = await GeminiService.extractIntent(t5Prompt);
  const t5Discovery = await ProductDiscoveryService.discoverProducts(t5Intent);
  const t5Strategies = StrategyGenerator.generateStrategies(t5Discovery.products, t5Intent);
  const t5Best = t5Strategies[0];

  const t5AllApple = t5Best.items.every(i => i.brand.toLowerCase().includes('apple'));
  const t5AllUnder100k = t5Best.items.every(i => i.price <= 100000 * 1.05);
  const t5Pass =
    t5Intent.budget?.amount === 100000 &&
    t5AllApple &&
    t5AllUnder100k &&
    t5Best.items.length > 0;

  console.log(`Result 5: ${t5Pass ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Distinct Options (${t5Best.items.length}):`);
  t5Best.items.forEach((item, idx) => {
    console.log(`  #${idx + 1}: ${item.title} (${item.brand}) - ₹${item.price}`);
  });
  console.log();
  if (t5Pass) passedTests++;

  // -------------------------------------------------------------
  // TEST 6: Nike Running Shoes ("Find me 3 Nike running shoes under ₹8000.")
  // -------------------------------------------------------------
  console.log('TEST 6: Nike Running Shoes (3 Options under ₹8000)');
  console.log('Prompt: "Find me 3 Nike running shoes under ₹8000."');
  const t6Prompt = 'Find me 3 Nike running shoes under ₹8000.';
  const t6Intent = await GeminiService.extractIntent(t6Prompt);
  const t6Discovery = await ProductDiscoveryService.discoverProducts(t6Intent);
  const t6Strategies = StrategyGenerator.generateStrategies(t6Discovery.products, t6Intent);
  const t6Best = t6Strategies[0];

  const t6AllNike = t6Best.items.every(i => i.brand.toLowerCase().includes('nike'));
  const t6AllUnder8k = t6Best.items.every(i => i.price <= 8000 * 1.05);
  const t6Pass =
    t6Intent.budget?.amount === 8000 &&
    t6AllNike &&
    t6AllUnder8k &&
    t6Best.items.length === 3;

  console.log(`Result 6: ${t6Pass ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Distinct Options (${t6Best.items.length}):`);
  t6Best.items.forEach((item, idx) => {
    console.log(`  #${idx + 1}: ${item.title} (${item.brand}) - ₹${item.price}`);
  });
  console.log();
  if (t6Pass) passedTests++;

  // -------------------------------------------------------------
  // TEST 7: Fashion Summer Dress ("I need a cute summer dress around ₹2000. Show me 3 options.")
  // -------------------------------------------------------------
  console.log('TEST 7: Summer Dress (Fashion Category)');
  console.log('Prompt: "I need a cute summer dress around ₹2000. Show me 3 options."');
  const t7Prompt = 'I need a cute summer dress around ₹2000. Show me 3 options.';
  const t7Intent = await GeminiService.extractIntent(t7Prompt);
  const t7Discovery = await ProductDiscoveryService.discoverProducts(t7Intent);
  const t7Strategies = StrategyGenerator.generateStrategies(t7Discovery.products, t7Intent);
  const t7Best = t7Strategies[0];

  const t7Pass =
    t7Intent.category.toLowerCase().includes('fashion') &&
    t7Best.items.length === 3 &&
    t7Best.items.every(i => i.title.toLowerCase().includes('dress'));

  console.log(`Result 7: ${t7Pass ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Distinct Options (${t7Best.items.length}):`);
  t7Best.items.forEach((item, idx) => {
    console.log(`  #${idx + 1}: ${item.title} (${item.brand}) - ₹${item.price}`);
  });
  console.log();
  if (t7Pass) passedTests++;

  // -------------------------------------------------------------
  // TEST 8: No Brand Cleanser ("I need a good cleanser under ₹1000.")
  // -------------------------------------------------------------
  console.log('TEST 8: Cleanser (No Brand Specified)');
  console.log('Prompt: "I need a good cleanser under ₹1000."');
  const t8Prompt = 'I need a good cleanser under ₹1000.';
  const t8Intent = await GeminiService.extractIntent(t8Prompt);
  const t8Discovery = await ProductDiscoveryService.discoverProducts(t8Intent);
  const t8Strategies = StrategyGenerator.generateStrategies(t8Discovery.products, t8Intent);
  const t8Best = t8Strategies[0];

  const t8Pass =
    t8Intent.preferredBrands.length === 0 &&
    t8Intent.readinessState === 'ready_for_recommendation' &&
    t8Best.items.length > 0 &&
    t8Best.items.every(i => i.price <= 1000 * 1.05);

  console.log(`Result 8: ${t8Pass ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Recommended Cleansers:`);
  t8Best.items.forEach((item, idx) => {
    console.log(`  #${idx + 1} [${item.recommendationLabel || 'Option'}]: ${item.title} (${item.brand}) - ₹${item.price}`);
  });
  console.log();
  if (t8Pass) passedTests++;

  // -------------------------------------------------------------
  // TEST 9: Multi-Item Setup ("I need a gaming laptop, wireless mouse and headset under ₹1 lakh.")
  // -------------------------------------------------------------
  console.log('TEST 9: Multi-Item Setup (Laptop + Mouse + Headset)');
  console.log('Prompt: "I need a gaming laptop, wireless mouse and headset under ₹1 lakh."');
  const t9Prompt = 'I need a gaming laptop, wireless mouse and headset under ₹1 lakh.';
  const t9Intent = await GeminiService.extractIntent(t9Prompt);
  const t9Discovery = await ProductDiscoveryService.discoverProducts(t9Intent);
  const t9Strategies = StrategyGenerator.generateStrategies(t9Discovery.products, t9Intent);
  const t9Best = t9Strategies[0];

  const t9Pass =
    t9Intent.isMultiItem === true &&
    (t9Intent.items?.length || 0) === 3 &&
    t9Best.effectiveTotal <= 100000 &&
    t9Best.items.length === 3;

  console.log(`Result 9: ${t9Pass ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Basket Items (${t9Best.items.length}):`);
  t9Best.items.forEach((item, idx) => {
    console.log(`  #${idx + 1} [${item.itemRequirementName || item.category}]: ${item.title} (${item.brand}) - ₹${item.price}`);
  });
  console.log(`Total Effective Basket Price: ₹${t9Best.effectiveTotal} (Headroom: ₹${t9Best.budgetHeadroom}, Savings: ₹${t9Best.totalDiscount + t9Best.razorpaySavingsEstimate})\n`);
  if (t9Pass) passedTests++;

  console.log('================================================================');
  console.log(`TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL 9 TEST SCENARIOS PASSED WITH FULL COMPLIANCE!');
  } else {
    process.exit(1);
  }
}

runMasterTestSuite().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
