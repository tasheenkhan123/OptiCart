import React from 'react';
import { 
  Sparkles, 
  HeartHandshake, 
  Smartphone, 
  Gamepad2, 
  Shirt, 
  Laptop, 
  Headphones, 
  ArrowUpRight 
} from 'lucide-react';
import { SuggestedPromptItem } from '../../types';

export const DEFAULT_SUGGESTED_PROMPTS: SuggestedPromptItem[] = [
  {
    id: 'prompt-skincare',
    category: 'Skincare',
    prompt: 'Find skincare products from Minimalist, Anua or Medik8 under ₹5,000.',
    iconName: 'HeartHandshake',
    tag: 'Popular',
  },
  {
    id: 'prompt-phone',
    category: 'Phones',
    prompt: 'Find a Samsung phone under ₹30,000.',
    iconName: 'Smartphone',
    tag: 'Mobiles',
  },
  {
    id: 'prompt-gaming',
    category: 'Gaming',
    prompt: 'Build me a gaming setup under ₹1 lakh.',
    iconName: 'Gamepad2',
    tag: 'Setup',
  },
  {
    id: 'prompt-shoes',
    category: 'Fashion',
    prompt: 'Find Nike or Adidas shoes under ₹5,000.',
    iconName: 'Shirt',
    tag: 'Footwear',
  },
  {
    id: 'prompt-laptop',
    category: 'Laptops',
    prompt: 'Lightweight coding laptop with 16GB RAM and long battery life under ₹75,000.',
    iconName: 'Laptop',
    tag: 'Work',
  },
  {
    id: 'prompt-audio',
    category: 'Audio',
    prompt: 'Best noise-cancelling wireless headphones with multipoint connection.',
    iconName: 'Headphones',
    tag: 'Audio',
  },
];

interface SuggestedPromptProps {
  prompts?: SuggestedPromptItem[];
  onSelectPrompt: (prompt: string) => void;
  compact?: boolean;
}

export const SuggestedPrompt: React.FC<SuggestedPromptProps> = ({
  prompts = DEFAULT_SUGGESTED_PROMPTS,
  onSelectPrompt,
  compact = false,
}) => {
  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4 text-pink-500" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-blue-500" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-4 h-4 text-violet-500" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4 text-emerald-500" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-indigo-500" />;
      case 'Headphones':
        return <Headphones className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
        {prompts.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-all shadow-2xs"
          >
            {renderIcon(item.iconName)}
            <span className="truncate max-w-[200px]">{item.prompt}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
      {prompts.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelectPrompt(item.prompt)}
          className="group text-left p-3.5 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-blue-100/60 transition-colors flex-shrink-0">
              {renderIcon(item.iconName)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {item.category}
                </span>
                {item.tag && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                    {item.tag}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-800 group-hover:text-blue-900 leading-snug">
                "{item.prompt}"
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0 mt-1" />
        </button>
      ))}
    </div>
  );
};
