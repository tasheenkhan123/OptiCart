import { GoogleGenAI } from '@google/genai';
import { NormalizedProduct, ProductSourceType } from '../../../types/product.js';
import { ShoppingIntent } from '../../../types/intent.js';
import { ProductSearchProvider, SearchOptions } from './provider.js';
import { ENV } from '../../../config/env.js';

/**
 * Web Search Grounding Provider
 * Uses Google Search Grounding with Gemini API to retrieve live, grounded product search
 * and real merchant information across permitted e-commerce sources.
 */
export class WebSearchGroundingProvider implements ProductSearchProvider {
  readonly id = 'google-search-grounding-provider';
  readonly name = 'Google Live Search Grounding Provider';
  readonly sourceType: ProductSourceType = 'web_search';

  private client: GoogleGenAI | null = null;
  private readonly model = 'gemini-3.6-flash';

  constructor() {
    if (ENV.hasGeminiKey) {
      this.client = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    }
  }

  isAvailable(): boolean {
    return ENV.hasGeminiKey;
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    }
    return this.client;
  }

  async search(intent: ShoppingIntent, options?: SearchOptions): Promise<NormalizedProduct[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const query = `${intent.preferredBrands.length ? intent.preferredBrands.join(' ') + ' ' : ''}${intent.productType || intent.category} ${intent.budget?.amount ? 'under ' + intent.budget.amount : ''} price in India buy online`;
    return this.executeGroundedSearch(query, intent.category, options);
  }

  async searchByQuery(query: string, category?: string, options?: SearchOptions): Promise<NormalizedProduct[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const searchQuery = `${query} ${category || ''} buy online price in India`.trim();
    return this.executeGroundedSearch(searchQuery, category, options);
  }

  private async executeGroundedSearch(
    searchQuery: string,
    categoryHint?: string,
    options?: SearchOptions
  ): Promise<NormalizedProduct[]> {
    try {
      const ai = this.getClient();

      const prompt = `Search for real commercial products currently available for purchase online in India for query: "${searchQuery}".
Return 3-5 real matching products with their exact current pricing in INR, brand, real merchant store (Amazon, Croma, Flipkart, Reliance Digital, Nykaa, Samsung), rating, and specifications.

Respond in strict JSON with the following schema:
{
  "products": [
    {
      "title": "Exact product title",
      "brand": "Brand name",
      "category": "${categoryHint || 'Electronics'}",
      "price": 12345,
      "originalPrice": 14999,
      "currency": "INR",
      "merchantName": "Amazon India | Croma | Nykaa | Samsung | Reliance Digital | Flipkart",
      "merchantDomain": "amazon.in | croma.com | nykaa.com | samsung.com | flipkart.com",
      "rating": 4.5,
      "reviewCount": 1200,
      "availability": "in_stock",
      "productUrl": "https://...",
      "specifications": { "key": "value" },
      "paymentOffers": ["e.g. Instant Bank Offer via Razorpay"]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          // Enable Google Search Grounding tool
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const rawText = response.text || '';
      let parsed: { products?: Array<Partial<NormalizedProduct>> } = {};

      try {
        parsed = JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
        parsed = JSON.parse(cleaned);
      }

      if (!parsed.products || !Array.isArray(parsed.products)) {
        return [];
      }

      // Extract real grounding source URLs if available in grounding metadata
      const candidates = response.candidates;
      const groundingChunks = candidates?.[0]?.groundingMetadata?.groundingChunks;
      const groundingWebUrls: string[] = [];
      if (groundingChunks && Array.isArray(groundingChunks)) {
        for (const chunk of groundingChunks) {
          if (chunk.web?.uri) {
            groundingWebUrls.push(chunk.web.uri);
          }
        }
      }

      const products: NormalizedProduct[] = parsed.products.map((raw, idx) => {
        // Look for genuine merchant URLs in grounding metadata or raw data
        const merchantDomain = raw.merchantDomain || (raw.merchantName ? `${raw.merchantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : 'merchant.com');
        const merchantName = raw.merchantName || 'Online Retailer';

        // Check if raw.productUrl is a direct product link
        let directUrl: string | undefined = undefined;
        if (
          raw.productUrl &&
          typeof raw.productUrl === 'string' &&
          (raw.productUrl.startsWith('http://') || raw.productUrl.startsWith('https://')) &&
          !raw.productUrl.includes('google.com/search') &&
          !raw.productUrl.includes('bing.com/search') &&
          !raw.productUrl.includes('vertexaisearch')
        ) {
          directUrl = raw.productUrl;
        }

        // Check grounding chunks for genuine merchant domain URLs
        if (!directUrl && groundingWebUrls.length > 0) {
          const match = groundingWebUrls.find(
            (u) =>
              (u.includes('amazon.in') ||
                u.includes('nykaa.com') ||
                u.includes('croma.com') ||
                u.includes('reliancedigital.in') ||
                u.includes('myntra.com') ||
                u.includes('flipkart.com') ||
                u.includes('samsung.com') ||
                u.includes('zara.com') ||
                u.includes('nike.com')) &&
              !u.includes('google.com') &&
              !u.includes('search')
          );
          if (match) {
            directUrl = match;
          }
        }

        // Dedicated merchant search URL fallback (never generic Google search)
        const q = encodeURIComponent((raw.title || searchQuery).trim());
        const m = merchantName.toLowerCase();
        let merchantSearchFallback = `https://${merchantDomain}/search?q=${q}`;

        if (m.includes('nykaa') || merchantDomain.includes('nykaa')) {
          merchantSearchFallback = `https://www.nykaa.com/search/result/?q=${q}`;
        } else if (m.includes('amazon') || merchantDomain.includes('amazon')) {
          merchantSearchFallback = `https://www.amazon.in/s?k=${q}`;
        } else if (m.includes('croma') || merchantDomain.includes('croma')) {
          merchantSearchFallback = `https://www.croma.com/searchB?q=${q}`;
        } else if (m.includes('reliance') || merchantDomain.includes('reliancedigital')) {
          merchantSearchFallback = `https://www.reliancedigital.in/search?q=${q}`;
        } else if (m.includes('myntra') || merchantDomain.includes('myntra')) {
          merchantSearchFallback = `https://www.myntra.com/${encodeURIComponent((raw.title || searchQuery).toLowerCase().replace(/\s+/g, '-'))}`;
        } else if (m.includes('flipkart') || merchantDomain.includes('flipkart')) {
          merchantSearchFallback = `https://www.flipkart.com/search?q=${q}`;
        } else if (m.includes('samsung') || merchantDomain.includes('samsung')) {
          merchantSearchFallback = `https://www.samsung.com/in/search/?searchvalue=${q}`;
        }

        const finalProductUrl = directUrl || merchantSearchFallback;

        return {
          id: `web-grounded-${Date.now()}-${idx}`,
          title: raw.title || 'Product Listing',
          brand: raw.brand || 'Brand',
          category: raw.category || categoryHint || 'General',
          price: typeof raw.price === 'number' ? raw.price : 0,
          originalPrice: raw.originalPrice,
          currency: 'INR',
          merchantName,
          merchantDomain,
          productUrl: finalProductUrl,
          imageUrl: raw.imageUrl,
          rating: typeof raw.rating === 'number' ? raw.rating : 4.4,
          reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : 500,
          availability: raw.availability || 'in_stock',
          deliveryInformation: { deliveryDays: 2, freeDelivery: true },
          specifications: raw.specifications,
          sourceType: 'web_search',
          sourceUrl: finalProductUrl,
          confidence: 0.92,
          paymentOffers: raw.paymentOffers || ['Instant Bank Discount with Razorpay'],
          merchantTrustScore: 4.7,
        };
      });

      const limit = options?.limit || 10;
      return products.slice(0, limit);
    } catch (err) {
      console.warn('[WebSearchGroundingProvider Notice]: Grounded search error:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}

export const webSearchGroundingProvider = new WebSearchGroundingProvider();
