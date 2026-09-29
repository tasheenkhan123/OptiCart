import { geminiService } from './services/ai/geminiService.js';
import { productDiscoveryService } from './services/discovery/productDiscoveryService.js';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

async function testQuery() {
  console.log('--- Testing "give me a lip balm for budget under 500" ---');
  const chatRes = await geminiService.generateChatResponse({
    message: 'give me a lip balm for budget under 500'
  });
  console.log('Chat reply:', chatRes.reply);
  console.log('Chat intent:', JSON.stringify(chatRes.intent, null, 2));

  const discoveryRes = await productDiscoveryService.discoverByIntent(chatRes.intent);
  console.log('Discovery products count:', discoveryRes.products.length);
  console.log('Discovery products:', JSON.stringify(discoveryRes.products.map(p => ({
    title: p.title,
    brand: p.brand,
    price: p.price,
    imageUrl: p.imageUrl,
    productUrl: p.productUrl,
    merchantName: p.merchantName,
    sourceType: p.sourceType
  })), null, 2));
}

testQuery();
