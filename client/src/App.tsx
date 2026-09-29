import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { checkBackendHealth } from './services/api';
import { HealthCheckData } from './types';

export const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState<number>(0);
  const [hasMessages, setHasMessages] = useState<boolean>(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    const res = await checkBackendHealth();
    setConnected(res.connected);
    setHealthData(res.data);
    setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHealth();
    // Auto-refresh health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const handleResetChat = () => {
    setChatKey((prev) => prev + 1);
    setHasMessages(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Header
        loading={loading}
        connected={connected}
        healthData={healthData}
        error={error}
        onRefreshHealth={fetchHealth}
        onResetChat={handleResetChat}
        hasMessages={hasMessages}
      />

      <HomePage 
        key={chatKey} 
        onMessageCountChange={(count) => setHasMessages(count > 0)} 
      />

      <Footer />
    </div>
  );
};

export default App;
