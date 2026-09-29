async function runE2EJourney() {
  console.log('===============================================================');
  console.log('      OPTICART LIVE END-TO-END HTTP API VERIFICATION           ');
  console.log('===============================================================\n');

  const API_BASE = 'http://localhost:5000/api';

  // 1. Health check
  console.log('1. Checking Server Health...');
  const healthRes = await fetch(`${API_BASE}/health`);
  const healthJson = await healthRes.json();
  console.log('   Health Status:', healthJson.status || healthJson.message || 'OK');

  // 2. User Exact Audio Prompt
  console.log('\n2. Testing Exact User Prompt on POST /api/chat:');
  const userPrompt = 'I have ₹3,000 and need a toner and cleanser. Choose the best brands for me, give me 3 different combinations within my budget, and provide the direct product links.';
  console.log(`   User Prompt: "${userPrompt}"`);

  const chatRes = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userPrompt })
  });

  const chatData = await chatRes.json();
  if (!chatData.success) {
    throw new Error(`Chat API error: ${chatData.error}`);
  }

  const { reply, intent } = chatData.data;
  console.log(`   Assistant Reply: "${reply}"`);
  console.log(`   Intent Extracted:`, {
    category: intent.category,
    productType: intent.productType,
    budget: intent.budget,
    isMultiItem: intent.isMultiItem,
    items: intent.items?.map((i: any) => i.name),
    readinessState: intent.readinessState
  });

  if (intent.readinessState !== 'ready_for_recommendation') {
    throw new Error(`❌ Intent readinessState is "${intent.readinessState}", expected "ready_for_recommendation"!`);
  }
  if (!intent.budget || intent.budget.amount !== 3000) {
    throw new Error(`❌ Intent budget amount is ${intent.budget?.amount}, expected 3000!`);
  }
  console.log('   ✅ Intent & Budget successfully validated on Turn 1!');

  // 3. Optimizer Strategies
  console.log('\n3. Testing POST /api/optimize with extracted intent:');
  const optRes = await fetch(`${API_BASE}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intent })
  });

  const optData = await optRes.json();
  if (!optData.success) {
    throw new Error(`Optimize API error: ${optData.error}`);
  }

  const strategies = optData.data.strategies;
  console.log(`   Strategies / Bundles returned: ${strategies.length}`);

  strategies.forEach((s: any, idx: number) => {
    const savings = (s.totalDiscount || 0) + (s.razorpaySavingsEstimate || 0);
    console.log(`\n   [OPTION ${idx + 1}] (${s.strategy}) - Total Effective Price: ₹${s.effectiveTotal.toLocaleString('en-IN')} (Saved: ₹${savings.toLocaleString('en-IN')})`);
    s.items.forEach((p: any) => {
      console.log(`     - [${p.itemRequirementName || p.recommendationLabel || 'Item'}] ${p.title}`);
      console.log(`       Store: ${p.merchantName} | Price: ₹${p.price} | Link: ${p.productUrl}`);
      if (!p.productUrl || p.productUrl.includes('undefined') || p.productUrl.includes('404')) {
        throw new Error(`❌ Invalid product URL: ${p.productUrl}`);
      }
    });
  });

  console.log('\n===============================================================');
  console.log('🎉 E2E VERIFICATION PASSED PERFECTLY!');
  console.log('===============================================================');
}

runE2EJourney().catch((err) => {
  console.error('Fatal E2E Error:', err);
  process.exit(1);
});
