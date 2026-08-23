import React, { useState, useEffect } from 'react';
import { Radio, Wifi, WifiOff } from 'lucide-react';
import { socket } from '../../services/socket';

export default function LiveSocketIndicator() {
  const [status, setStatus] = useState(socket.connected ? 'connected' : 'connecting');

  useEffect(() => {
    const handleConnect = () => setStatus('connected');
    const handleDisconnect = () => setStatus('disconnected');
    const handleConnectError = () => setStatus('disconnected');

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 live-badge-pulse" />
        <span className="hidden sm:inline">Socket.IO Live Sync:</span> Connected
      </div>
    );
  }

  if (status === 'disconnected') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        <span className="hidden sm:inline">Socket.IO:</span> Disconnected (Reconnecting...)
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
      <span className="hidden sm:inline">Socket.IO:</span> Connecting...
    </div>
  );
}
