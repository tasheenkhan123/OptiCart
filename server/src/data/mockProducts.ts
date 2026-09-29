import { ProductItem } from '../types/index.js';

/**
 * Mock Multi-Merchant Product Catalog for OptiCart
 * Covering category-independent spectrum: Skincare, Phones, Laptops, Electronics, Fashion, Gaming, Groceries.
 */
export const initialMockProducts: ProductItem[] = [
  // Skincare
  {
    id: 'skin-001',
    name: 'Hydrating Hyaluronic Acid Serum 30ml',
    category: 'Skincare',
    brand: 'DermaGlow',
    originalPrice: 899,
    discountedPrice: 699,
    merchantName: 'Nykaa',
    merchantTrustScore: 4.8,
    rating: 4.7,
    deliveryDays: 2,
    inStock: true,
    paymentOffers: ['10% off with Razorpay UPI', 'Flat ₹50 cashback'],
  },
  {
    id: 'skin-002',
    name: 'Vitamin C Brightening Moisturizer SPF 50',
    category: 'Skincare',
    brand: 'Minimalist',
    originalPrice: 649,
    discountedPrice: 599,
    merchantName: 'Amazon India',
    merchantTrustScore: 4.9,
    rating: 4.6,
    deliveryDays: 1,
    inStock: true,
    paymentOffers: ['5% Instant discount with Credit Card'],
  },

  // Phones
  {
    id: 'phone-001',
    name: 'Galaxy Ultra 5G (12GB RAM, 256GB)',
    category: 'Phones',
    brand: 'Samsung',
    originalPrice: 124999,
    discountedPrice: 109999,
    merchantName: 'Samsung Direct',
    merchantTrustScore: 4.9,
    rating: 4.8,
    deliveryDays: 2,
    inStock: true,
    paymentOffers: ['₹5000 Instant Bank Offer via Razorpay', 'No Cost EMI'],
  },
  {
    id: 'phone-002',
    name: 'Nord CE 3 5G (8GB RAM, 128GB)',
    category: 'Phones',
    brand: 'OnePlus',
    originalPrice: 24999,
    discountedPrice: 20999,
    merchantName: 'Croma',
    merchantTrustScore: 4.7,
    rating: 4.4,
    deliveryDays: 3,
    inStock: true,
    paymentOffers: ['₹1000 HDFC Card Cashback'],
  },

  // Laptops
  {
    id: 'lap-001',
    name: 'ZenBook OLED 14 (Core i7 13th Gen, 16GB, 1TB SSD)',
    category: 'Laptops',
    brand: 'ASUS',
    originalPrice: 94990,
    discountedPrice: 84990,
    merchantName: 'Reliance Digital',
    merchantTrustScore: 4.7,
    rating: 4.6,
    deliveryDays: 2,
    inStock: true,
    paymentOffers: ['Flat ₹3000 off on Razorpay NetBanking'],
  },

  // Electronics & Accessories
  {
    id: 'elec-001',
    name: 'Wireless Noise Cancelling Headphones WH-1000XM5',
    category: 'Electronics',
    brand: 'Sony',
    originalPrice: 29990,
    discountedPrice: 24990,
    merchantName: 'Vijay Sales',
    merchantTrustScore: 4.6,
    rating: 4.9,
    deliveryDays: 2,
    inStock: true,
    paymentOffers: ['₹2000 instant discount with ICICI'],
  },

  // Gaming
  {
    id: 'game-001',
    name: 'DualSense Wireless Controller - Midnight Black',
    category: 'Gaming',
    brand: 'PlayStation',
    originalPrice: 5990,
    discountedPrice: 5290,
    merchantName: 'Amazon India',
    merchantTrustScore: 4.9,
    rating: 4.8,
    deliveryDays: 1,
    inStock: true,
    paymentOffers: ['5% Amazon Pay / Razorpay offer'],
  },

  // Groceries & Nutrition
  {
    id: 'groc-001',
    name: 'Cold Pressed Extra Virgin Olive Oil 1L',
    category: 'Groceries',
    brand: 'Borges',
    originalPrice: 1450,
    discountedPrice: 1080,
    merchantName: 'Blinkit',
    merchantTrustScore: 4.8,
    rating: 4.7,
    deliveryDays: 1,
    inStock: true,
    paymentOffers: ['Flat ₹100 off on grocery bundle'],
  },
];
