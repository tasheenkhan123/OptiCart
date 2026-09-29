import { NormalizedProduct, ProductSourceType } from '../../../types/product.js';
import { ShoppingIntent } from '../../../types/intent.js';
import { ProductSearchProvider, SearchOptions } from './provider.js';
import { getCuratedProductImage } from '../../../utils/productImages.js';
import { buildVerifiedMerchantUrl } from '../../../utils/merchantUrls.js';

/**
 * Multi-Merchant Mock Catalog Data
 * Spans diverse categories: Laptops, Skincare, Phones, Electronics, Gaming, Fashion, Groceries, Shoes.
 * Covers multiple simulated merchants with explicit 'mock' sourceType.
 */
const MOCK_CATALOG_DATABASE: NormalizedProduct[] = [
  // --- LAPTOPS ---
  {
    id: 'mock-lap-001',
    title: 'ASUS TUF Gaming F15 (Core i5 12th Gen, 16GB RAM, 512GB SSD, RTX 3050 4GB, 144Hz)',
    brand: 'ASUS',
    category: 'Laptops',
    price: 58990,
    originalPrice: 77990,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/ASUS-TUF-Gaming-F15-FX506HF-HN024W/dp/B0B5SFV4T2',
    rating: 4.5,
    reviewCount: 1420,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'Intel Core i5-12500H',
      ram: '16GB DDR4',
      storage: '512GB NVMe SSD',
      gpu: 'NVIDIA GeForce RTX 3050 4GB',
      display: '15.6" FHD 144Hz',
      os: 'Windows 11 Home',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/ASUS-TUF-Gaming-F15-FX506HF-HN024W/dp/B0B5SFV4T2',
    confidence: 0.95,
    merchantTrustScore: 4.8,
    paymentOffers: ['Flat ₹2,500 off on Credit Cards via Razorpay', 'No Cost EMI up to 6 months'],
  },
  {
    id: 'mock-lap-008',
    title: 'ASUS Vivobook Pro 15 OLED (AMD Ryzen 7 5800H, 16GB RAM, 512GB SSD, RTX 3050 4GB, 15.6" FHD OLED)',
    brand: 'ASUS',
    category: 'Laptops',
    price: 67990,
    originalPrice: 89990,
    currency: 'INR',
    merchantName: 'Croma',
    merchantDomain: 'croma.com',
    productUrl: 'https://www.croma.com/asus-vivobook-pro-15-oled-amd-ryzen-7-16gb-512gb-ssd-rtx-3050/p/274981',
    rating: 4.6,
    reviewCount: 740,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'AMD Ryzen 7 5800H',
      ram: '16GB DDR4',
      storage: '512GB NVMe SSD',
      gpu: 'NVIDIA GeForce RTX 3050 4GB',
      display: '15.6" FHD OLED 600-nit 100% DCI-P3',
      os: 'Windows 11 Home',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.croma.com/asus-vivobook-pro-15-oled-amd-ryzen-7-16gb-512gb-ssd-rtx-3050/p/274981',
    confidence: 0.96,
    merchantTrustScore: 4.7,
    paymentOffers: ['₹3,000 Instant Card Cashback via Razorpay', 'Store Pickup in 2 Hours'],
  },
  {
    id: 'mock-lap-009',
    title: 'ASUS TUF Dash F15 (Core i7 12th Gen, 16GB RAM, 1TB SSD, RTX 3060 6GB 105W, 144Hz FHD)',
    brand: 'ASUS',
    category: 'Laptops',
    price: 84990,
    originalPrice: 109990,
    currency: 'INR',
    merchantName: 'Reliance Digital',
    merchantDomain: 'reliancedigital.in',
    productUrl: 'https://www.reliancedigital.in/asus-tuf-dash-f15-core-i7-12th-gen-16gb-1tb-ssd-rtx-3060/p/493178291',
    rating: 4.7,
    reviewCount: 620,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'Intel Core i7-12650H',
      ram: '16GB DDR5 4800MHz',
      storage: '1TB Gen4 SSD',
      gpu: 'NVIDIA GeForce RTX 3060 6GB (105W TGP)',
      display: '15.6" FHD 144Hz Adaptive Sync',
      os: 'Windows 11 Home',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.reliancedigital.in/asus-tuf-dash-f15-core-i7-12th-gen-16gb-1tb-ssd-rtx-3060/p/493178291',
    confidence: 0.97,
    merchantTrustScore: 4.7,
    paymentOffers: ['₹4,000 Instant Bank Offer via Razorpay'],
  },
  {
    id: 'mock-lap-002',
    title: 'Lenovo LOQ 15 (Core i5 13th Gen, 16GB RAM, 512GB SSD, RTX 4050 6GB 95W, 144Hz FHD)',
    brand: 'Lenovo',
    category: 'Laptops',
    price: 78990,
    originalPrice: 99990,
    currency: 'INR',
    merchantName: 'Croma',
    merchantDomain: 'croma.com',
    productUrl: 'https://www.croma.com/lenovo-loq-15-intel-core-i5-13th-gen-16gb-512gb-ssd-rtx-4050/p/276492',
    rating: 4.6,
    reviewCount: 880,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'Intel Core i5-13450HX',
      ram: '16GB DDR5 4800MHz',
      storage: '512GB Gen4 SSD',
      gpu: 'NVIDIA GeForce RTX 4050 6GB (95W TGP)',
      display: '15.6" FHD 144Hz 100% sRGB',
      os: 'Windows 11 Home',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.croma.com/lenovo-loq-15-intel-core-i5-13th-gen-16gb-512gb-ssd-rtx-4050/p/276492',
    confidence: 0.98,
    merchantTrustScore: 4.7,
    paymentOffers: ['₹3,000 Instant Cashback via Razorpay UPI', 'Store Pickup Available Today'],
  },
  {
    id: 'mock-lap-003',
    title: 'Acer Nitro V 15 (Core i5 13th Gen, 16GB RAM, 512GB SSD, RTX 4050 6GB 75W, 144Hz)',
    brand: 'Acer',
    category: 'Laptops',
    price: 74990,
    originalPrice: 89999,
    currency: 'INR',
    merchantName: 'Reliance Digital',
    merchantDomain: 'reliancedigital.in',
    productUrl: 'https://www.reliancedigital.in/acer-nitro-v-15-core-i5-13th-gen-16gb-512gb-ssd-rtx-4050/p/493892182',
    rating: 4.4,
    reviewCount: 650,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'Intel Core i5-13420H',
      ram: '16GB DDR5',
      storage: '512GB SSD',
      gpu: 'NVIDIA GeForce RTX 4050 6GB',
      display: '15.6" FHD 144Hz IPS',
      os: 'Windows 11 Home',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.reliancedigital.in/acer-nitro-v-15-core-i5-13th-gen-16gb-512gb-ssd-rtx-4050/p/493892182',
    confidence: 0.94,
    merchantTrustScore: 4.6,
    paymentOffers: ['5% Instant Bank Discount', 'Free Gaming Mouse Bundle'],
  },
  {
    id: 'mock-lap-004',
    title: 'ASUS ROG Strix G16 (Core i7 13th Gen, 16GB RAM, 1TB SSD, RTX 4060 8GB 140W, 165Hz ROG Nebula)',
    brand: 'ASUS',
    category: 'Laptops',
    price: 114990,
    originalPrice: 139990,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/ASUS-Strix-i7-13650HX-16-inch-G614JU-N3200W/dp/B0BWNDD77S',
    rating: 4.8,
    reviewCount: 510,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'Intel Core i7-13650HX',
      ram: '16GB DDR5 4800MHz',
      storage: '1TB PCIe 4.0 NVMe SSD',
      gpu: 'NVIDIA GeForce RTX 4060 8GB (140W TGP)',
      display: '16" FHD+ 165Hz 100% sRGB',
      os: 'Windows 11 Home',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/ASUS-Strix-i7-13650HX-16-inch-G614JU-N3200W/dp/B0BWNDD77S',
    confidence: 0.97,
    merchantTrustScore: 4.8,
    paymentOffers: ['₹5,000 Instant Card Discount with Razorpay', 'Xbox Game Pass 3 Months Free'],
  },
  {
    id: 'mock-lap-005',
    title: 'HP Victus 15 (AMD Ryzen 5 5600H, 8GB RAM, 512GB SSD, AMD Radeon RX 6500M 4GB, 144Hz)',
    brand: 'HP',
    category: 'Laptops',
    price: 49990,
    originalPrice: 65990,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/HP-Victus-Graphics-FHD-15-fb0050AX/dp/B0B5R648DX',
    rating: 4.2,
    reviewCount: 920,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'AMD Ryzen 5 5600H',
      ram: '8GB DDR4',
      storage: '512GB SSD',
      gpu: 'AMD Radeon RX 6500M 4GB',
      display: '15.6" FHD 144Hz',
      os: 'Windows 11 Home',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/HP-Victus-Graphics-FHD-15-fb0050AX/dp/B0B5R648DX',
    confidence: 0.88,
    merchantTrustScore: 4.5,
    paymentOffers: ['₹1,500 Bank Cashback'],
  },
  {
    id: 'mock-lap-006',
    title: 'Apple MacBook Air M1 (8GB RAM, 256GB SSD, 13.3-inch Retina Display, Space Grey)',
    brand: 'Apple',
    category: 'Laptops',
    price: 69990,
    originalPrice: 92900,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Apple-MacBook-Chip-13-inch-256GB/dp/B08N5W4NNB',
    rating: 4.8,
    reviewCount: 9800,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'Apple M1 chip with 8-core CPU and 7-core GPU',
      ram: '8GB Unified Memory',
      storage: '256GB SSD Storage',
      display: '13.3" Retina display with P3 wide colour',
      batteryLife: 'Up to 18 hours battery life',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Apple-MacBook-Chip-13-inch-256GB/dp/B08N5W4NNB',
    confidence: 0.99,
    merchantTrustScore: 4.9,
    paymentOffers: ['Flat ₹2,500 off on HDFC Cards via Razorpay', 'No Cost EMI up to 6 months'],
  },
  {
    id: 'mock-lap-007',
    title: 'Apple MacBook Air M2 (8GB RAM, 256GB SSD, 13.6-inch Liquid Retina Display, Midnight)',
    brand: 'Apple',
    category: 'Laptops',
    price: 89990,
    originalPrice: 99900,
    currency: 'INR',
    merchantName: 'Croma',
    merchantDomain: 'croma.com',
    productUrl: 'https://www.croma.com/apple-macbook-air-m2-chip-13-6-inch-8gb-256gb-ssd-midnight/p/256608',
    rating: 4.9,
    reviewCount: 4300,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'Apple M2 chip with 8-core CPU and 8-core GPU',
      ram: '8GB Unified Memory',
      storage: '256GB SSD Storage',
      display: '13.6" Liquid Retina display with True Tone',
      charging: 'MagSafe 3 charging port',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.croma.com/apple-macbook-air-m2-chip-13-6-inch-8gb-256gb-ssd-midnight/p/256608',
    confidence: 0.99,
    merchantTrustScore: 4.8,
    paymentOffers: ['₹5,000 Instant Cashback via Razorpay', 'Store pickup available today'],
  },
  {
    id: 'mock-lap-010',
    title: 'Apple MacBook Air M3 (8GB Unified Memory, 256GB SSD, 13.6-inch Liquid Retina Display, Starlight)',
    brand: 'Apple',
    category: 'Laptops',
    price: 99990,
    originalPrice: 114900,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Apple-MacBook-13-inch-Liquid-Display/dp/B0CX23V2ZH',
    rating: 4.9,
    reviewCount: 2100,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'Apple M3 chip with 8-core CPU and 8-core GPU',
      ram: '8GB Unified Memory',
      storage: '256GB SSD Storage',
      display: '13.6" Liquid Retina display (500 nits)',
      audio: 'Four-speaker sound system with Spatial Audio',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Apple-MacBook-13-inch-Liquid-Display/dp/B0CX23V2ZH',
    confidence: 0.99,
    merchantTrustScore: 4.9,
    paymentOffers: ['₹5,000 Instant Card Cashback via Razorpay'],
  },

  // --- SKINCARE & BEAUTY ---
  {
    id: 'mock-lip-001',
    title: 'Minimalist SPF 30 Lip Balm with Ceramides & Hyaluronic Acid for Dry Chapped Lips (8g)',
    brand: 'Minimalist',
    category: 'Skincare',
    price: 299,
    originalPrice: 349,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+SPF+30+Lip+Balm',
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 4100,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      weight: '8g',
      spf: 'SPF 30 PA+++',
      activeIngredients: 'Ceramides + Hyaluronic Acid + Shea Butter',
      benefit: 'Deep nourishment, UV protection, non-sticky daily care',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+SPF+30+Lip+Balm',
    confidence: 0.99,
    merchantTrustScore: 4.9,
    paymentOffers: ['10% off with Razorpay UPI'],
  },
  {
    id: 'mock-lip-002',
    title: 'NIVEA Lip Balm Hydro Care 24h Moisture with Natural Jojoba Oils (4.8g)',
    brand: 'NIVEA',
    category: 'Skincare',
    price: 185,
    originalPrice: 225,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/s?k=NIVEA+Lip+Balm+Hydro+Care',
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewCount: 9200,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      weight: '4.8g',
      activeIngredients: 'Natural Jojoba Oils + Aloe Vera + Shea Butter',
      benefit: '24-hour hydration, quick absorption, melt-in moisture',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/s?k=NIVEA+Lip+Balm+Hydro+Care',
    confidence: 0.98,
    merchantTrustScore: 4.8,
    paymentOffers: ['Flat ₹25 Cashback via Razorpay'],
  },
  {
    id: 'mock-lip-003',
    title: "Burt's Bees 100% Natural Moisturizing Lip Balm with Beeswax & Peppermint (4.25g)",
    brand: "Burt's Bees",
    category: 'Skincare',
    price: 449,
    originalPrice: 550,
    currency: 'INR',
    merchantName: 'Tira Beauty',
    merchantDomain: 'tirabeauty.com',
    productUrl: 'https://www.tirabeauty.com/search?q=Burts+Bees+Lip+Balm',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewCount: 3500,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      weight: '4.25g',
      activeIngredients: '100% Natural Beeswax + Vitamin E + Peppermint Oil',
      benefit: 'Intensive conditioning, tingling refreshing sensation',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.tirabeauty.com/search?q=Burts+Bees+Lip+Balm',
    confidence: 0.97,
    merchantTrustScore: 4.9,
    paymentOffers: ['15% off with Razorpay on Tira'],
  },
  {
    id: 'mock-lip-004',
    title: 'Plum Candy Melts Vegan Hydrating Tinted Lip Balm (12g)',
    brand: 'Plum',
    category: 'Skincare',
    price: 245,
    originalPrice: 295,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Plum+Candy+Melts+Lip+Balm',
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&auto=format&fit=crop&q=80',
    rating: 4.5,
    reviewCount: 2800,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      weight: '12g',
      activeIngredients: 'Carrot Seed Oil + Cocoa Butter + Plant Wax',
      benefit: 'Tinted glow, UV filter, nourishing fruit aroma',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Plum+Candy+Melts+Lip+Balm',
    confidence: 0.96,
    merchantTrustScore: 4.8,
    paymentOffers: ['10% off with Razorpay'],
  },
  {
    id: 'mock-skin-005',
    title: 'Minimalist PHA 3% Daily Soothing & Pore Clarifying Face Toner with Prebiotics (150ml)',
    brand: 'Minimalist',
    category: 'Skincare',
    price: 399,
    originalPrice: 449,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+PHA+3+Daily+Face+Toner',
    rating: 4.7,
    reviewCount: 3800,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '150ml',
      activeIngredients: '3% Gluconolactone (PHA) + Polyhydroxy Acid + Prebiotics',
      skinType: 'All Skin Types / Sensitive & Acne Prone',
      benefit: 'Gentle exfoliation, pore tightening, pH balancing',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+PHA+3+Daily+Face+Toner',
    confidence: 0.99,
    merchantTrustScore: 4.9,
    paymentOffers: ['10% off with Razorpay UPI'],
  },
  {
    id: 'mock-skin-006',
    title: 'Minimalist 2% Salicylic Acid + LHA Anti-Acne Daily Foaming Face Cleanser (100ml)',
    brand: 'Minimalist',
    category: 'Skincare',
    price: 299,
    originalPrice: 349,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+2+Percent+Salicylic+Acid+Face+Cleanser',
    rating: 4.8,
    reviewCount: 5200,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '100ml',
      activeIngredients: '2% Salicylic Acid (BHA) + Capryloyl Salicylic Acid (LHA) + Zinc',
      skinType: 'Oily, Combination & Acne-Prone Skin',
      benefit: 'Deep pore unclogging, controls excess oil, clears pimples',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+2+Percent+Salicylic+Acid+Face+Cleanser',
    confidence: 0.99,
    merchantTrustScore: 4.9,
    paymentOffers: ['10% off on first order via Razorpay'],
  },
  {
    id: 'mock-skin-012',
    title: 'Minimalist 8% Glycolic Acid Exfoliating Liquid Face Toner with Bamboo Water (150ml)',
    brand: 'Minimalist',
    category: 'Skincare',
    price: 499,
    originalPrice: 549,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+8+Percent+Glycolic+Acid+Toner',
    rating: 4.7,
    reviewCount: 3100,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '150ml',
      activeIngredients: '8% Glycolic Acid + Bamboo Water + Australian Caviar Lime',
      skinType: 'Normal, Dry & Combination Skin',
      benefit: 'Brightening, evening skin tone, texture refinement',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+8+Percent+Glycolic+Acid+Toner',
    confidence: 0.98,
    merchantTrustScore: 4.9,
    paymentOffers: ['Flat ₹50 Instant Discount via Razorpay'],
  },
  {
    id: 'mock-skin-013',
    title: 'Minimalist 6% Oat Extract Gentle Soothing Daily Calming Cleanser (120ml)',
    brand: 'Minimalist',
    category: 'Skincare',
    price: 349,
    originalPrice: 399,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+6+Percent+Oat+Extract+Gentle+Cleanser',
    rating: 4.8,
    reviewCount: 2400,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '120ml',
      activeIngredients: '6% Oat Extract + Colloidal Oat + Vitamin B5 (Panthenol)',
      skinType: 'Dry, Sensitive, Redness-Prone & Compromised Skin',
      benefit: 'Soothes inflammation, barrier repair, gentle non-foaming wash',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+6+Percent+Oat+Extract+Gentle+Cleanser',
    confidence: 0.99,
    merchantTrustScore: 4.9,
    paymentOffers: ['10% off with Razorpay UPI'],
  },
  {
    id: 'mock-skin-014',
    title: 'Minimalist Aquaporin 01% Hydrating Gentle Gel Daily Cleanser with Hyaluronic Acid (100ml)',
    brand: 'Minimalist',
    category: 'Skincare',
    price: 299,
    originalPrice: 349,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+Aquaporin+Cleanser',
    rating: 4.7,
    reviewCount: 1950,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '100ml',
      activeIngredients: 'Aquaporin Booster + Hyaluronic Acid + Wheat Protein',
      skinType: 'All Skin Types / Dehydrated Skin',
      benefit: 'Deep hydration, refreshing wash, barrier protection',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+Aquaporin+Cleanser',
    confidence: 0.98,
    merchantTrustScore: 4.9,
    paymentOffers: ['5% Cashback with Razorpay'],
  },
  {
    id: 'mock-skin-007',
    title: 'Minimalist Salicylic Acid 2% Spot Clarifying Cream for Pimples & Active Blemishes (30g)',
    brand: 'Minimalist',
    category: 'Skincare',
    price: 399,
    originalPrice: 499,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+Salicylic+Acid+Spot+Clarifying+Cream',
    rating: 4.6,
    reviewCount: 2900,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      weight: '30g',
      activeIngredients: '2% Salicylic Acid + Sulfur + Zinc PCA',
      skinType: 'Acne-prone skin with active pimples',
      benefit: 'Overnight pimple spot calming, reduces redness and inflammation',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+Salicylic+Acid+Spot+Clarifying+Cream',
    confidence: 0.98,
    merchantTrustScore: 4.9,
    paymentOffers: ['Flat ₹50 Cashback via Razorpay'],
  },
  {
    id: 'mock-skin-001',
    title: 'Minimalist 10% Niacinamide Face Serum with Zinc for Blemish & Pore Control (30ml)',
    brand: 'Minimalist',
    category: 'Skincare',
    price: 599,
    originalPrice: 649,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+10+Percent+Niacinamide+Face+Serum',
    rating: 4.7,
    reviewCount: 4200,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '30ml',
      activeIngredients: '10% Niacinamide + 1% Zinc PCA + EUK 134',
      skinType: 'All Skin Types / Acne Prone',
      benefit: 'Reduces spots, pore tightening, sebum balance',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+10+Percent+Niacinamide+Face+Serum',
    confidence: 0.99,
    merchantTrustScore: 4.9,
    paymentOffers: ['10% off with Razorpay UPI'],
  },
  {
    id: 'mock-skin-002',
    title: 'Minimalist Salicylic Acid 2% Serum for Blackheads, Whiteheads & Pore Clarifying (30ml)',
    brand: 'Minimalist',
    category: 'Skincare',
    price: 549,
    originalPrice: 599,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+Salicylic+Acid+2+Percent+Serum',
    rating: 4.6,
    reviewCount: 3100,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '30ml',
      activeIngredients: '2% Salicylic Acid + Oligopeptide',
      skinType: 'Oily & Acne Prone',
      benefit: 'Exfoliation, Unclogging pores',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+Salicylic+Acid+2+Percent+Serum',
    confidence: 0.98,
    merchantTrustScore: 4.9,
    paymentOffers: ['Flat ₹50 Instant Discount via Razorpay'],
  },
  {
    id: 'mock-skin-003',
    title: 'Minimalist Sunscreen SPF 50 PA++++ with Multi-Vitamin & Ceramide (50g)',
    brand: 'Minimalist',
    category: 'Skincare',
    price: 399,
    originalPrice: 449,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+Sunscreen+SPF+50+PA',
    rating: 4.8,
    reviewCount: 5600,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      weight: '50g',
      spf: 'SPF 50 PA++++',
      texture: 'Lightweight, Zero White Cast',
      skinType: 'All Skin Types',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=Minimalist+Sunscreen+SPF+50+PA',
    confidence: 0.99,
    merchantTrustScore: 4.9,
    paymentOffers: ['Flat 10% off with Razorpay Gateway'],
  },
  {
    id: 'mock-skin-008',
    title: 'DermaGlow Cica Calming Gentle Soothing Face Toner (150ml)',
    brand: 'DermaGlow',
    category: 'Skincare',
    price: 449,
    originalPrice: 599,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/search/result/?q=DermaGlow+Cica+Calming+Face+Toner',
    rating: 4.6,
    reviewCount: 1800,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '150ml',
      activeIngredients: 'Centella Asiatica (Cica) + Green Tea + Allantoin',
      skinType: 'Sensitive & Redness Prone',
      benefit: 'Skin barrier repair, soothing, instant hydration',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/search/result/?q=DermaGlow+Cica+Calming+Face+Toner',
    confidence: 0.95,
    merchantTrustScore: 4.7,
    paymentOffers: ['Flat ₹50 Cashback via Razorpay'],
  },
  {
    id: 'mock-skin-009',
    title: 'DermaGlow Gentle Foaming Daily Balancing Cleanser (150ml)',
    brand: 'DermaGlow',
    category: 'Skincare',
    price: 349,
    originalPrice: 499,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/DermaGlow-Gentle-Foaming-Balancing-Cleanser-150ml/dp/B0CN1928X7',
    rating: 4.5,
    reviewCount: 2200,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '150ml',
      activeIngredients: 'Oat Amino Acids + Chamomile + Glycerin',
      skinType: 'Normal to Sensitive Skin',
      benefit: 'Non-stripping deep cleanse, protects natural moisture',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/DermaGlow-Gentle-Foaming-Balancing-Cleanser-150ml/dp/B0CN1928X7',
    confidence: 0.94,
    merchantTrustScore: 4.7,
    paymentOffers: ['5% Instant Discount with Razorpay'],
  },
  {
    id: 'mock-skin-010',
    title: 'DermaGlow Tea Tree & Blemish Clarifying Gel Cream for Pimples (50g)',
    brand: 'DermaGlow',
    category: 'Skincare',
    price: 499,
    originalPrice: 699,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/DermaGlow-Salicylic-Clarifying-Pimple-Cream-50g/dp/B0CN1948Y9',
    rating: 4.5,
    reviewCount: 1650,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      weight: '50g',
      activeIngredients: 'Australian Tea Tree Oil + 2% Niacinamide + Salicylic Acid',
      skinType: 'Pimple-prone & oily skin',
      benefit: 'Controls excess breakout sebum and calms pimple irritation',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/DermaGlow-Salicylic-Clarifying-Pimple-Cream-50g/dp/B0CN1948Y9',
    confidence: 0.96,
    merchantTrustScore: 4.7,
    paymentOffers: ['Flat ₹60 Bank Cashback via Razorpay'],
  },
  {
    id: 'mock-skin-011',
    title: 'Cetaphil Gentle Skin Cleanser for Dry to Normal Sensitive Skin (125ml)',
    brand: 'Cetaphil',
    category: 'Skincare',
    price: 425,
    originalPrice: 475,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Cetaphil-Gentle-Skin-Cleanser-125ml/dp/B07N1NZ6D7',
    rating: 4.8,
    reviewCount: 8900,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '125ml',
      activeIngredients: 'Hydrating Glycerin + Vitamin B5 + Niacinamide',
      skinType: 'Sensitive & Dry Skin',
      benefit: 'Dermatologist recommended soap-free gentle cleansing',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Cetaphil-Gentle-Skin-Cleanser-125ml/dp/B07N1NZ6D7',
    confidence: 0.99,
    merchantTrustScore: 4.9,
    paymentOffers: ['Flat 10% Cashback with Razorpay UPI'],
  },
  {
    id: 'mock-skin-012',
    title: 'Plum Green Tea Alcohol-Free Clarifying Face Toner with Glycolic Acid (200ml)',
    brand: 'Plum',
    category: 'Skincare',
    price: 390,
    originalPrice: 420,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/plum-green-tea-alcohol-free-toner/p/23992',
    rating: 4.6,
    reviewCount: 3400,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '200ml',
      activeIngredients: 'Green Tea Extract + Glycolic Acid + Glycerin',
      skinType: 'Oily, Combination & Acne-Prone Skin',
      benefit: 'Fights pimples, minimizes pores, 100% vegan & alcohol-free',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/plum-green-tea-alcohol-free-toner/p/23992',
    confidence: 0.97,
    merchantTrustScore: 4.8,
    paymentOffers: ['Buy 2 Get 1 Free on Nykaa'],
  },
  {
    id: 'mock-skin-004',
    title: 'DermaGlow Hyaluronic Acid 2% + B5 Intense Hydrating Gel Serum (30ml)',
    brand: 'DermaGlow',
    category: 'Skincare',
    price: 699,
    originalPrice: 899,
    currency: 'INR',
    merchantName: 'Nykaa',
    merchantDomain: 'nykaa.com',
    productUrl: 'https://www.nykaa.com/dermaglow-hyaluronic-acid-b5-hydrating-serum-30ml/p/8947293',
    rating: 4.5,
    reviewCount: 1200,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '30ml',
      activeIngredients: 'Multi-molecular Hyaluronic Acid 2% + Pro-Vitamin B5',
      skinType: 'Dry & Dehydrated Skin',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nykaa.com/dermaglow-hyaluronic-acid-b5-hydrating-serum-30ml/p/8947293',
    confidence: 0.92,
    merchantTrustScore: 4.7,
    paymentOffers: ['Flat ₹100 Cashback with Razorpay'],
  },

  // --- FASHION & DRESSES ---
  {
    id: 'mock-fash-002',
    title: 'Zara Floral Print A-Line Casual Summer Dress (Lightweight Breathable Cotton Blend)',
    brand: 'Zara',
    category: 'Fashion',
    price: 1990,
    originalPrice: 2790,
    currency: 'INR',
    merchantName: 'Zara',
    merchantDomain: 'zara.com',
    productUrl: 'https://www.zara.com/in/en/floral-print-a-line-casual-summer-dress-p02157051.html',
    rating: 4.7,
    reviewCount: 1420,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      style: 'A-Line Floral Midi Dress',
      material: '100% Breathable Cotton Voile',
      occasion: 'Casual / Summer Vacation',
      fit: 'Relaxed Comfort Fit',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.zara.com/in/en/floral-print-a-line-casual-summer-dress-p02157051.html',
    confidence: 0.98,
    merchantTrustScore: 4.8,
    paymentOffers: ['10% Instant Discount with Razorpay UPI'],
  },
  {
    id: 'mock-fash-003',
    title: 'H&M Tiered Cotton Midi Summer Dress (Breeze Fit, Puff Sleeves)',
    brand: 'H&M',
    category: 'Fashion',
    price: 1799,
    originalPrice: 2299,
    currency: 'INR',
    merchantName: 'Myntra',
    merchantDomain: 'myntra.com',
    productUrl: 'https://www.myntra.com/dresses/hm/hm-tiered-cotton-midi-summer-dress/24819024/buy',
    rating: 4.6,
    reviewCount: 2100,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      style: 'Tiered Flounce Summer Dress',
      material: '100% Organic Woven Cotton',
      neckline: 'Sweetheart Neck',
      length: 'Midi Calf Length',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.myntra.com/dresses/hm/hm-tiered-cotton-midi-summer-dress/24819024/buy',
    confidence: 0.97,
    merchantTrustScore: 4.8,
    paymentOffers: ['Flat ₹200 Instant Off on Card Payment'],
  },
  {
    id: 'mock-fash-004',
    title: 'Forever 21 Sleeveless Floral Casual Summer Dress (Flowy Tiered Skirt)',
    brand: 'Forever 21',
    category: 'Fashion',
    price: 1499,
    originalPrice: 1999,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Forever-21-Sleeveless-Floral-Summer-Dress/dp/B09MN452K1',
    rating: 4.4,
    reviewCount: 980,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      style: 'Fit & Flare Sleeveless Summer Dress',
      material: 'Rayon Chiffon',
      washCare: 'Machine Wash Cold',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Forever-21-Sleeveless-Floral-Summer-Dress/dp/B09MN452K1',
    confidence: 0.96,
    merchantTrustScore: 4.7,
    paymentOffers: ['5% Cashback via Razorpay'],
  },
  {
    id: 'mock-fash-001',
    title: "Levi's Men's 511 Slim Fit Stretch Denim Jeans",
    brand: "Levi's",
    category: 'Fashion',
    price: 2499,
    originalPrice: 3999,
    currency: 'INR',
    merchantName: 'Myntra',
    merchantDomain: 'myntra.com',
    productUrl: 'https://www.myntra.com/jeans/levis/levis-men-511-slim-fit-stretch-denim-jeans/21948192/buy',
    rating: 4.5,
    reviewCount: 2800,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      fit: 'Slim Fit',
      material: '99% Cotton, 1% Elastane',
      closure: 'Button & Zip Fly',
      care: 'Machine Wash',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.myntra.com/jeans/levis/levis-men-511-slim-fit-stretch-denim-jeans/21948192/buy',
    confidence: 0.95,
    merchantTrustScore: 4.8,
    paymentOffers: ['10% Instant Discount with Razorpay UPI'],
  },

  // --- SHOES & FOOTWEAR ---
  {
    id: 'mock-shoe-003',
    title: 'Nike Revolution 6 Next Nature Men Road Running Shoes (Black/White)',
    brand: 'Nike',
    category: 'Shoes',
    price: 3695,
    originalPrice: 4995,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Nike-Revolution-Nature-Running-Shoes/dp/B0927R4K6P',
    rating: 4.6,
    reviewCount: 5200,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      type: 'Road Running & Training',
      cushioning: 'Soft Foam Midsole',
      material: 'Breathable Mesh with 20% Recycled Content',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Nike-Revolution-Nature-Running-Shoes/dp/B0927R4K6P',
    confidence: 0.98,
    merchantTrustScore: 4.8,
    paymentOffers: ['Flat 10% Instant Cashback with Razorpay UPI'],
  },
  {
    id: 'mock-shoe-004',
    title: 'Nike Downshifter 12 Lightweight Road Running Shoes (Obsidian/Cool Grey)',
    brand: 'Nike',
    category: 'Shoes',
    price: 3995,
    originalPrice: 5495,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Nike-Downshifter-Running-Shoes-Obsidian/dp/B09MD45XXX',
    rating: 4.5,
    reviewCount: 3100,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      type: 'Road Running / Gym',
      cushioning: 'Super-soft Foam throughout the Midsole',
      fit: 'Midfoot Fitband for stability',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Nike-Downshifter-Running-Shoes-Obsidian/dp/B09MD45XXX',
    confidence: 0.97,
    merchantTrustScore: 4.7,
    paymentOffers: ['Flat ₹400 Instant Discount on Debit Cards'],
  },
  {
    id: 'mock-shoe-005',
    title: 'Nike Air Max SC Men Sport & Running Shoes (Lightweight Air Cushioning, White/Black)',
    brand: 'Nike',
    category: 'Shoes',
    price: 5495,
    originalPrice: 6995,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Nike-Air-Max-Mens-Sport-Shoes/dp/B0927R4K6Q',
    rating: 4.7,
    reviewCount: 2400,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      type: 'Road Running & Lifestyle',
      cushioning: 'Visible Max Air Unit + Foam Midsole',
      outsole: 'Waffle pattern rubber traction',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Nike-Air-Max-Mens-Sport-Shoes/dp/B0927R4K6Q',
    confidence: 0.98,
    merchantTrustScore: 4.8,
    paymentOffers: ['₹500 Bank Cashback via Razorpay'],
  },
  {
    id: 'mock-shoe-001',
    title: 'Nike Air Zoom Pegasus 40 Men Road Running Shoes',
    brand: 'Nike',
    category: 'Shoes',
    price: 7995,
    originalPrice: 10495,
    currency: 'INR',
    merchantName: 'Nike Official India',
    merchantDomain: 'nike.com/in',
    productUrl: 'https://www.nike.com/in/t/air-zoom-pegasus-40-road-running-shoes-MCnWdp',
    rating: 4.8,
    reviewCount: 3900,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      type: 'Road Running / Training',
      cushioning: 'Dual Zoom Air Units + React Foam',
      drop: '10mm',
      weight: '288g (Men UK 9)',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.nike.com/in/t/air-zoom-pegasus-40-road-running-shoes-MCnWdp',
    confidence: 0.98,
    merchantTrustScore: 4.9,
    paymentOffers: ['Flat ₹800 Instant Bank Discount via Razorpay'],
  },
  {
    id: 'mock-shoe-002',
    title: 'Adidas Ultraboost Light Running Shoes (Continental Rubber Outsole)',
    brand: 'Adidas',
    category: 'Shoes',
    price: 11999,
    originalPrice: 18999,
    currency: 'INR',
    merchantName: 'Adidas India',
    merchantDomain: 'adidas.co.in',
    productUrl: 'https://www.adidas.co.in/ultraboost-light-running-shoes/HQ6339.html',
    rating: 4.7,
    reviewCount: 2100,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      cushioning: 'Light BOOST Foam Technology',
      outsole: 'Continental Better Rubber',
      upper: 'PRIMEKNIT+ Textile with 50% Ocean Plastic',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.adidas.co.in/ultraboost-light-running-shoes/HQ6339.html',
    confidence: 0.97,
    merchantTrustScore: 4.8,
    paymentOffers: ['₹1,200 Instant Card Offer via Razorpay Gateway'],
  },

  // --- COMPUTER & GAMING ACCESSORIES ---
  {
    id: 'mock-acc-001',
    title: 'Logitech G304 Lightspeed Wireless Gaming Mouse (HERO Sensor, 12,000 DPI, 250h Battery)',
    brand: 'Logitech',
    category: 'Electronics',
    price: 2500,
    originalPrice: 3795,
    currency: 'INR',
    merchantName: 'Croma',
    merchantDomain: 'croma.com',
    productUrl: 'https://www.croma.com/logitech-g304-lightspeed-wireless-optical-gaming-mouse-hero-sensor-black-/p/225691',
    rating: 4.6,
    reviewCount: 4800,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      sensor: 'HERO Optical Sensor (12,000 DPI)',
      connectivity: 'LIGHTSPEED 1ms Wireless',
      weight: '99g Ultra-lightweight',
      batteryLife: '250 Hours on 1 AA Battery',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.croma.com/logitech-g304-lightspeed-wireless-optical-gaming-mouse-hero-sensor-black-/p/225691',
    confidence: 0.98,
    merchantTrustScore: 4.7,
    paymentOffers: ['Flat ₹500 Instant Discount via Razorpay UPI', 'Store Pickup in 2 Hours'],
  },
  {
    id: 'mock-acc-002',
    title: 'Razer DeathAdder Essential Gaming Mouse (6400 DPI Optical Sensor, 5 Hyperesponse Buttons)',
    brand: 'Razer',
    category: 'Electronics',
    price: 1499,
    originalPrice: 2499,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Razer-DeathAdder-Essential-Gaming-RZ01-02540100-R3M1/dp/B07Y693ND1',
    rating: 4.5,
    reviewCount: 3200,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      sensor: '6,400 DPI Optical Sensor',
      formFactor: 'Ergonomic Right-Handed',
      switches: 'Multi-Award Winning Mechanical Switches',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Razer-DeathAdder-Essential-Gaming-RZ01-02540100-R3M1/dp/B07Y693ND1',
    confidence: 0.95,
    merchantTrustScore: 4.8,
    paymentOffers: ['Flat ₹200 Bank Cashback via Razorpay'],
  },
  {
    id: 'mock-acc-005',
    title: 'HyperX Cloud Core Gaming Headset with 7.1 Surround Sound & Noise-Cancelling Mic',
    brand: 'HyperX',
    category: 'Electronics',
    price: 3490,
    originalPrice: 5999,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/HyperX-Cloud-Core-Gaming-Headset-Surround/dp/B08HQW9D5P',
    rating: 4.7,
    reviewCount: 3900,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      audio: 'DTS Headphone:X Spatial Audio 7.1',
      drivers: '53mm Directional Drivers',
      microphone: 'Detachable Noise-Cancelling Microphone',
      compatibility: 'PC, PS5, Xbox Series X/S, Nintendo Switch',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/HyperX-Cloud-Core-Gaming-Headset-Surround/dp/B08HQW9D5P',
    confidence: 0.98,
    merchantTrustScore: 4.8,
    paymentOffers: ['Flat ₹300 Cashback via Razorpay'],
  },
  {
    id: 'mock-acc-006',
    title: 'Razer BlackShark V2 X Gaming Headset (50mm Drivers, 7.1 Surround, HyperClear Mic)',
    brand: 'Razer',
    category: 'Electronics',
    price: 4499,
    originalPrice: 6999,
    currency: 'INR',
    merchantName: 'Croma',
    merchantDomain: 'croma.com',
    productUrl: 'https://www.croma.com/razer-blackshark-v2-x-multi-platform-wired-esports-headset-black-/p/231949',
    rating: 4.6,
    reviewCount: 2800,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      drivers: 'Razer TriForce 50mm Drivers',
      audio: '7.1 Surround Sound on PC',
      weight: '240g Ultra-lightweight',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.croma.com/razer-blackshark-v2-x-multi-platform-wired-esports-headset-black-/p/231949',
    confidence: 0.97,
    merchantTrustScore: 4.7,
    paymentOffers: ['₹400 Instant Discount with Card on Razorpay'],
  },
  {
    id: 'mock-acc-003',
    title: 'AmazonBasics 15.6-Inch Protective Shock-Resistant Neoprene Laptop Sleeve (Water Resistant)',
    brand: 'AmazonBasics',
    category: 'Electronics',
    price: 1500,
    originalPrice: 1999,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/AmazonBasics-15-6-Inch-Laptop-Sleeve-Black/dp/B00CD8ADKO',
    rating: 4.6,
    reviewCount: 5600,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      size: 'Fits up to 15.6 inch laptops',
      material: 'High-density Neoprene with plush fleece lining',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/AmazonBasics-15-6-Inch-Laptop-Sleeve-Black/dp/B00CD8ADKO',
    confidence: 0.95,
    merchantTrustScore: 4.8,
    paymentOffers: ['Flat ₹100 Cashback via Razorpay'],
  },
  {
    id: 'mock-acc-004',
    title: 'DailyObjects Padded 15.6" Shockproof Laptop Sleeve with Accessory Pocket',
    brand: 'DailyObjects',
    category: 'Electronics',
    price: 1299,
    originalPrice: 1999,
    currency: 'INR',
    merchantName: 'Reliance Digital',
    merchantDomain: 'reliancedigital.in',
    productUrl: 'https://www.reliancedigital.in/dailyobjects-protective-neoprene-laptop-sleeve-15-6-inch/p/492573892',
    rating: 4.5,
    reviewCount: 2300,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      size: 'Fits 15.6" Laptops',
      material: 'Waterproof Nylon',
      pockets: 'Dual zippered front accessory compartments',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.reliancedigital.in/dailyobjects-protective-neoprene-laptop-sleeve-15-6-inch/p/492573892',
    confidence: 0.94,
    merchantTrustScore: 4.6,
    paymentOffers: ['Flat ₹100 Instant Discount via Razorpay UPI'],
  },
  {
    id: 'mock-elec-001',
    title: 'Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones (30h Battery, Multi-Point)',
    brand: 'Sony',
    category: 'Electronics',
    price: 24990,
    originalPrice: 34990,
    currency: 'INR',
    merchantName: 'Croma',
    merchantDomain: 'croma.com',
    productUrl: 'https://www.croma.com/sony-wh-1000xm5-bluetooth-headphone-with-mic-black-/p/261949',
    rating: 4.9,
    reviewCount: 4100,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      anc: 'Industry-leading Auto NC Optimizer with 8 Mics',
      battery: '30 Hours with ANC on, 3 min quick charge for 3 hrs',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.croma.com/sony-wh-1000xm5-bluetooth-headphone-with-mic-black-/p/261949',
    confidence: 0.98,
    merchantTrustScore: 4.7,
    paymentOffers: ['₹2,500 Instant Discount on ICICI Cards via Razorpay'],
  },
  {
    id: 'mock-game-001',
    title: 'PlayStation 5 DualSense Wireless Controller (Haptic Feedback, Adaptive Triggers)',
    brand: 'PlayStation',
    category: 'Gaming',
    price: 5290,
    originalPrice: 6390,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Sony-DualSense-Wireless-Controller-PlayStation/dp/B08FC5L3RG',
    rating: 4.8,
    reviewCount: 6200,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      connectivity: 'Bluetooth 5.1 & USB-C',
      features: 'Haptic Feedback, Dynamic Adaptive Triggers',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Sony-DualSense-Wireless-Controller-PlayStation/dp/B08FC5L3RG',
    confidence: 0.97,
    merchantTrustScore: 4.9,
    paymentOffers: ['Flat ₹300 off with Razorpay NetBanking'],
  },

  // --- PHONES ---
  {
    id: 'mock-ph-005',
    title: 'Apple iPhone 13 (128GB, Midnight, 5G Super Retina XDR, A15 Bionic)',
    brand: 'Apple',
    category: 'Phones',
    price: 49999,
    originalPrice: 59900,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Apple-iPhone-13-128GB-Midnight/dp/B09G9HD6PD',
    rating: 4.8,
    reviewCount: 15400,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      display: '6.1" Super Retina XDR OLED',
      processor: 'A15 Bionic chip with 4-core GPU',
      camera: 'Dual 12MP (Wide & Ultra Wide) with Cinematic mode',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Apple-iPhone-13-128GB-Midnight/dp/B09G9HD6PD',
    confidence: 0.99,
    merchantTrustScore: 4.9,
    paymentOffers: ['₹2,500 Instant HDFC Card Discount via Razorpay'],
  },
  {
    id: 'mock-ph-006',
    title: 'Apple iPhone 15 (128GB, Black, Dynamic Island, 48MP Main Camera, USB-C)',
    brand: 'Apple',
    category: 'Phones',
    price: 71999,
    originalPrice: 79900,
    currency: 'INR',
    merchantName: 'Croma',
    merchantDomain: 'croma.com',
    productUrl: 'https://www.croma.com/apple-iphone-15-128gb-black-/p/300652',
    rating: 4.9,
    reviewCount: 7800,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      display: '6.1" Super Retina XDR with Dynamic Island',
      processor: 'A16 Bionic chip',
      camera: '48MP Main with 2x Telephoto + 12MP Ultra Wide',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.croma.com/apple-iphone-15-128gb-black-/p/300652',
    confidence: 0.99,
    merchantTrustScore: 4.8,
    paymentOffers: ['₹4,000 Instant Cashback via Razorpay'],
  },
  {
    id: 'mock-ph-001',
    title: 'Samsung Galaxy S23 FE 5G (8GB RAM, 128GB, Mint, Dynamic AMOLED 2X 120Hz)',
    brand: 'Samsung',
    category: 'Phones',
    price: 34999,
    originalPrice: 59999,
    currency: 'INR',
    merchantName: 'Samsung Direct',
    merchantDomain: 'samsung.com/in',
    productUrl: 'https://www.samsung.com/in/smartphones/galaxy-s23-fe/buy/',
    rating: 4.6,
    reviewCount: 3800,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      display: '6.4" Dynamic AMOLED 2X 120Hz',
      processor: 'Exynos 2200 4nm',
      camera: '50MP OIS Triple Pro-Grade Camera',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.samsung.com/in/smartphones/galaxy-s23-fe/buy/',
    confidence: 0.98,
    merchantTrustScore: 4.9,
    paymentOffers: ['₹3,000 Instant Bank Offer via Razorpay'],
  },
  {
    id: 'mock-ph-002',
    title: 'Samsung Galaxy A35 5G (8GB RAM, 128GB, Awesome Navy, Super AMOLED 120Hz)',
    brand: 'Samsung',
    category: 'Phones',
    price: 27999,
    originalPrice: 33999,
    currency: 'INR',
    merchantName: 'Croma',
    merchantDomain: 'croma.com',
    productUrl: 'https://www.croma.com/samsung-galaxy-a35-5g-8gb-ram-128gb-awesome-navy-/p/305481',
    rating: 4.4,
    reviewCount: 1950,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 2, freeDelivery: true, shippingFee: 0 },
    specifications: {
      display: '6.6" FHD+ Super AMOLED 120Hz',
      processor: 'Exynos 1380',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.croma.com/samsung-galaxy-a35-5g-8gb-ram-128gb-awesome-navy-/p/305481',
    confidence: 0.96,
    merchantTrustScore: 4.7,
    paymentOffers: ['₹2,000 HDFC Card Cashback via Razorpay'],
  },
  {
    id: 'mock-ph-003',
    title: 'Poco F6 5G (8GB RAM, 256GB, Snapdragon 8s Gen 3, 1.5K 120Hz AMOLED, 90W Fast Charge)',
    brand: 'Poco',
    category: 'Phones',
    price: 27999,
    originalPrice: 33999,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Poco-F6-5G-Snapdragon-Black/dp/B0D5BXXYY1',
    rating: 4.7,
    reviewCount: 5400,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'Snapdragon 8s Gen 3',
      display: '6.67" 1.5K AMOLED 120Hz',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Poco-F6-5G-Snapdragon-Black/dp/B0D5BXXYY1',
    confidence: 0.95,
    merchantTrustScore: 4.6,
    paymentOffers: ['₹1,500 Instant Discount with SBI / ICICI'],
  },
  {
    id: 'mock-ph-004',
    title: 'Realme GT 6T 5G (8GB RAM, 128GB, Snapdragon 7+ Gen 3, 6000-nit 120Hz LTPO, 120W SuperVOOC)',
    brand: 'Realme',
    category: 'Phones',
    price: 28999,
    originalPrice: 34999,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Realme-GT-6T-5G-Fluid-Silver/dp/B0D3DW91M6',
    rating: 4.6,
    reviewCount: 3200,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      processor: 'Snapdragon 7+ Gen 3',
      display: '6.78" 1.5K 8T LTPO AMOLED',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Realme-GT-6T-5G-Fluid-Silver/dp/B0D3DW91M6',
    confidence: 0.95,
    merchantTrustScore: 4.8,
    paymentOffers: ['₹2,000 Instant Bank Offer via Razorpay'],
  },

  // --- GROCERIES ---
  {
    id: 'mock-groc-001',
    title: 'Borges Extra Virgin Olive Oil (Cold Pressed, 1L Glass Bottle)',
    brand: 'Borges',
    category: 'Groceries',
    price: 1080,
    originalPrice: 1450,
    currency: 'INR',
    merchantName: 'Amazon India',
    merchantDomain: 'amazon.in',
    productUrl: 'https://www.amazon.in/Borges-Extra-Virgin-Olive-Bottle/dp/B000O5IZVW',
    rating: 4.7,
    reviewCount: 3800,
    availability: 'in_stock',
    deliveryInformation: { deliveryDays: 1, freeDelivery: true, shippingFee: 0 },
    specifications: {
      volume: '1 Litre',
      origin: 'Made in Spain from 100% Spanish Olives',
    },
    sourceType: 'mock',
    sourceUrl: 'https://www.amazon.in/Borges-Extra-Virgin-Olive-Bottle/dp/B000O5IZVW',
    confidence: 0.96,
    merchantTrustScore: 4.8,
    paymentOffers: ['Flat ₹100 cashback on grocery bundles via Razorpay UPI'],
  },
];

