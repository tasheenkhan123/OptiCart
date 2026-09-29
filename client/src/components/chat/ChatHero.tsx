import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Compass, 
  SlidersHorizontal, 
  ShieldCheck, 
  CreditCard, 
  Package, 
  Bot 
} from 'lucide-react';
import { CategoryChips } from './CategoryChips';
import { StrategyCards } from './StrategyCards';

export const ChatHero: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [budget, setBudget] = useState('');
  const [activeTab, setActiveTab] = useState<'prompt' | 'preferences'>('prompt');

  const handleSendPlaceholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    alert(
      `[OptiCart Foundation Ready]\n\nYour prompt: "${prompt}"\n\nIn the next phase, the Gemini AI agent & multi-merchant optimizer will analyze this query across categories and return 3 purchase strategies.`
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Hero Headline & Subtitle */}
      <div className="text-center max-w-3xl mb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI-Powered Multi-Merchant Purchase Optimization</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Shop Smarter Across Stores,{' '}
          <span className="text-gradient-brand">Optimized for You</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Tell OptiCart what you need in natural language. We evaluate budget, trusted merchants, delivery, brand preferences, and Razorpay benefits to craft your optimal purchase plan.
        </p>
      </div>

      {/* Central Interactive Shopping Box */}
      <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 relative overflow-hidden border border-slate-800">
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Box Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'prompt'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Shopping Query</span>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'preferences'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Budget & Criteria Filters</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-Merchant Verified</span>
          </div>
        </div>

        {/* Input Form Area */}
        {activeTab === 'prompt' ? (
          <form onSubmit={handleSendPlaceholder} className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'I need a complete setup for hybrid work: a 27-inch 4K monitor, noise-cancelling headphones, and a laptop stand under ₹35,000 with fast 2-day delivery'..."
                rows={3}
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none transition-all outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400">Max Budget:</span>
                <div className="relative w-36">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">₹</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-6 pr-2 py-1 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Optimize My Purchase</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Razorpay Offer Matching
                </span>
                <p className="text-slate-400">
                  Automatically scans UPI, NetBanking, and Card-specific instant discount and cashback offers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-400" /> Basket-Level Optimization
                </span>
                <p className="text-slate-400">
                  Optimizes multi-item carts across merchants to minimize separate shipping costs and maximize combined basket discounts.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('prompt')}
              className="text-xs text-indigo-400 hover:underline"
            >
              ← Back to Shopping Query
            </button>
          </div>
        )}

        {/* Category Chips Showcase */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <CategoryChips onSelectPrompt={(p) => setPrompt(p)} />
        </div>
      </div>

      {/* 3 Strategy Engine Showcase Cards */}
      <StrategyCards />

      {/* Architectural Readiness Callout */}
      <div className="w-full p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>
            <strong>Phase 1 Foundation Live:</strong> Clean folder separation, typed API client, health monitoring, and extensible service contracts.
          </span>
        </div>
      </div>
    </div>
  );
};
