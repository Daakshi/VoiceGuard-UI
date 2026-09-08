// src/hub.js
import { WebSocket } from 'ws';

// userId → Set<WebSocket>
// Supports multiple simultaneous devices per user account
const userSockets = new Map();

// Register a new WebSocket connection for a user
export function registerSocket(userId, ws) {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(ws);
  console.log(`[Hub] User ${userId} connected (devices: ${userSockets.get(userId).size})`);
}

// Remove a WebSocket connection when it closes
export function unregisterSocket(userId, ws) {
  const sockets = userSockets.get(userId);
  if (!sockets) return;

  sockets.delete(ws);
  if (sockets.size === 0) {
    userSockets.delete(userId);
  }
  console.log(`[Hub] User ${userId} device disconnected (remaining: ${userSockets.get(userId)?.size ?? 0})`);
}

// Check if a user has any active WebSocket connections
export function isUserOnline(userId) {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
}

// Send a JSON message to ALL active devices of a user
// Returns true if at least one message was delivered
export function sendToUser(userId, data) {
  const sockets = userSockets.get(userId);
  if (!sockets || sockets.size === 0) {
    console.log(`[Hub] User ${userId} is offline — message not delivered`);
    return false;
  }

  const payload = JSON.stringify(data);
  let sent = 0;
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
      sent++;
    }
  }
  console.log(`[Hub] Sent "${data.type}" to user ${userId} (${sent}/${sockets.size} devices)`);
  return sent > 0;
}
