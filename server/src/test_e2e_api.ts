async function testE2EHttpEndpoints() {
  console.log('Testing running backend at http://localhost:5000...');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  console.log('Health check response:', healthData);

  // 2. Test TEST 1 via POST /api/chat
  console.log('\n--- E2E TEST 1 (HTTP POST /api/chat): "My budget is ₹3000. I want a toner and cleanser." ---');
  const chat1Res = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'My budget is ₹3000. I want a toner and cleanser.',
      conversationHistory: []
    })
  });
  const chat1Json = (await chat1Res.json()) as any;
  const chat1Data = chat1Json.data;
  console.log('Chat 1 Reply:', chat1Data?.reply);
  console.log('Chat 1 Intent:', {
    category: chat1Data?.intent?.category,
    budget: chat1Data?.intent?.budget,
    isMultiItem: chat1Data?.intent?.isMultiItem,
    items: chat1Data?.intent?.items?.map((i: any) => ({ name: i.name, category: i.category })),
    readiness: chat1Data?.intent?.readinessState
  });

  // Optimize endpoint call for Test 1
  if (chat1Data?.intent && chat1Data?.intent.readinessState === 'ready_for_recommendation') {
    const opt1Res = await fetch('http://localhost:5000/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: chat1Data.intent })
    });
    const opt1Json = (await opt1Res.json()) as any;
    const opt1Data = opt1Json.data;
    console.log('Optimize 1 Strategies count:', opt1Data?.strategies?.length);
    const bestStrat = opt1Data?.strategies?.[0];
    console.log('Best Value Strategy Total: ₹' + bestStrat?.effectiveTotal, 'Items count:', bestStrat?.items?.length);
    bestStrat?.items?.forEach((it: any) => {
      console.log(`  - [${it.itemRequirementName || it.category}] ${it.title} (${it.brand}) @ ₹${it.price} (from ${it.merchantName})`);
    });
  }

  // 3. Test TEST 4 via POST /api/chat
  console.log('\n--- E2E TEST 4 (HTTP POST /api/chat): "I need a good ASUS gaming laptop under ₹90000. Show me 3 options and give me the product links." ---');
  const chat4Res = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'I need a good ASUS gaming laptop under ₹90000. Show me 3 options and give me the product links.',
      conversationHistory: []
    })
  });
  const chat4Json = (await chat4Res.json()) as any;
  const chat4Data = chat4Json.data;
  console.log('Chat 4 Reply:', chat4Data?.reply);
  console.log('Chat 4 Intent:', {
    category: chat4Data?.intent?.category,
    brand: chat4Data?.intent?.preferredBrands,
    budget: chat4Data?.intent?.budget,
    count: chat4Data?.intent?.requestedResultCount,
    readiness: chat4Data?.intent?.readinessState
  });

  if (chat4Data?.intent && chat4Data?.intent.readinessState === 'ready_for_recommendation') {
    const opt4Res = await fetch('http://localhost:5000/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: chat4Data.intent })
    });
    const opt4Json = (await opt4Res.json()) as any;
    const opt4Data = opt4Json.data;
    const bestStrat = opt4Data?.strategies?.[0];
    console.log('Best Value Strategy Distinct Items count:', bestStrat?.items?.length);
    bestStrat?.items?.forEach((it: any, idx: number) => {
      console.log(`  #${idx + 1} [${it.recommendationLabel}] ${it.title} (${it.brand}) @ ₹${it.price} (Merchant: ${it.merchantName}) -> Link: ${it.productUrl || 'verified search'}`);
    });
  }

  console.log('\n✅ End-to-End HTTP API testing completed successfully!');
}

testE2EHttpEndpoints().catch(console.error);
