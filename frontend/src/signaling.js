// src/signaling.js
// Listens to real-time events from the VoiceGuard backend WebSocket server
// Notifies the web report dashboard when Android app events occur.
import { WS_URL } from './config.js';

let socket = null;
const listeners = new Set();

export function addSignalingListener(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(msg) {
  listeners.forEach((cb) => {
    try {
      cb(msg);
    } catch (e) {
      console.error('[WS Listener Error]', e);
    }
  });
}

export function connectSignaling(token) {
  if (!token) return;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);

    socket.onopen = () => {
      console.log('[WS] Connected to VoiceGuard backend signaling server');
      notifyListeners({ type: 'ws.connected' });
    };

    socket.onclose = (event) => {
      console.log('[WS] Disconnected from server (code: ' + event.code + '). Reconnecting in 4s...');
      socket = null;
      notifyListeners({ type: 'ws.disconnected' });
      // Attempt reconnect if still authenticated
      const curToken = localStorage.getItem('vg_token');
      if (curToken) {
        setTimeout(() => connectSignaling(curToken), 4000);
      }
    };

    socket.onerror = (err) => {
      console.warn('[WS] Connection error:', err);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('[WS] Received event:', msg.type, msg);
        notifyListeners(msg);
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };
  } catch (err) {
    console.error('[WS] Failed to connect:', err);
  }
}

export function disconnectSignaling() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
