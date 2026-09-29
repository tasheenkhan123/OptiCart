import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  BadgePercent,
  ChevronDown,
  ChevronUp,
  Truck,
  Store,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  Info,
} from 'lucide-react';
import { PurchaseStrategyResult } from '../../types';

interface StrategyCardProps {
  strategy: PurchaseStrategyResult;
  isRecommended?: boolean;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  isRecommended = false,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const getStrategyMeta = () => {
    switch (strategy.strategy) {
      case 'BEST_VALUE':
        return {
          icon: <Sparkles className="w-4 h-4 text-blue-600" />,
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          borderColor: 'border-blue-200 hover:border-blue-300',
          accentColor: 'text-blue-600',
          headerBg: 'bg-gradient-to-r from-blue-50/70 to-indigo-50/40',
        };
      case 'BEST_FOR_BRANDS':
        return {
          icon: <Award className="w-4 h-4 text-purple-600" />,
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
          borderColor: 'border-purple-200 hover:border-purple-300',
          accentColor: 'text-purple-600',
          headerBg: 'bg-gradient-to-r from-purple-50/70 to-pink-50/40',
        };
      case 'MAXIMUM_SAVINGS':
        return {
          icon: <BadgePercent className="w-4 h-4 text-emerald-600" />,
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          borderColor: 'border-emerald-200 hover:border-emerald-300',
          accentColor: 'text-emerald-600',
          headerBg: 'bg-gradient-to-r from-emerald-50/70 to-teal-50/40',
        };
    }
  };

  const meta = getStrategyMeta();
  const currencySymbol = '₹';

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden shadow-xs transition-all duration-200 mb-3 ${meta.borderColor} ${
        isRecommended ? 'ring-1 ring-blue-500/20 shadow-sm' : ''
      }`}
    >
      {/* Header */}
      <div className={`px-4 py-3 border-b border-slate-100 ${meta.headerBg}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${meta.badgeBg}`}
            >
              {meta.icon}
              <span>{strategy.title}</span>
            </span>
            {isRecommended && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                Top Pick
              </span>
            )}
            {(strategy.isMultiItem || strategy.items.length > 1) && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {strategy.items.length} Items &bull; {strategy.merchantSplit?.length || 1} Stores
              </span>
            )}
          </div>

          <div className="text-right">
            <div className="text-base font-bold text-slate-900 leading-none">
              {currencySymbol}
              {strategy.effectiveTotal.toLocaleString('en-IN')}
            </div>
            {strategy.totalDiscount + strategy.razorpaySavingsEstimate > 0 && (
              <div className="text-[11px] text-slate-400 line-through">
                {currencySymbol}
                {(
                  strategy.subtotal +
                  strategy.totalDiscount
                ).toLocaleString('en-IN')}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
          {strategy.tagline}
        </p>
      </div>

      {/* Body: Savings Callout & Products */}
      <div className="p-4 space-y-3">
        {/* Savings & Offer Bar */}
        {(strategy.totalDiscount > 0 || strategy.razorpaySavingsEstimate > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {strategy.razorpaySavingsEstimate > 0 && (
              <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingDown className="w-3 h-3" />
                <span>
                  Save {currencySymbol}
                  {strategy.razorpaySavingsEstimate.toLocaleString('en-IN')} via Razorpay / Bank Offer
                </span>
              </span>
            )}
            {strategy.budgetHeadroom > 0 && (
              <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                <span>
                  {currencySymbol}
                  {strategy.budgetHeadroom.toLocaleString('en-IN')} under budget
                </span>
              </span>
            )}
          </div>
        )}

        {/* Product Items in this Strategy */}
        <div className="space-y-2">
          {strategy.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70 text-xs"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="font-semibold text-slate-800 line-clamp-1">
                    {item.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200/80 text-slate-700">
                    {item.brand}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Store className="w-3 h-3 text-slate-400" />
                    <span>{item.merchantName}</span>
                  </span>
                  {item.deliveryInformation?.deliveryDays && (
                    <span className="inline-flex items-center gap-1">
                      <Truck className="w-3 h-3 text-slate-400" />
                      <span>{item.deliveryInformation.deliveryDays}d delivery</span>
                    </span>
                  )}
                  {item.rating && (
                    <span className="text-amber-600 font-medium">
                      ★ {item.rating}
                    </span>
                  )}
                </div>

                {item.paymentOffers && item.paymentOffers.length > 0 && (
                  <div className="mt-1 text-[10px] text-emerald-600 font-medium line-clamp-1">
                    🏷️ {item.paymentOffers[0]}
                  </div>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-bold text-slate-900">
                  {currencySymbol}
                  {item.price.toLocaleString('en-IN')}
                </div>
                {item.originalPrice && item.originalPrice > item.price && (
                  <div className="text-[10px] text-slate-400 line-through">
                    {currencySymbol}
                    {item.originalPrice.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Strategy Justification Quote */}
        <div className="p-3 rounded-lg bg-blue-50/40 border border-blue-100 text-xs text-slate-700 leading-relaxed">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-blue-900">Why this strategy: </span>
              {strategy.explanation}
            </div>
          </div>
        </div>

        {/* Toggle Detailed Score Breakdown & Tradeoffs */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-800 py-1 transition-colors"
          >
            <span>
              {showDetails ? 'Hide Score Breakdown & Tradeoffs' : 'View Transparent 5-Factor Scores & Tradeoffs'}
            </span>
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showDetails && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
              {/* Score Dials / Bars */}
              <div>
                <div className="text-[11px] font-semibold text-slate-700 mb-2">
                  Optimization Score Breakdown (Overall: {strategy.scoreBreakdown.overallScore}/100)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-medium">Quality/Specs</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {strategy.scoreBreakdown.qualityScore}
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-medium">Brand Match</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {strategy.scoreBreakdown.brandScore}
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-medium">Net Savings</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {strategy.scoreBreakdown.savingsScore}
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-medium">Merchant Trust</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {strategy.scoreBreakdown.merchantScore}
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                    <div className="text-slate-400 font-medium">Delivery</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {strategy.scoreBreakdown.deliveryScore}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tradeoffs & Highlights */}
              <div className="space-y-1.5 text-[11px]">
                {strategy.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
                {strategy.tradeoffs.map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
