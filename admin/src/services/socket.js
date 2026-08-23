import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return 'https://og-supplement-api.onrender.com';
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on('connect', () => {
  console.log(`%c[Admin Socket.IO Connected] %cConnection ID: ${socket.id}`, 'color: #06b6d4; font-weight: bold;', 'color: #67e8f9;');
});

socket.on('disconnect', (reason) => {
  console.log(`%c[Admin Socket.IO Disconnected] %cReason: ${reason}`, 'color: #ef4444; font-weight: bold;', 'color: #fca5a5;');
});

socket.on('connect_error', (error) => {
  console.warn('[Admin Socket.IO Connection Notice]', error.message);
});
