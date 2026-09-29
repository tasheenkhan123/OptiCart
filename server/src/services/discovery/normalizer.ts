import { NormalizedProduct, ProductAvailability, ProductSourceType } from '../../types/product.js';

export class ProductNormalizer {
  /**
   * Normalizes raw or semi-structured product objects into strict NormalizedProduct objects
   */
  static normalize(raw: Partial<NormalizedProduct>, fallbackSource: ProductSourceType = 'mock'): NormalizedProduct {
    const id = raw.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const title = (raw.title || raw['name' as keyof typeof raw] || 'Unnamed Product').toString().trim();
    const brand = (raw.brand || this.extractBrandFromTitle(title) || 'Generic').toString().trim();
    const category = (raw.category || 'General').toString().trim();
    const price = typeof raw.price === 'number' ? Math.max(0, raw.price) : 0;
    const originalPrice = typeof raw.originalPrice === 'number' ? Math.max(price, raw.originalPrice) : undefined;
    const currency = (raw.currency || 'INR').toUpperCase();
    const merchantName = (raw.merchantName || 'Direct Merchant').toString().trim();
    const merchantDomain = raw.merchantDomain || this.guessDomainFromMerchantName(merchantName);

    let availability: ProductAvailability = 'in_stock';
    const legacyRaw = raw as Record<string, unknown>;
    if (raw.availability) {
      if (['in_stock', 'out_of_stock', 'limited_stock', 'pre_order'].includes(raw.availability)) {
        availability = raw.availability as ProductAvailability;
      }
    } else if (legacyRaw.inStock === false) {
      availability = 'out_of_stock';
    }

    const rating = typeof raw.rating === 'number' ? Math.min(5, Math.max(0, raw.rating)) : undefined;
    const reviewCount = typeof raw.reviewCount === 'number' ? Math.max(0, Math.floor(raw.reviewCount)) : undefined;
    const confidence = typeof raw.confidence === 'number' ? Math.min(1.0, Math.max(0.0, raw.confidence)) : 0.9;
    const sourceType: ProductSourceType = raw.sourceType || fallbackSource;

    return {
      id,
      title,
      brand,
      category,
      price,
      originalPrice,
      currency,
      merchantName,
      merchantDomain,
      productUrl: raw.productUrl,
      imageUrl: raw.imageUrl || (typeof legacyRaw.image === 'string' ? legacyRaw.image : undefined),
      rating,
      reviewCount,
      availability,
      deliveryInformation: raw.deliveryInformation || (typeof legacyRaw.deliveryDays === 'number' ? { deliveryDays: legacyRaw.deliveryDays, freeDelivery: true } : undefined),
      specifications: raw.specifications,
      sourceType,
      sourceUrl: raw.sourceUrl,
      confidence,
      paymentOffers: raw.paymentOffers || [],
      merchantTrustScore: raw.merchantTrustScore || (typeof legacyRaw.merchantTrustScore === 'number' ? legacyRaw.merchantTrustScore : 4.5),
    };
  }


  /**
   * Deduplicate and sort normalized product lists by relevance and confidence
   */
  static deduplicate(products: NormalizedProduct[]): NormalizedProduct[] {
    const seen = new Set<string>();
    const deduplicated: NormalizedProduct[] = [];

    for (const prod of products) {
      // Create a normalized fingerprint based on title and merchant
      const cleanTitle = prod.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanMerchant = prod.merchantName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fingerprint = `${cleanTitle}::${cleanMerchant}`;

      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        deduplicated.push(prod);
      }
    }

    return deduplicated;
  }

  private static extractBrandFromTitle(title: string): string | null {
    const knownBrands = [
      'Samsung', 'Apple', 'ASUS', 'Lenovo', 'Acer', 'HP', 'Dell',
      'Sony', 'Poco', 'Realme', 'OnePlus', 'Xiaomi', 'Minimalist',
      'DermaGlow', 'PlayStation', 'Borges', 'Bose', 'Logitech',
    ];

    for (const b of knownBrands) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(title)) {
        return b;
      }
    }
    return null;
  }

  private static guessDomainFromMerchantName(merchantName: string): string {
    const m = merchantName.toLowerCase();
    if (m.includes('amazon')) return 'amazon.in';
    if (m.includes('croma')) return 'croma.com';
    if (m.includes('nykaa')) return 'nykaa.com';
    if (m.includes('samsung')) return 'samsung.com/in';
    if (m.includes('reliance')) return 'reliancedigital.in';
    if (m.includes('vijay')) return 'vijaysales.com';
    if (m.includes('blinkit')) return 'blinkit.com';
    if (m.includes('flipkart')) return 'flipkart.com';
    return `${m.replace(/[^a-z0-9]/g, '')}.com`;
  }
}
