import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (window.location.port === '5174' || window.location.port === '5173' ? 'http://localhost:5000' : '/');

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on('connect', () => {
  console.log(`%c[Admin Socket.IO Connected] %cID: ${socket.id}`, 'color: #06b6d4; font-weight: bold;', 'color: #67e8f9;');
});

socket.on('disconnect', (reason) => {
  console.log(`%c[Admin Socket.IO Disconnected] %cReason: ${reason}`, 'color: #ef4444; font-weight: bold;', 'color: #fca5a5;');
});
