import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, Zap } from 'lucide-react';
import { socket } from '../services/socket';

export default function LiveSocketIndicator() {
  const [status, setStatus] = useState(socket.connected ? 'connected' : 'connecting');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      setStatus('connected');
      triggerPulse();
    };

    const handleDisconnect = () => setStatus('disconnected');

    const handleProductUpdated = () => triggerPulse();
    const handleStockUpdated = () => triggerPulse();
    const handleOrderCreated = () => triggerPulse();

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('product:updated', handleProductUpdated);
    socket.on('product:stockUpdated', handleStockUpdated);
    socket.on('order:created', handleOrderCreated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('product:updated', handleProductUpdated);
      socket.off('product:stockUpdated', handleStockUpdated);
      socket.off('order:created', handleOrderCreated);
    };
  }, []);

  const triggerPulse = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 1000);
  };

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm transition-all">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="hidden sm:inline">Socket.IO Live Sync</span>
        {pulse && <Zap className="w-3 h-3 text-amber-400 animate-bounce" />}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
      <RefreshCw className="w-3 h-3 animate-spin" />
      <span className="hidden sm:inline">Connecting Sync...</span>
    </div>
  );
}
