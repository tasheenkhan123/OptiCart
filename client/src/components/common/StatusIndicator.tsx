import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { HealthCheckData } from '../../types';

interface StatusIndicatorProps {
  loading: boolean;
  connected: boolean;
  healthData: HealthCheckData | null;
  error: string | null;
  onRefresh: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  loading,
  connected,
  healthData,
  error,
  onRefresh,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
          loading
            ? 'bg-slate-100 border-slate-200 text-slate-500'
            : connected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}
        title={error || (healthData ? `OptiCart API v${healthData.version} | ${healthData.environment}` : 'Checking connection...')}
      >
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
        ) : connected ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        ) : (
          <AlertCircle className="w-3 h-3 text-rose-500" />
        )}

        <span className="hidden sm:inline">
          {loading
            ? 'Connecting...'
            : connected
            ? 'Online'
            : 'Offline'}
        </span>
      </div>

      <button
        onClick={onRefresh}
        className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        title="Refresh backend status"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
