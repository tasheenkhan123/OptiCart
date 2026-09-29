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
    name: 'TEST 1: Nykaa Skincare (Toner + Cleanser under ₹3000)',
    query: 'My budget is ₹3000. I need a toner and cleanser. Find me good options.',
  },
  {
    name: 'TEST 2: Multiple Nykaa Products (3 products under ₹2000)',
    query: 'Show me 3 skincare products under ₹2000 from Nykaa.',
  },
  {
    name: 'TEST 3: Minimalist on Nykaa',
    query: 'Show me 3 Minimalist products under ₹2000 available on Nykaa.',
  },
  {
    name: 'TEST 4: Amazon ASUS Gaming Laptops',
    query: 'Show me 3 ASUS gaming laptops under ₹90000 from Amazon.',
  },
  {
    name: 'TEST 5: Dynamic Category (Summer Dresses)',
    query: 'Show me 3 summer dresses under ₹2000.',
  },
  {
    name: 'TEST 6: Multi-Item (Cleanser, Toner, Sunscreen under ₹5000)',
    query: 'I have ₹5000. I need a cleanser, toner and sunscreen.',
  },
];

async function runLinkVerification() {
  console.log('===============================================================');
  console.log('   OPTICART CRITICAL MERCHANT PRODUCT LINK & UI VERIFICATION   ');
  console.log('===============================================================\n');

  let passedAll = true;

  for (const tc of testCases) {
    console.log(`\n---------------------------------------------------------------`);
    console.log(`RUNNING: ${tc.name}`);
    console.log(`Query: "${tc.query}"`);
    console.log(`---------------------------------------------------------------`);

    // Step 1: Process chat query through Gemini AI Service
    const chatResult = await geminiService.generateChatResponse({
      message: tc.query,
      conversationHistory: [],
    });
    const intent: ShoppingIntent | undefined = chatResult.intent;

    if (!intent) {
      console.error(`❌ FAILED: No intent extracted for query: "${tc.query}"`);
      passedAll = false;
      continue;
    }

    console.log(`Intent Extracted: Category=${intent.category}, Budget=₹${intent.budget?.amount || 'N/A'}, Brands=${intent.preferredBrands?.join(',') || 'any'}, Items=${intent.items?.map(i => i.name).join(' + ') || 'Single'}, Readiness=${intent.readinessState}`);

    // Step 2: Optimize Purchase Strategies
    const strategies = await optimizerService.optimizeByIntent(intent);
    if (!strategies || strategies.length === 0) {
      console.error(`❌ FAILED: No strategies returned from optimizer.`);
      passedAll = false;
      continue;
    }

    const bestStrategy: PurchaseStrategyResult = strategies[0];
    console.log(`\n🏆 Strategy: ${bestStrategy.strategy}`);
    console.log(`   Total Effective Price: ₹${bestStrategy.effectiveTotal.toLocaleString('en-IN')}`);
    console.log(`   Total Discount: ₹${(bestStrategy.totalDiscount || 0).toLocaleString('en-IN')}`);
    console.log(`   Razorpay Payment Savings: ₹${(bestStrategy.razorpaySavingsEstimate || 0).toLocaleString('en-IN')}`);
    console.log(`   Items in recommendation: ${bestStrategy.items.length}`);

    const seenUrls = new Set<string>();

    for (let i = 0; i < bestStrategy.items.length; i++) {
      const product = bestStrategy.items[i];
      const url = product.productUrl || '';
      const isGoogleSearch = url.includes('google.com/search') || url.includes('bing.com/search');
      const isDirectMerchant = url.startsWith('http://') || url.startsWith('https://');

      console.log(`\n   Product #${i + 1}:`);
      console.log(`     - Title: ${product.title}`);
      console.log(`     - Brand: ${product.brand}`);
      console.log(`     - Merchant: ${product.merchantName} (${product.merchantDomain})`);
      console.log(`     - Price: ₹${product.price} (Effective: ₹${product.effectivePrice || product.price})`);
      console.log(`     - URL: ${url}`);

      // Check Criteria
      if (isGoogleSearch) {
        console.error(`     ❌ ERROR: URL contains generic search engine link!`);
        passedAll = false;
      } else if (!isDirectMerchant) {
        console.error(`     ❌ ERROR: URL is not a valid HTTP/HTTPS link!`);
        passedAll = false;
      } else {
        console.log(`     ✅ PASS: Valid merchant link.`);
      }

      if (seenUrls.has(url)) {
        console.warn(`     ⚠️ WARNING: Duplicate URL detected with another product in same recommendation.`);
      } else {
        seenUrls.add(url);
      }
    }
  }

  console.log(`\n===============================================================`);
  if (passedAll) {
    console.log(`🎉 ALL 6 TEST CASES PASSED WITH 100% VALID MERCHANT LINKS!`);
  } else {
    console.error(`❌ SOME TESTS FAILED. CHECK LOGS ABOVE.`);
  }
  console.log(`===============================================================\n`);
}

runLinkVerification().catch((err) => {
  console.error('Fatal error running verification:', err);
  process.exit(1);
});
