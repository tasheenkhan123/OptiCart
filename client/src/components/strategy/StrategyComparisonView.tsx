import React from 'react';
import { Sparkles, TrendingDown } from 'lucide-react';
import { PurchaseStrategyResult } from '../../types';
import { ProductResultCard } from './ProductResultCard';

interface StrategyComparisonViewProps {
  strategies: PurchaseStrategyResult[];
  budget?: number;
}

export const StrategyComparisonView: React.FC<StrategyComparisonViewProps> = ({ strategies, budget }) => {
  if (!strategies || strategies.length === 0) {
    return null;
  }

  const currencySymbol = '₹';

  // Determine if this is a multi-item bundle request (e.g. Toner + Cleanser)
  const isMultiItemBasket = Boolean(
    strategies.some((s) => s.isMultiItem) ||
      (strategies[0]?.items?.length > 1 && strategies[0]?.items[0]?.itemRequirementName)
  );

  // Compute total options count
  const optionCount = isMultiItemBasket ? strategies.length : (strategies[0]?.items?.length || 1);

  // Formulate concise subtitle
  const targetBudget = budget || strategies[0]?.subtotal;
  const subtitle = targetBudget
    ? `Here are ${optionCount} good option${optionCount > 1 ? 's' : ''} within your ${currencySymbol}${targetBudget.toLocaleString('en-IN')} budget.`
    : `Here are ${optionCount} good option${optionCount > 1 ? 's' : ''} tailored for your request.`;

  return (
    <div className="mt-2 space-y-4 animate-in fade-in duration-200">
      {/* Top Header: Sparkles + Optimized for you */}
      <div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Optimized for you</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {/* =========================================================================
          MULTI-ITEM BUNDLE PRESENTATION (e.g., Toner + Cleanser)
          Renders Option 1, Option 2, Option 3 as distinct complete bundles.
         ========================================================================= */}
      {isMultiItemBasket ? (
        <div className="space-y-4">
          {strategies.map((option, optIdx) => {
            const totalSavings = (option.totalDiscount || 0) + (option.razorpaySavingsEstimate || 0);
            const gridCols =
              option.items.length === 2
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3';

            return (
              <div
                key={`bundle-option-${optIdx}`}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-3"
              >
                {/* Option Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wider bg-slate-900 text-white uppercase shadow-2xs">
                    Option {optIdx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {option.items.length} Items Bundle
                  </span>
                </div>

                {/* Product Cards in this Option */}
                <div className={gridCols}>
                  {option.items.map((prod, pIdx) => (
                    <ProductResultCard key={prod.id || `opt-${optIdx}-prod-${pIdx}`} product={prod} />
                  ))}
                </div>

                {/* Compact Option Summary Bar */}
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Effective Price
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 leading-tight mt-0.5">
                      {currencySymbol}{option.effectiveTotal.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {totalSavings > 0 && (
                      <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Save {currencySymbol}{totalSavings.toLocaleString('en-IN')}</span>
                      </span>
                    )}

                    {option.budgetHeadroom > 0 && (
                      <span className="text-xs text-slate-700 font-medium bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80">
                        {currencySymbol}{option.budgetHeadroom.toLocaleString('en-IN')} under budget
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* =========================================================================
            SINGLE-ITEM MULTI-OPTION PRESENTATION (e.g., 3 ASUS Gaming Laptops)
            Renders up to 3 distinct product cards with Option 1, Option 2, Option 3 labels.
           ========================================================================= */
        <div>
          <div
            className={`grid gap-3.5 ${
              strategies[0]?.items?.length === 1
                ? 'grid-cols-1 max-w-sm'
                : strategies[0]?.items?.length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {strategies[0]?.items?.map((product, idx) => {
              // Ensure clean Option # label on single item cards
              const productWithOption = {
                ...product,
                recommendationLabel: `Option ${idx + 1}`,
              };
              return <ProductResultCard key={product.id || idx} product={productWithOption} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
