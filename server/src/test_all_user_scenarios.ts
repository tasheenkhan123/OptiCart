import { geminiService } from './services/ai/geminiService.js';
import { productDiscoveryService } from './services/discovery/productDiscoveryService.js';
import { optimizerService } from './services/optimizer/optimizerService.js';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

async function verifyScenario(prompt: string) {
  console.log(`\n======================================================`);
  console.log(`TESTING PROMPT: "${prompt}"`);
  console.log(`======================================================`);

  const chatRes = await geminiService.generateChatResponse({ message: prompt });
  console.log(`1. Reply: "${chatRes.reply}"`);
  console.log(`2. Extracted Intent:`, {
    category: chatRes.intent.category,
    productType: chatRes.intent.productType,
    budget: chatRes.intent.budget,
    isMultiItem: chatRes.intent.isMultiItem
  });

  const discoveryRes = await productDiscoveryService.discoverByIntent(chatRes.intent);
  console.log(`3. Discovery Products Count: ${discoveryRes.products.length}`);
  
  const strategies = await optimizerService.optimizeByIntent(chatRes.intent, discoveryRes.products);
  console.log(`4. Generated Strategies Count: ${strategies.length}`);

  strategies.forEach((s, idx) => {
    console.log(`\n   [Strategy ${idx + 1}] (${s.strategy}) - Total: ₹${s.effectiveTotal.toLocaleString('en-IN')}`);
    s.items.forEach(p => {
      console.log(`     * Title: ${p.title}`);
      console.log(`       Brand: ${p.brand} | Store: ${p.merchantName} | Price: ₹${p.price}`);
      console.log(`       Image: ${p.imageUrl}`);
      console.log(`       Link: ${p.productUrl}`);
    });
  });
}

async function runAll() {
  await verifyScenario('Give me a lip balm for budget under 500');
  await verifyScenario('I have ₹3,000 and need a toner and cleanser');
  await verifyScenario('ASUS gaming laptop under 90k');
}

runAll();
