import React, { useState } from 'react';
import { ExternalLink, Store, Laptop, Smartphone, Sparkles, Footprints, Headphones, ShoppingBag } from 'lucide-react';
import { NormalizedProduct } from '../../types';
import { getCuratedProductImage } from '../../utils/productImages';
import { getMerchantStoreSearchUrl } from '../../utils/merchantUrls';

interface ProductResultCardProps {
  product: NormalizedProduct;
}

export const ProductResultCard: React.FC<ProductResultCardProps> = ({ product }) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const currencySymbol = '₹';

  // Calculate pricing values
  const effectivePrice = product.effectivePrice ?? (product.price - (product.paymentBenefit?.calculatedSavings || 0));
  const originalPrice = product.originalPrice && product.originalPrice > effectivePrice ? product.originalPrice : undefined;
  const totalSavings = originalPrice ? originalPrice - effectivePrice : (product.price > effectivePrice ? product.price - effectivePrice : 0);

  // Determine a verified live merchant URL
  const merchantUrl = getMerchantStoreSearchUrl(
    product.merchantName,
    product.title,
    product.merchantDomain,
    product.productUrl,
    product.brand
  );

  // Resolve high-resolution product image
  const displayImage = product.imageUrl || getCuratedProductImage(product.category, product.title, product.brand);

  const getCategoryIcon = () => {
    const cat = (product.category || '').toLowerCase();
    const title = (product.title || '').toLowerCase();

    if (cat.includes('laptop') || title.includes('laptop') || title.includes('macbook')) {
      return <Laptop className="w-8 h-8 text-slate-400 stroke-[1.5]" />;
    }
    if (cat.includes('phone') || title.includes('phone') || title.includes('galaxy') || title.includes('iphone')) {
      return <Smartphone className="w-8 h-8 text-slate-400 stroke-[1.5]" />;
    }
    if (cat.includes('skin') || title.includes('lip') || title.includes('serum') || title.includes('cream') || title.includes('sunscreen') || title.includes('toner') || title.includes('cleanser') || title.includes('pimple')) {
      return <Sparkles className="w-8 h-8 text-purple-400 stroke-[1.5]" />;
    }
    if (cat.includes('shoe') || title.includes('shoe') || title.includes('sneaker') || title.includes('pegasus')) {
      return <Footprints className="w-8 h-8 text-emerald-500 stroke-[1.5]" />;
    }
    if (cat.includes('electronic') || title.includes('headphone') || title.includes('mouse') || title.includes('earbud') || title.includes('headset') || title.includes('sleeve')) {
      return <Headphones className="w-8 h-8 text-blue-500 stroke-[1.5]" />;
    }
    return <ShoppingBag className="w-8 h-8 text-slate-400 stroke-[1.5]" />;
  };

  const formatBadgeText = (text?: string): string | undefined => {
    if (!text) return undefined;
    const lower = text.toLowerCase();
    if (lower.includes('lip')) return 'LIP CARE';
    if (lower.includes('toner')) return 'TONER';
    if (lower.includes('cleanser') || lower.includes('wash')) return 'CLEANSER';
    if (lower.includes('sunscreen') || lower.includes('spf')) return 'SUNSCREEN';
    if (lower.includes('serum')) return 'SERUM';
    if (lower.includes('moisturizer')) return 'MOISTURIZER';
    if (lower.includes('cream')) return 'CREAM';
    if (lower.includes('mouse')) return 'MOUSE';
    if (lower.includes('sleeve') || lower.includes('bag') || lower.includes('case')) return 'SLEEVE';
    if (lower.includes('headset') || lower.includes('headphone')) return 'HEADSET';
    if (lower.includes('earbud')) return 'EARBUDS';
    if (lower.includes('laptop') || lower.includes('macbook')) return 'LAPTOP';
    if (lower.includes('dress')) return 'DRESS';
    if (lower.includes('shoe') || lower.includes('sneaker')) return 'SHOES';
    if (lower.includes('option 1') || lower.includes('#1')) return 'OPTION 1';
    if (lower.includes('option 2') || lower.includes('#2')) return 'OPTION 2';
    if (lower.includes('option 3') || lower.includes('#3')) return 'OPTION 3';
    return text.toUpperCase();
  };

  const rawBadge = product.itemRequirementName || product.recommendationLabel;
  const badgeText = formatBadgeText(rawBadge);
  const isSlotBadge = Boolean(product.itemRequirementName);

  return (
    <div className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Slot / Requirement Badge */}
        {badgeText && (
          <div className="flex items-center justify-between mb-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                isSlotBadge
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : badgeText === 'OPTION 1'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : badgeText === 'OPTION 2'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-purple-600 text-white shadow-2xs'
              }`}
            >
              {badgeText}
            </span>
            {product.brand && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {product.brand}
              </span>
            )}
          </div>
        )}

        {/* Centered Product Image / Icon Box */}
        <div className="w-full h-28 sm:h-32 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-center overflow-hidden p-2 mb-3">
          {displayImage && !imgError ? (
            <img
              src={displayImage}
              alt={product.title}
              className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
              {getCategoryIcon()}
              <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                {product.brand || product.category}
              </span>
            </div>
          )}
        </div>

        {/* Product Title */}
        <h4
          className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors"
          title={product.title}
        >
          {product.title}
        </h4>

        {/* Merchant Store */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-3">
          <Store className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-700 truncate">{product.merchantName}</span>
        </div>

        {/* Pricing Line */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          {originalPrice && (
            <div className="text-xs text-slate-400 line-through">
              {currencySymbol}{originalPrice.toLocaleString('en-IN')}
            </div>
          )}
          <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
              {currencySymbol}{effectivePrice.toLocaleString('en-IN')}
            </span>

            {totalSavings > 0 && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Save {currencySymbol}{totalSavings.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button: View Product */}
      <div className="mt-3.5 pt-1">
        <a
          href={merchantUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <span>View Product</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
