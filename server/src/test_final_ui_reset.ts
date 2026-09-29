import { geminiService } from './services/ai/geminiService.js';
import { optimizerService } from './services/optimizer/optimizerService.js';
import { ShoppingIntent } from './types/intent.js';
import { PurchaseStrategyResult } from './types/optimizer.js';

interface TestCase {
  name: string;
  query: string;
}

const testCases: TestCase[] = [
  {
    name: 'TEST 1: Skincare (Toner + Cleanser under ₹3000)',
    query: 'I have a budget of ₹3,000 and I need a toner and cleanser. Please find 3 good options, choose the brands for me, compare them, and give me the direct product links.',
  },
  {
    name: 'TEST 2: ASUS Gaming Laptops (3 Options under ₹90000)',
    query: 'I need a good ASUS gaming laptop under ₹90,000. Show me 3 options with product links.',
  },
  {
    name: 'TEST 3: Summer Dresses (3 Options under ₹2000)',
    query: 'I need a cute summer dress under ₹2,000. Show me 3 options.',
  },
  {
    name: 'TEST 4: Minimalist Toner and Cleanser',
    query: 'I want Minimalist toner and cleanser under ₹3,000.',
  },
  {
    name: 'TEST 5: Nike Running Shoes (3 Options under ₹8000)',
    query: 'I need 3 Nike running shoes under ₹8000.',
  },
  {
    name: 'TEST 6: Cleanser with Automated Brand Selection',
    query: 'I need a cleanser under ₹1000. You choose the brand.',
  },
];

async function runTests() {
  console.log('================================================================');
  console.log('       OPTICART FINAL RECOMMENDATION UI RESET VERIFICATION      ');
  console.log('================================================================\n');

  for (const tc of testCases) {
    console.log(`----------------------------------------------------------------`);
    console.log(`RUNNING: ${tc.name}`);
    console.log(`User Query: "${tc.query}"`);
    console.log(`----------------------------------------------------------------`);

    const chatRes = await geminiService.generateChatResponse({
      message: tc.query,
      conversationHistory: [],
    });

    const intent: ShoppingIntent = chatRes.intent;
    console.log(`Intent Category: ${intent.category} | Budget: ₹${intent.budget?.amount || 'N/A'} | MultiItem: ${intent.isMultiItem}`);
    if (intent.items) {
      console.log(`Items in slot requirements: ${intent.items.map(i => i.name).join(' + ')}`);
    }

    const strategies: PurchaseStrategyResult[] = await optimizerService.optimizeByIntent(intent);
    console.log(`Strategies / Bundles returned: ${strategies.length}\n`);

    if (intent.isMultiItem) {
      // Multi-item presentation: Option 1, Option 2, Option 3 (Bundles)
      strategies.forEach((strat, idx) => {
        console.log(`  [OPTION ${idx + 1}] -> Total Effective Price: ₹${strat.effectiveTotal.toLocaleString('en-IN')} (Discount: ₹${strat.totalDiscount} | Savings: ₹${strat.razorpaySavingsEstimate} | Under budget: ₹${strat.budgetHeadroom})`);
        strat.items.forEach((it) => {
          console.log(`     - [${it.itemRequirementName || it.category}] ${it.title} (${it.brand} @ ${it.merchantName}) -> Price: ₹${it.price} | URL: ${it.productUrl}`);
        });
      });
    } else {
      // Single product presentation: Option 1, Option 2, Option 3
      const singleStrat = strategies[0];
      if (singleStrat) {
        singleStrat.items.forEach((it, idx) => {
          console.log(`  [OPTION ${idx + 1}] -> ${it.title} (${it.brand})`);
          console.log(`     Merchant: ${it.merchantName} | Price: ₹${it.price} (Effective: ₹${it.effectivePrice || it.price}) | URL: ${it.productUrl}`);
        });
      }
    }
    console.log('');
  }

  console.log('================================================================');
  console.log('               ALL TEST CASES COMPLETED CLEANLY                 ');
  console.log('================================================================\n');
}

runTests().catch(console.error);
