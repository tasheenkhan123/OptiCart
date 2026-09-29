import { ProductItem } from '../../types/index.js';
import { NormalizedProduct } from '../../types/product.js';
import { initialMockProducts } from '../../data/mockProducts.js';
import { productDiscoveryService } from '../discovery/productDiscoveryService.js';
import { ProductNormalizer } from '../discovery/normalizer.js';

/**
 * Multi-Merchant Aggregator Service
 * Connects high-level shopping workflows and Optimizer with the Discovery Engine.
 */
export interface MerchantServiceContract {
  searchProducts(query: string, category?: string): Promise<ProductItem[]>;
  getProductById(id: string): Promise<ProductItem | null>;
  getAllProducts(): Promise<ProductItem[]>;
  searchNormalized(query: string, category?: string): Promise<NormalizedProduct[]>;
}

export class MerchantService implements MerchantServiceContract {
  private products: ProductItem[] = initialMockProducts;

  async searchProducts(query: string, category?: string): Promise<ProductItem[]> {
    const discovery = await productDiscoveryService.searchByQuery(query, category);
    return discovery.products.map(this.toProductItem);
  }

  async searchNormalized(query: string, category?: string): Promise<NormalizedProduct[]> {
    const discovery = await productDiscoveryService.searchByQuery(query, category);
    return discovery.products;
  }

  async getProductById(id: string): Promise<ProductItem | null> {
    const item = this.products.find((p) => p.id === id);
    if (item) return item;

    const discovery = await productDiscoveryService.searchByQuery('', undefined, undefined, { limit: 100 });
    const match = discovery.products.find((p) => p.id === id);
    return match ? this.toProductItem(match) : null;
  }

  async getAllProducts(): Promise<ProductItem[]> {
    const discovery = await productDiscoveryService.searchByQuery('', undefined, undefined, { limit: 100 });
    return discovery.products.map(this.toProductItem);
  }

  private toProductItem(p: NormalizedProduct): ProductItem {
    return {
      id: p.id,
      name: p.title,
      category: p.category,
      brand: p.brand,
      originalPrice: p.originalPrice || p.price,
      discountedPrice: p.price,
      merchantName: p.merchantName,
      merchantTrustScore: p.merchantTrustScore || 4.5,
      rating: p.rating || 4.5,
      deliveryDays: p.deliveryInformation?.deliveryDays || 2,
      inStock: p.availability === 'in_stock',
      image: p.imageUrl,
      specifications: p.specifications as Record<string, string> | undefined,
      paymentOffers: p.paymentOffers,
    };
  }
}

export const merchantService = new MerchantService();
