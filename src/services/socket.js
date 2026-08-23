import { io } from 'socket.io-client';

// Connect to configured URL, or window origin, or fallback to localhost:5000 in dev
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (window.location.port === '5173' ? 'http://localhost:5000' : '/');

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on('connect', () => {
  console.log(`%c[Socket.IO Connected] %cConnection ID: ${socket.id}`, 'color: #10b981; font-weight: bold;', 'color: #6ee7b7;');
});

socket.on('disconnect', (reason) => {
  console.log(`%c[Socket.IO Disconnected] %cReason: ${reason}`, 'color: #ef4444; font-weight: bold;', 'color: #fca5a5;');
});

socket.on('connect_error', (error) => {
  console.warn('[Socket.IO Connection Warning]', error.message);
});
