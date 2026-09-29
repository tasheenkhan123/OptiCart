import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface LoadingIndicatorProps {
  statusText?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  statusText = 'OptiCart is formulating recommendations...',
}) => {
  return (
    <div className="flex items-start gap-3 justify-start animate-in fade-in duration-200">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
        <ShoppingBag className="w-4 h-4" />
      </div>

      {/* Bubble with typing dots */}
      <div className="bg-white text-slate-700 border border-slate-200/90 shadow-xs rounded-2xl rounded-bl-xs px-4 py-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 py-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {statusText}
        </span>
      </div>
    </div>
  );
};