export class MockCatalogProvider implements ProductSearchProvider {
  readonly id = 'mock-catalog-provider';
  readonly name = 'OptiCart Multi-Merchant Mock Catalog';
  readonly sourceType: ProductSourceType = 'mock';

  private products: NormalizedProduct[];

  constructor() {
    this.products = MOCK_CATALOG_DATABASE.map((p) => {
      const imageUrl = p.imageUrl || getCuratedProductImage(p.category, p.title, p.brand);
      const productUrl = buildVerifiedMerchantUrl(p.merchantName, p.title, p.brand, p.merchantDomain, p.productUrl);
      const sourceUrl = buildVerifiedMerchantUrl(p.merchantName, p.title, p.brand, p.merchantDomain, p.sourceUrl);

      return {
        ...p,
        imageUrl,
        productUrl,
        sourceUrl,
      };
    });
  }

  isAvailable(): boolean {
    return true;
  }

  async search(intent: ShoppingIntent, options?: SearchOptions): Promise<NormalizedProduct[]> {
    const categoryQuery = (intent.category || '').toLowerCase().trim();
    const productTypeQuery = (intent.productType || '').toLowerCase().trim();
    const concernQuery = (intent.concern || '').toLowerCase().trim();

    const matches = this.products.filter((p) => {
      const pCat = p.category.toLowerCase();
      const pTitle = p.title.toLowerCase();
      const pBrand = p.brand.toLowerCase();

      // Check accessory vs main product differentiation
      const isAccessorySearch =
        categoryQuery.includes('sleeve') ||
        categoryQuery.includes('case') ||
        categoryQuery.includes('cover') ||
        categoryQuery.includes('bag') ||
        categoryQuery.includes('stand') ||
        categoryQuery.includes('mouse') ||
        categoryQuery.includes('headset') ||
        categoryQuery.includes('headphone') ||
        categoryQuery.includes('earbud') ||
        productTypeQuery.includes('sleeve') ||
        productTypeQuery.includes('case') ||
        productTypeQuery.includes('cover') ||
        productTypeQuery.includes('bag') ||
        productTypeQuery.includes('stand') ||
        productTypeQuery.includes('mouse') ||
        productTypeQuery.includes('headset') ||
        productTypeQuery.includes('headphone') ||
        productTypeQuery.includes('earbud');

      const isProductAccessory =
        pTitle.includes('sleeve') ||
        pTitle.includes('case') ||
        pTitle.includes('cover') ||
        pTitle.includes('mouse') ||
        pTitle.includes('headset') ||
        pTitle.includes('headphone') ||
        pTitle.includes('earbud');

      const isLaptopSearch =
        (categoryQuery.includes('laptop') || categoryQuery.includes('macbook') || productTypeQuery.includes('laptop') || productTypeQuery.includes('macbook')) &&
        !isAccessorySearch;

      if (isLaptopSearch && isProductAccessory) {
        return false;
      }

      // Specific product type checks
      if ((productTypeQuery.includes('lip balm') || productTypeQuery.includes('lipbalm') || productTypeQuery.includes('lip care') || productTypeQuery.includes('lip')) && !pTitle.includes('lip')) {
        return false;
      }
      if (productTypeQuery.includes('toner') && !pTitle.includes('toner')) {
        return false;
      }
      if (productTypeQuery.includes('cleanser') && !pTitle.includes('cleanser') && !pTitle.includes('wash')) {
        return false;
      }
      if (productTypeQuery.includes('cream') && !pTitle.includes('cream') && !pTitle.includes('moisturizer')) {
        return false;
      }
      if (productTypeQuery.includes('serum') && !pTitle.includes('serum')) {
        return false;
      }
      if (productTypeQuery.includes('sunscreen') && !pTitle.includes('sunscreen') && !pTitle.includes('spf')) {
        return false;
      }
      if (productTypeQuery.includes('dress') && !pTitle.includes('dress')) {
        return false;
      }
      if (productTypeQuery.includes('mouse') && !pTitle.includes('mouse')) {
        return false;
      }
      if ((productTypeQuery.includes('headset') || productTypeQuery.includes('headphone')) && !pTitle.includes('headset') && !pTitle.includes('headphone')) {
        return false;
      }
      if ((productTypeQuery.includes('sleeve') || productTypeQuery.includes('bag')) && !pTitle.includes('sleeve') && !pTitle.includes('bag')) {
        return false;
      }
      if ((productTypeQuery.includes('shoe') || productTypeQuery.includes('running')) && pCat !== 'shoes' && !pTitle.includes('shoe') && !pTitle.includes('running') && !pTitle.includes('sneaker')) {
        return false;
      }

      // Natural concern checks (e.g. pimples / acne)
      if ((concernQuery.includes('pimple') || concernQuery.includes('acne') || productTypeQuery.includes('acne') || productTypeQuery.includes('pimple')) &&
          !pTitle.includes('acne') && !pTitle.includes('pimple') && !pTitle.includes('blemish') && !pTitle.includes('salicylic') && !pTitle.includes('tea tree') && !pTitle.includes('spot')) {
        return false;
      }

      const isGeneralCategory = !categoryQuery || categoryQuery === 'general' || categoryQuery === 'other' || categoryQuery === 'all';

      const categoryMatch =
        isGeneralCategory ||
        pCat.includes(categoryQuery) ||
        categoryQuery.includes(pCat) ||
        (categoryQuery.includes('laptop') && pCat === 'laptops') ||
        (categoryQuery.includes('macbook') && pCat === 'laptops') ||
        (categoryQuery.includes('mouse') && (pCat === 'electronics' || pCat === 'gaming')) ||
        (categoryQuery.includes('sleeve') && pCat === 'electronics') ||
        (categoryQuery.includes('case') && pCat === 'electronics') ||
        (categoryQuery.includes('earbud') && pCat === 'electronics') ||
        (categoryQuery.includes('headphone') && (pCat === 'electronics' || pCat === 'gaming')) ||
        (categoryQuery.includes('headset') && (pCat === 'electronics' || pCat === 'gaming')) ||
        (categoryQuery.includes('audio') && (pCat === 'electronics' || pCat === 'gaming')) ||
        (categoryQuery.includes('phone') && (pCat === 'phones' || pCat === 'electronics')) ||
        (categoryQuery.includes('skin') && pCat === 'skincare') ||
        (categoryQuery.includes('toner') && (pCat === 'skincare' || pTitle.includes('toner'))) ||
        (categoryQuery.includes('cleanser') && (pCat === 'skincare' || pTitle.includes('cleanser'))) ||
        (categoryQuery.includes('moisturizer') && pCat === 'skincare') ||
        (categoryQuery.includes('serum') && pCat === 'skincare') ||
        (categoryQuery.includes('sunscreen') && pCat === 'skincare') ||
        (categoryQuery.includes('cream') && pCat === 'skincare') ||
        (categoryQuery.includes('pimple') && pCat === 'skincare') ||
        (categoryQuery.includes('acne') && pCat === 'skincare') ||
        (categoryQuery.includes('dress') && pCat === 'fashion') ||
        (categoryQuery.includes('fash') && pCat === 'fashion') ||
        (categoryQuery.includes('shoe') && pCat === 'shoes') ||
        (categoryQuery.includes('running') && pCat === 'shoes') ||
        (categoryQuery.includes('game') && (pCat === 'gaming' || pCat === 'electronics' || pCat === 'laptops')) ||
        (categoryQuery.includes('elec') && pCat === 'electronics') ||
        (categoryQuery.includes('groc') && pCat === 'groceries');

      if (!categoryMatch && !isGeneralCategory && categoryQuery.length > 0) {
        const fallbackMatch =
          pTitle.includes(categoryQuery) ||
          (productTypeQuery &&
            (pTitle.includes(productTypeQuery) ||
              productTypeQuery.split(' ').some((w) => w.length > 3 && pTitle.includes(w))));
        if (!fallbackMatch) return false;
      }

      // Check preferred brand matches
      if (intent.preferredBrands && intent.preferredBrands.length > 0) {
        const matchesAnyPreferred = intent.preferredBrands.some(
          (b) => pBrand.includes(b.toLowerCase()) || pTitle.includes(b.toLowerCase())
        );
        if (!matchesAnyPreferred) {
          return false;
        }
      }

      // Check excluded brands
      if (intent.excludedBrands && intent.excludedBrands.length > 0) {
        const matchesExcluded = intent.excludedBrands.some(
          (b) => pBrand.includes(b.toLowerCase()) || pTitle.includes(b.toLowerCase())
        );
        if (matchesExcluded) return false;
      }

      // Check stock
      if (!options?.includeOutOfStock && p.availability === 'out_of_stock') {
        return false;
      }

      return true;
    });

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    return matches.slice(offset, offset + limit);
  }

  async searchByQuery(query: string, category?: string, options?: SearchOptions): Promise<NormalizedProduct[]> {
    const q = query.toLowerCase().trim();
    const cat = category ? category.toLowerCase().trim() : undefined;

    const matches = this.products.filter((p) => {
      const matchCat = cat ? p.category.toLowerCase().includes(cat) || cat.includes(p.category.toLowerCase()) : true;
      const matchText =
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.merchantName && p.merchantName.toLowerCase().includes(q));

      if (!options?.includeOutOfStock && p.availability === 'out_of_stock') {
        return false;
      }

      return matchCat && (q.length === 0 || matchText);
    });

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    return matches.slice(offset, offset + limit);
  }

  getAllProducts(): NormalizedProduct[] {
    return [...this.products];
  }
}

export const mockCatalogProvider = new MockCatalogProvider();
