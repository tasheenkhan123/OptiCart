/**
 * Extracts a concise, model-accurate search query from a detailed product title.
 * Strips bracketed specifications, ingredient lists, and marketing filler
 * so merchant search engines (Amazon, Nykaa, Croma) match the EXACT product model
 * rather than showing unrelated sponsored products or accessories.
 */
export function getPreciseSearchQuery(title?: string, brand?: string): string {
  if (!title) return (brand || 'Product').trim();

  let clean = title;

  // 1. Remove parenthetical / bracketed specs: (Core i5 12th Gen, 16GB RAM...), (150ml), [100g]
  clean = clean.replace(/\([^)]*\)/g, ' ');
  clean = clean.replace(/\[[^\]]*\]/g, ' ');

  // 2. Remove volume / size specifications: 150ml, 50g, 100ml, 4.8g, 12g, 8g, 30ml
  clean = clean.replace(/\b\d+(\.\d+)?\s*(?:ml|g|gm|kg|l|litre|litres|oz|pack|count|pcs|cm|inch)\b/gi, ' ');

  // 3. Remove verbose marketing fluff that causes Amazon/Nykaa to fall back to broad keyword matching
  clean = clean.replace(/\b(?:lightweight|road|obsidian|colorway|daily|balancing|soothing|calming|clarifying|gentle|foaming|nourishing|hydrating|natural|vegan|24h|24-hour|active|overnight|intense|moisture|melt-in)\b/gi, ' ');

  // 4. Clean punctuation
  clean = clean.replace(/[,+&/\\|:;]/g, ' ').replace(/\s+/g, ' ').trim();

  // 5. Ensure brand is present at start without duplication
  const cleanBrand = (brand || '').trim();
  if (cleanBrand && !clean.toLowerCase().startsWith(cleanBrand.toLowerCase())) {
    clean = `${cleanBrand} ${clean}`;
  }

  // 6. Keep search query focused (max 5 key model words)
  const words = clean.split(' ').filter((w) => w.length > 0);
  if (words.length > 5) {
    clean = words.slice(0, 5).join(' ');
  }

  return clean || title;
}

/**
 * Client-side verified merchant store search URL builder.
 * Ensures users land directly on the merchant's live search page with the exact product title.
 */
export function getMerchantStoreSearchUrl(
  merchantName?: string,
  title?: string,
  merchantDomain?: string,
  existingUrl?: string,
  brand?: string
): string {
  const m = (merchantName || '').toLowerCase();
  const d = (merchantDomain || '').toLowerCase();

  const query = getPreciseSearchQuery(title, brand);
  const q = encodeURIComponent(query);

  // If existingUrl is a verified external link (not a fake internal / mock ASIN)
  if (
    existingUrl &&
    typeof existingUrl === 'string' &&
    (existingUrl.startsWith('http://') || existingUrl.startsWith('https://')) &&
    !existingUrl.includes('/dp/B0') &&
    !existingUrl.includes('google.com/search') &&
    !existingUrl.includes('bing.com/search') &&
    !existingUrl.includes('vertexaisearch') &&
    !existingUrl.includes('.internal') &&
    !existingUrl.includes('mock') &&
    !existingUrl.includes('tirabeauty.com')
  ) {
    return existingUrl;
  }

  if (m.includes('nykaa') || d.includes('nykaa')) {
    return `https://www.nykaa.com/search/result/?q=${q}`;
  }
  if (m.includes('tira') || d.includes('tira') || d.includes('tirabeauty')) {
    return `https://www.nykaa.com/search/result/?q=${q}`;
  }
  if (m.includes('amazon') || d.includes('amazon')) {
    return `https://www.amazon.in/s?k=${q}`;
  }
  if (m.includes('croma') || d.includes('croma')) {
    return `https://www.croma.com/searchB?q=${q}`;
  }
  if (m.includes('reliance') || d.includes('reliancedigital')) {
    return `https://www.reliancedigital.in/search?q=${q}`;
  }
  if (m.includes('myntra') || d.includes('myntra')) {
    return `https://www.myntra.com/${encodeURIComponent(query.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`;
  }
  if (m.includes('flipkart') || d.includes('flipkart')) {
    return `https://www.flipkart.com/search?q=${q}`;
  }
  if (m.includes('samsung') || d.includes('samsung')) {
    return `https://www.samsung.com/in/search/?searchvalue=${q}`;
  }
  if (m.includes('zara') || d.includes('zara')) {
    return `https://www.zara.com/in/en/search?searchTerm=${q}`;
  }
  if (m.includes('nike') || d.includes('nike')) {
    return `https://www.amazon.in/s?k=${q}`;
  }

  if (d && d.includes('.') && !d.includes('tirabeauty')) {
    return `https://${d}/search?q=${q}`;
  }

  return `https://www.amazon.in/s?k=${q}`;
}
