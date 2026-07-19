import { io } from 'socket.io-client';

// Derive the socket server URL from the API base — strip the /api/v1 suffix
// since socket.io connects to the server root, not a REST path.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = API_BASE.replace(/\/api\/v1\/?$/, '');

let socket = null;

/**
 * Returns a singleton socket connection. Created lazily on first call
 * (client-side only) so it's never instantiated during SSR.
 */
export function getSocket() {
  if (typeof window === 'undefined') return null;
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
