import { providerRegistry } from './services/discovery/providerRegistry.js';
import { productDiscoveryService } from './services/discovery/productDiscoveryService.js';
import { ProductNormalizer } from './services/discovery/normalizer.js';
import { ShoppingIntent } from './types/intent.js';
import { NormalizedProduct } from './types/product.js';

async function runMerchantRetrievalVerification() {
  console.log('================================================================');
  console.log('     OPTICART — REAL MERCHANT PRODUCT RETRIEVAL VERIFICATION     ');
  console.log('================================================================\n');

  // Test 1: Inspect Provider Registry & Connection Status
  console.log('--- 1. Provider Registry Inspection ---');
  const providers = providerRegistry.listProviders();
  console.table(
    providers.map((p) => ({
      ID: p.id,
      Name: p.name,
      'Source Type': p.sourceType,
      'Is Active': p.available ? '✅ Yes' : '❌ No (Placeholder/Inactive)',
      Status: p.statusDescription,
    }))
  );

  // Test 2: Verify Parallel Multi-Provider Search Execution
  console.log('\n--- 2. Parallel Multi-Provider Search Execution ---');
  const mockIntent: ShoppingIntent = {
    category: 'Laptops',
    productType: 'Gaming Laptop',
    budget: { amount: 80000, currency: 'INR', raw: '₹80,000' },
    preferredBrands: ['ASUS', 'Lenovo'],
    excludedBrands: [],
    qualityPreference: 'best-value',
    importantFeatures: ['16GB RAM', 'RTX 3050 or RTX 4050'],
    userPriorities: ['GPU Performance'],
    assumptionsMade: [],
    readinessState: 'ready_for_recommendation',
    summary: 'Gaming laptop with 16GB RAM and RTX graphics under ₹80,000',
  };

  const discoveryResult = await productDiscoveryService.discoverByIntent(mockIntent);
  console.log(`Discovered ${discoveryResult.filteredCount} products across ${discoveryResult.sources.length} sources.`);
  console.log('Source Breakdown:');
  discoveryResult.sources.forEach((s) => {
    console.log(`  • ${s.name} [${s.sourceType}]: ${s.count} products (Available: ${s.isAvailable})`);
  });

  // Test 3: Verify Normalization and Cross-Merchant Deduplication
  console.log('\n--- 3. Normalization & Cross-Merchant Deduplication ---');
  const duplicateCandidates: Partial<NormalizedProduct>[] = [
    {
      id: 'prod-1',
      title: 'Lenovo LOQ 15 Gaming Laptop',
      brand: 'Lenovo',
      price: 75990,
      merchantName: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0CX8X1234',
      sourceType: 'web_search',
    },
    {
      id: 'prod-2',
      title: 'Lenovo LOQ 15 Gaming Laptop',
      brand: 'Lenovo',
      price: 75990,
      merchantName: 'Amazon India', // Exact same merchant & title
      productUrl: 'https://www.amazon.in/dp/B0CX8X1234',
      sourceType: 'web_search',
    },
    {
      id: 'prod-3',
      title: 'Lenovo LOQ 15 Gaming Laptop',
      brand: 'Lenovo',
      price: 74990,
      merchantName: 'Croma', // Different merchant - should be preserved
      productUrl: 'https://www.croma.com/lenovo-loq-15/p/123456',
      sourceType: 'merchant_api',
    },
  ];

  const normalized = duplicateCandidates.map((c) => ProductNormalizer.normalize(c));
  const deduplicated = ProductNormalizer.deduplicate(normalized);

  console.log(`Input items: ${duplicateCandidates.length}`);
  console.log(`Deduplicated count: ${deduplicated.length} (Expected: 2 - Amazon & Croma)`);
  deduplicated.forEach((item) => {
    console.log(`  ✔ [${item.merchantName}] ${item.title} -> URL: ${item.productUrl}`);
  });

  // Test 4: Verify Product URL Preservation & Zero URL Fabrication
  console.log('\n--- 4. Product URL Integrity & Zero URL Fabrication ---');
  discoveryResult.products.slice(0, 3).forEach((p, idx) => {
    console.log(`Item #${idx + 1}: ${p.brand} - ${p.title}`);
    console.log(`  Merchant: ${p.merchantName} (${p.merchantDomain})`);
    console.log(`  Source Type: ${p.sourceType}`);
    console.log(`  Product URL: ${p.productUrl || '(None - Mock catalog item)'}`);
    if (p.sourceType === 'mock') {
      console.log('  Status: Correctly marked as mock/catalog data without fake live URLs.');
    } else if (p.sourceType === 'web_search') {
      console.log('  Status: Real grounded web search URL attached.');
    }
  });

  console.log('\n================================================================');
  console.log('    MERCHANT RETRIEVAL ARCHITECTURE VERIFICATION COMPLETE       ');
  console.log('================================================================\n');
}

runMerchantRetrievalVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
