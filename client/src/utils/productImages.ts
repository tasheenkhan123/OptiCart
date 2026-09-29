/**
 * Curated product image resolver providing high-definition product imagery
 * matching category, product type, brand, and title.
 */
export function getCuratedProductImage(category?: string, title?: string, brand?: string): string {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();
  const b = (brand || '').toLowerCase();

  // 1. Lip Care / Lip Balm / Lipstick
  if (t.includes('lip balm') || t.includes('lipbalm') || t.includes('lip care') || t.includes('lip butter') || t.includes('lip sleeping') || t.includes('baby lips')) {
    if (b.includes('minimalist') || t.includes('spf')) {
      return 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&auto=format&fit=crop&q=80';
    }
    if (b.includes('nivea') || b.includes('burt') || b.includes('vaseline')) {
      return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80';
  }

  if (t.includes('lipstick') || t.includes('lip gloss') || t.includes('lip tint')) {
    return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=80';
  }

  // 2. Skincare - Toners
  if (t.includes('toner')) {
    return 'https://images.unsplash.com/photo-1608248597359-59367d9178e3?w=500&auto=format&fit=crop&q=80';
  }

  // 3. Skincare - Cleansers & Face Wash
  if (t.includes('cleanser') || t.includes('face wash') || t.includes('facewash')) {
    return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80';
  }

  // 4. Skincare - Sunscreens
  if (t.includes('sunscreen') || t.includes('spf') || t.includes('sunblock')) {
    return 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=80';
  }

  // 5. Skincare - Serums
  if (t.includes('serum') || t.includes('niacinamide') || t.includes('salicylic acid 2% serum')) {
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80';
  }

  // 6. Skincare - Creams & Pimple Treatments & Moisturizers
  if (t.includes('pimple') || t.includes('acne') || t.includes('cream') || t.includes('moisturizer') || t.includes('lotion')) {
    return 'https://images.unsplash.com/photo-1556228722-d0b5d0363297?w=500&auto=format&fit=crop&q=80';
  }

  // 7. Laptops - MacBooks
  if (t.includes('macbook') || (b.includes('apple') && (t.includes('laptop') || c.includes('laptop')))) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80';
  }

  // 8. Laptops - Gaming & Ultrabooks
  if (c.includes('laptop') || t.includes('laptop') || t.includes('tuf') || t.includes('loq') || t.includes('nitro') || t.includes('rog') || t.includes('victus')) {
    return 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80';
  }

  // 9. Phones
  if (t.includes('iphone') || (b.includes('apple') && (t.includes('phone') || c.includes('phone')))) {
    return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80';
  }
  if (c.includes('phone') || t.includes('phone') || t.includes('smartphone') || t.includes('galaxy') || t.includes('oneplus') || t.includes('redmi') || t.includes('pixel')) {
    return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80';
  }

  // 10. Electronics Accessories
  if (t.includes('mouse')) {
    return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('sleeve') || t.includes('bag') || t.includes('backpack') || t.includes('case')) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('headset') || t.includes('headphone')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('earbud') || t.includes('earphone') || t.includes('airpod')) {
    return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('watch') || t.includes('smartwatch')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('controller') || t.includes('gamepad') || t.includes('playstation') || t.includes('ps5')) {
    return 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500&auto=format&fit=crop&q=80';
  }

  // 11. Footwear / Shoes
  if (c.includes('shoe') || t.includes('shoe') || t.includes('sneaker') || t.includes('pegasus') || t.includes('running')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80';
  }

  // 12. Fashion
  if (t.includes('dress') || t.includes('skirt')) {
    return 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('jean') || t.includes('denim')) {
    return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('hoodie') || t.includes('jacket') || t.includes('shirt') || t.includes('t-shirt') || c.includes('fashion')) {
    return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80';
  }

  // 13. Groceries
  if (c.includes('grocer') || t.includes('oil') || t.includes('food')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80';
  }

  // Fallback default
  return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80';
}
