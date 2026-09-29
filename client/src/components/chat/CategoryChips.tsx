import React from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Laptop, 
  Tv, 
  Shirt, 
  Gamepad2, 
  Apple, 
  Watch, 
  HeartHandshake 
} from 'lucide-react';

interface CategoryItem {
  name: string;
  icon: React.ReactNode;
  popularPrompt: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    name: 'Skincare & Beauty',
    icon: <HeartHandshake className="w-3.5 h-3.5" />,
    popularPrompt: 'Find an anti-aging skincare routine with sunscreen under ₹2500',
  },
  {
    name: 'Phones & Mobiles',
    icon: <Smartphone className="w-3.5 h-3.5" />,
    popularPrompt: 'Best 5G phone under ₹30,000 with 120Hz display and fast charging',
  },
  {
    name: 'Laptops & Work',
    icon: <Laptop className="w-3.5 h-3.5" />,
    popularPrompt: 'Lightweight coding laptop with 16GB RAM and long battery life',
  },
  {
    name: 'Electronics & Audio',
    icon: <Tv className="w-3.5 h-3.5" />,
    popularPrompt: 'ANC wireless headphones under ₹15,000 with multipoint Bluetooth',
  },
  {
    name: 'Fashion & Clothes',
    icon: <Shirt className="w-3.5 h-3.5" />,
    popularPrompt: 'Minimalist linen shirts and white sneakers bundle under ₹4000',
  },
  {
    name: 'Gaming & Gear',
    icon: <Gamepad2 className="w-3.5 h-3.5" />,
    popularPrompt: 'Wireless gaming controller and mechanical keyboard combo',
  },
  {
    name: 'Groceries & Pantry',
    icon: <Apple className="w-3.5 h-3.5" />,
    popularPrompt: 'Monthly organic pantry staples: cold-pressed oil, almond butter, oats',
  },
  {
    name: 'Accessories & Tech',
    icon: <Watch className="w-3.5 h-3.5" />,
    popularPrompt: 'Smartwatch with AMOLED screen and SpO2 tracking under ₹5000',
  },
];

interface CategoryChipsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Category-Independent AI Optimization
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onSelectPrompt(cat.popularPrompt)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/90 hover:bg-indigo-950/50 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-indigo-400">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
