import { geminiService } from './services/ai/geminiService.js';
import { optimizerService } from './services/optimizer/optimizerService.js';

async function testUserPrompts() {
  console.log('=== TEST 1: Exact User Voice Prompt ===');
  const p1 = 'I have ₹3,000 and need a toner and cleanser. Choose the best brands for me, give me 3 different combinations within my budget, and provide the direct product links.';
  const r1 = await geminiService.generateChatResponse({ message: p1 });
  console.log('Reply:', r1.reply);
  console.log('Intent readinessState:', r1.intent.readinessState);
  console.log('Intent budget:', r1.intent.budget);
  console.log('Intent isMultiItem:', r1.intent.isMultiItem);
  console.log('Intent items:', r1.intent.items);

  if (r1.intent.readinessState === 'ready_for_recommendation') {
    const strategies = await optimizerService.optimizeByIntent(r1.intent);
    console.log(`Strategies count: ${strategies.length}`);
    strategies.forEach((s, idx) => {
      const savings = (s.totalDiscount || 0) + (s.razorpaySavingsEstimate || 0);
      console.log(`\nOption ${idx + 1} (${s.strategy}): Total ₹${s.effectiveTotal} (Savings: ₹${savings})`);
      s.items.forEach((p) => {
        console.log(`  - [${p.merchantName}] ${p.title} -> ${p.productUrl}`);
      });
    });
  } else {
    console.log('❌ FAILED: Intent was NOT ready_for_recommendation on turn 1!');
  }

  console.log('\n=== TEST 2: User says just "3000" ===');
  const r2 = await geminiService.generateChatResponse({
    message: '3000',
    previousIntent: {
      category: 'Skincare',
      productType: 'Face Toner + Face Cleanser Basket',
      readinessState: 'needs_budget',
      summary: 'Face Toner + Face Cleanser under budget',
      isMultiItem: true,
      items: [
        { name: 'Face Toner', category: 'Skincare' },
        { name: 'Face Cleanser', category: 'Skincare' }
      ]
    }
  });
  console.log('Reply 2:', r2.reply);
  console.log('Intent 2 readinessState:', r2.intent.readinessState);
  console.log('Intent 2 budget:', r2.intent.budget);
}

testUserPrompts().catch(console.error);
