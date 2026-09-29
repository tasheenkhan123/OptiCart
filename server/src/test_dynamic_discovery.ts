import { geminiService } from './services/ai/geminiService.js';
import { productDiscoveryService } from './services/discovery/productDiscoveryService.js';
import { optimizerService } from './services/optimizer/optimizerService.js';

async function runDynamicDiscoveryTests() {
  console.log('================================================================');
  console.log('   OPTICART — DYNAMIC DISCOVERY & FILTERING TEST SUITE (6 SCENARIOS)');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

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
  // TEST 1: "I need a gaming laptop."
  // =========================================================================
  console.log('>>> TEST 1: "I need a gaming laptop." <<<');
  const t1Prompt = 'I need a gaming laptop.';
  const t1Ai = await geminiService.generateChatResponse({
    message: t1Prompt,
    conversationHistory: [],
  });
  console.log(`AI Reply: "${t1Ai.reply.slice(0, 100)}..."`);
  console.log('Category:', t1Ai.intent.category, '| ProductType:', t1Ai.intent.productType);

  const t1Discovery = await productDiscoveryService.discoverByIntent(t1Ai.intent);
  console.log(`Discovered ${t1Discovery.products.length} products (Sources: ${t1Discovery.sources.join(', ')})`);
  assert(t1Discovery.products.length > 0, 'Test 1: Found gaming laptop candidates');
  assert(
    t1Discovery.products.some((p) => p.category.toLowerCase().includes('laptop') || p.title.toLowerCase().includes('laptop')),
    'Test 1: Products match laptop category'
  );

  const t1Strategies = await optimizerService.optimizeByIntent(t1Ai.intent, t1Discovery.products);
  assert(t1Strategies.length > 0, 'Test 1: Optimizer generated valid strategies');
  console.log(`Best Pick: ${t1Strategies[0].items[0]?.brand} ${t1Strategies[0].items[0]?.title} (₹${t1Strategies[0].effectiveTotal})\n`);

  // =========================================================================
  // TEST 2: "I need an ASUS gaming laptop under ₹90,000."
  // =========================================================================
  console.log('>>> TEST 2: "I need an ASUS gaming laptop under ₹90,000." <<<');
  const t2Prompt = 'I need an ASUS gaming laptop under ₹90,000.';
  const t2Ai = await geminiService.generateChatResponse({
    message: t2Prompt,
    conversationHistory: [],
    budget: '90000',
  });
  console.log('Parsed Budget:', t2Ai.intent.budget?.amount, '| Preferred Brands:', t2Ai.intent.preferredBrands);
  assert(t2Ai.intent.budget?.amount === 90000, 'Test 2: Budget parsed as ₹90,000');
  assert(
    t2Ai.intent.preferredBrands?.some((b) => b.toLowerCase().includes('asus')) || false,
    'Test 2: ASUS brand recognized'
  );

  const t2Discovery = await productDiscoveryService.discoverByIntent(t2Ai.intent);
  console.log(`Discovered ${t2Discovery.products.length} products`);
  assert(t2Discovery.products.length > 0, 'Test 2: Found ASUS gaming laptop candidates');

  // Verify strict brand and budget enforcement
  const t2AllAsus = t2Discovery.products.every(
    (p) => p.brand.toLowerCase().includes('asus') || p.title.toLowerCase().includes('asus')
  );
  const t2AllUnderBudget = t2Discovery.products.every((p) => p.price <= 90000);
  assert(t2AllAsus, 'Test 2: ALL discovered candidates are ASUS brand');
  assert(t2AllUnderBudget, 'Test 2: ALL discovered candidates are <= ₹90,000');

  const t2Strategies = await optimizerService.optimizeByIntent(t2Ai.intent, t2Discovery.products);
  assert(t2Strategies[0].effectiveTotal <= 90000, 'Test 2: Optimized effective total <= ₹90,000');
  assert(t2Strategies[0].items[0]?.brand.toLowerCase().includes('asus'), 'Test 2: Recommended product is ASUS');
  console.log(`Best Pick: ${t2Strategies[0].items[0]?.brand} ${t2Strategies[0].items[0]?.title} (₹${t2Strategies[0].effectiveTotal})\n`);

  // =========================================================================
  // TEST 3: "I need an Apple laptop under ₹1 lakh."
  // =========================================================================
  console.log('>>> TEST 3: "I need an Apple laptop under ₹1 lakh." <<<');
  const t3Prompt = 'I need an Apple laptop under ₹1 lakh.';
  const t3Ai = await geminiService.generateChatResponse({
    message: t3Prompt,
    conversationHistory: [],
    budget: '100000',
  });
  console.log('Parsed Budget:', t3Ai.intent.budget?.amount, '| Preferred Brands:', t3Ai.intent.preferredBrands);
  assert(t3Ai.intent.budget?.amount === 100000, 'Test 3: Budget parsed as ₹1,00,000 (1 lakh)');
  assert(
    t3Ai.intent.preferredBrands?.some((b) => b.toLowerCase().includes('apple')) || false,
    'Test 3: Apple brand recognized'
  );

  const t3Discovery = await productDiscoveryService.discoverByIntent(t3Ai.intent);
  console.log(`Discovered ${t3Discovery.products.length} products`);
  assert(t3Discovery.products.length > 0, 'Test 3: Found Apple laptop candidates');

  const t3AllApple = t3Discovery.products.every(
    (p) => p.brand.toLowerCase().includes('apple') || p.title.toLowerCase().includes('apple') || p.title.toLowerCase().includes('macbook')
  );
  const t3AllUnderBudget = t3Discovery.products.every((p) => p.price <= 100000);
  assert(t3AllApple, 'Test 3: ALL candidates are Apple');
  assert(t3AllUnderBudget, 'Test 3: ALL candidates are <= ₹1,00,000');

  const t3Strategies = await optimizerService.optimizeByIntent(t3Ai.intent, t3Discovery.products);
  assert(t3Strategies[0].effectiveTotal <= 100000, 'Test 3: Effective total <= ₹1,00,000');
  console.log(`Best Pick: ${t3Strategies[0].items[0]?.brand} ${t3Strategies[0].items[0]?.title} (₹${t3Strategies[0].effectiveTotal})\n`);

  // =========================================================================
  // TEST 4: "I need Minimalist skincare under ₹2,000."
  // =========================================================================
  console.log('>>> TEST 4: "I need Minimalist skincare under ₹2,000." <<<');
  const t4Prompt = 'I need Minimalist skincare under ₹2,000.';
  const t4Ai = await geminiService.generateChatResponse({
    message: t4Prompt,
    conversationHistory: [],
    budget: '2000',
  });
  console.log('Parsed Budget:', t4Ai.intent.budget?.amount, '| Preferred Brands:', t4Ai.intent.preferredBrands);
  assert(
    t4Ai.intent.preferredBrands?.some((b) => b.toLowerCase().includes('minimalist')) || false,
    'Test 4: Minimalist brand recognized'
  );

  const t4Discovery = await productDiscoveryService.discoverByIntent(t4Ai.intent);
  console.log(`Discovered ${t4Discovery.products.length} products`);
  assert(t4Discovery.products.length > 0, 'Test 4: Found Minimalist skincare candidates');

  const t4AllMinimalist = t4Discovery.products.every(
    (p) => p.brand.toLowerCase().includes('minimalist') || p.title.toLowerCase().includes('minimalist')
  );
  const t4AllUnderBudget = t4Discovery.products.every((p) => p.price <= 2000);
  assert(t4AllMinimalist, 'Test 4: ALL candidates are Minimalist');
  assert(t4AllUnderBudget, 'Test 4: ALL candidates are <= ₹2,000');

  const t4Strategies = await optimizerService.optimizeByIntent(t4Ai.intent, t4Discovery.products);
  assert(t4Strategies[0].effectiveTotal <= 2000, 'Test 4: Effective total <= ₹2,000');
  console.log(`Best Pick: ${t4Strategies[0].items[0]?.brand} ${t4Strategies[0].items[0]?.title} (₹${t4Strategies[0].effectiveTotal})\n`);

  // =========================================================================
  // TEST 5: "I need Nike running shoes under ₹8,000."
  // =========================================================================
  console.log('>>> TEST 5: "I need Nike running shoes under ₹8,000." <<<');
  const t5Prompt = 'I need Nike running shoes under ₹8,000.';
  const t5Ai = await geminiService.generateChatResponse({
    message: t5Prompt,
    conversationHistory: [],
    budget: '8000',
  });
  console.log('Parsed Budget:', t5Ai.intent.budget?.amount, '| Preferred Brands:', t5Ai.intent.preferredBrands);
  assert(
    t5Ai.intent.preferredBrands?.some((b) => b.toLowerCase().includes('nike')) || false,
    'Test 5: Nike brand recognized'
  );

  const t5Discovery = await productDiscoveryService.discoverByIntent(t5Ai.intent);
  console.log(`Discovered ${t5Discovery.products.length} products`);
  assert(t5Discovery.products.length > 0, 'Test 5: Found Nike running shoes candidates');

  const t5AllNike = t5Discovery.products.every(
    (p) => p.brand.toLowerCase().includes('nike') || p.title.toLowerCase().includes('nike')
  );
  const t5AllUnderBudget = t5Discovery.products.every((p) => p.price <= 8000);
  assert(t5AllNike, 'Test 5: ALL candidates are Nike');
  assert(t5AllUnderBudget, 'Test 5: ALL candidates are <= ₹8,000');

  const t5Strategies = await optimizerService.optimizeByIntent(t5Ai.intent, t5Discovery.products);
  assert(t5Strategies[0].effectiveTotal <= 8000, 'Test 5: Effective total <= ₹8,000');
  console.log(`Best Pick: ${t5Strategies[0].items[0]?.brand} ${t5Strategies[0].items[0]?.title} (₹${t5Strategies[0].effectiveTotal})\n`);

  // =========================================================================
  // TEST 6: "I need a gaming laptop, mouse and headset under ₹1 lakh."
  // =========================================================================
  console.log('>>> TEST 6: "I need a gaming laptop, mouse and headset under ₹1 lakh." <<<');
  const t6Prompt = 'I need a gaming laptop, mouse and headset under ₹1 lakh.';
  const t6Ai = await geminiService.generateChatResponse({
    message: t6Prompt,
    conversationHistory: [],
    budget: '100000',
  });
  console.log('Parsed Budget:', t6Ai.intent.budget?.amount, '| Is Multi-Item:', t6Ai.intent.isMultiItem);
  console.log('Items Extracted:', t6Ai.intent.items?.map((i) => i.name));
  assert(t6Ai.intent.isMultiItem === true, 'Test 6: Multi-item detected');
  assert((t6Ai.intent.items?.length || 0) >= 3, 'Test 6: Extracted 3 items (laptop, mouse, headset)');

  const t6Discovery = await productDiscoveryService.discoverByIntent(t6Ai.intent);
  console.log(`Discovered ${t6Discovery.products.length} products across required items`);
  assert(t6Discovery.products.length > 0, 'Test 6: Found candidate products');

  const t6Strategies = await optimizerService.optimizeByIntent(t6Ai.intent, t6Discovery.products);
  assert(t6Strategies.length > 0, 'Test 6: Optimizer created multi-item basket');
  assert(t6Strategies[0].items.length >= 2, 'Test 6: Basket contains multi-item combination');
  assert(t6Strategies[0].effectiveTotal <= 100000, 'Test 6: Total basket effective price <= ₹1,00,000');

  console.log(`Optimized Basket (${t6Strategies[0].items.length} items, Total: ₹${t6Strategies[0].effectiveTotal}, Saved: ₹${t6Strategies[0].razorpaySavingsEstimate}):`);
  t6Strategies[0].items.forEach((it, idx) => {
    console.log(`  ${idx + 1}. [${it.merchantName}] ${it.brand} ${it.title} - Listed: ₹${it.price}`);
  });

  console.log('\n================================================================');
  console.log(`   ALL 6 TESTS PASSED: ${passedTests}/${totalTests} Assertions Succeeded!`);
  console.log('================================================================\n');
}

runDynamicDiscoveryTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
