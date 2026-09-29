import React from 'react';
import { Award, Heart, TrendingDown, Check } from 'lucide-react';
import { StrategyInfo } from '../../types';

const STRATEGIES: StrategyInfo[] = [
  {
    type: 'BEST_VALUE',
    title: '1. Best Value',
    tagline: 'Optimal Balance of Quality & Price',
    description: 'Blends verified user ratings, merchant reliability, warranty, and overall performance per rupee spent.',
    badgeColor: 'border-blue-200 bg-blue-50 text-blue-700',
    iconName: 'Award',
  },
  {
    type: 'BEST_FOR_BRANDS',
    title: '2. Best for Your Brands',
    tagline: 'Brand Affinity & Ecosystem Fit',
    description: 'Prioritizes your preferred brands and trusted OEM merchants while filtering out excluded brands.',
    badgeColor: 'border-purple-200 bg-purple-50 text-purple-700',
    iconName: 'Heart',
  },
  {
    type: 'MAXIMUM_SAVINGS',
    title: '3. Maximum Savings',
    tagline: 'Deepest Net Price Optimization',
    description: 'Combines cross-merchant lowest prices, bundle deals, coupons, and Razorpay payment offers.',
    badgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    iconName: 'TrendingDown',
  },
];

export const StrategyCards: React.FC = () => {
  return (
    <div className="w-full my-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STRATEGIES.map((strat) => {
          const isValue = strat.type === 'BEST_VALUE';
          const isBrand = strat.type === 'BEST_FOR_BRANDS';
          const isSavings = strat.type === 'MAXIMUM_SAVINGS';

          return (
            <div
              key={strat.type}
              className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${strat.badgeColor}`}>
                    {strat.title}
                  </span>
                  {isValue && <Award className="w-4 h-4 text-blue-600" />}
                  {isBrand && <Heart className="w-4 h-4 text-purple-600" />}
                  {isSavings && <TrendingDown className="w-4 h-4 text-emerald-600" />}
                </div>

                <h4 className="text-xs font-bold text-slate-800 mt-1 mb-1">
                  {strat.tagline}
                </h4>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {strat.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
                <Check className="w-3 h-3 text-blue-600" />
                <span>Strategy engine ready</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
