import React from 'react';
import { ShoppingBag, RotateCcw } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';
import { HealthCheckData } from '../../types';

interface HeaderProps {
  loading: boolean;
  connected: boolean;
  healthData: HealthCheckData | null;
  error: string | null;
  onRefreshHealth: () => void;
  onResetChat?: () => void;
  hasMessages?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  loading,
  connected,
  healthData,
  error,
  onRefreshHealth,
  onResetChat,
  hasMessages = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-2xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight text-slate-900">
            Opti<span className="text-blue-600">Cart</span>
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {hasMessages && onResetChat && (
            <button
              onClick={onResetChat}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Start a new shopping conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          <StatusIndicator
            loading={loading}
            connected={connected}
            healthData={healthData}
            error={error}
            onRefresh={onRefreshHealth}
          />
        </div>
      </div>
    </header>
  );
};
