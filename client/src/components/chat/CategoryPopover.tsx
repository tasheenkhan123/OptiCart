import React, { useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Laptop, 
  Tv, 
  Shirt, 
  Gamepad2, 
  Apple, 
  Watch, 
  HeartHandshake, 
  Store, 
  X 
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  prompt: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'skincare',
    name: 'Skincare & Beauty',
    icon: <HeartHandshake className="w-4 h-4 text-pink-500" />,
    prompt: 'Find an anti-aging skincare routine with sunscreen under ₹2500',
  },
  {
    id: 'phones',
    name: 'Phones & Mobiles',
    icon: <Smartphone className="w-4 h-4 text-blue-500" />,
    prompt: 'Best 5G phone under ₹30,000 with 120Hz display and fast charging',
  },
  {
    id: 'laptops',
    name: 'Laptops & Work',
    icon: <Laptop className="w-4 h-4 text-indigo-500" />,
    prompt: 'Lightweight coding laptop with 16GB RAM and long battery life',
  },
  {
    id: 'electronics',
    name: 'Electronics & Audio',
    icon: <Tv className="w-4 h-4 text-purple-500" />,
    prompt: 'ANC wireless headphones under ₹15,000 with multipoint Bluetooth',
  },
  {
    id: 'fashion',
    name: 'Fashion & Clothes',
    icon: <Shirt className="w-4 h-4 text-emerald-500" />,
    prompt: 'Minimalist linen shirts and white sneakers bundle under ₹4000',
  },
  {
    id: 'gaming',
    name: 'Gaming & Gear',
    icon: <Gamepad2 className="w-4 h-4 text-violet-500" />,
    prompt: 'Wireless gaming controller and mechanical keyboard combo',
  },
  {
    id: 'groceries',
    name: 'Groceries & Pantry',
    icon: <Apple className="w-4 h-4 text-amber-500" />,
    prompt: 'Monthly organic pantry staples: cold-pressed oil, almond butter, oats',
  },
  {
    id: 'accessories',
    name: 'Accessories & Tech',
    icon: <Watch className="w-4 h-4 text-cyan-500" />,
    prompt: 'Smartwatch with AMOLED screen and SpO2 tracking under ₹5000',
  },
];

const STORES = [
  'Amazon India',
  'Nykaa',
  'Reliance Digital',
  'Croma',
  'Blinkit',
  'Vijay Sales',
  'Samsung Direct',
];

interface CategoryPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const CategoryPopover: React.FC<CategoryPopoverProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full mb-3 left-0 right-0 sm:left-auto sm:right-auto sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Browse Categories & Stores
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Categories Grid */}
      <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
        <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wide">
          Popular Categories
        </div>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              onSelectPrompt(cat.prompt);
              onClose();
            }}
            className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 transition-colors group"
          >
            <span className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-blue-100/60 transition-colors">
              {cat.icon}
            </span>
            <span className="flex-1 truncate">{cat.name}</span>
            <span className="text-[10px] text-slate-400 group-hover:text-blue-500">Insert →</span>
          </button>
        ))}

        {/* Supported Stores */}
        <div className="pt-3 mt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 px-2 pb-1.5 uppercase tracking-wide">
            <Store className="w-3 h-3 text-slate-400" />
            <span>Integrated Merchants</span>
          </div>
          <div className="flex flex-wrap gap-1 px-2">
            {STORES.map((store) => (
              <span
                key={store}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
              >
                {store}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
