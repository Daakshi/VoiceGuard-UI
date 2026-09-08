// src/server.js
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { initDatabase } from './db.js';
import { verifyToken, authMiddleware } from './auth.js';
import { registerSocket, unregisterSocket, sendToUser } from './hub.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { callsRouter } from './routes/calls.js';

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

// --- WebSocket Server (shares same HTTP server for port-sharing) ---
const wss = new WebSocketServer({ noServer: true });

// --- Global Middleware ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- REST Routes ---
app.get('/api/v1/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'VoiceGuard Node Backend',
    timestamp: new Date().toISOString()
  });
});

// Public routes (no auth required)
app.use('/api/v1/auth', authRouter);

// Protected routes (JWT required)
app.use('/api/v1/users', authMiddleware, usersRouter);
app.use('/api/v1/calls', authMiddleware, callsRouter);

// --- WebSocket Upgrade Handler ---
// Android's SignalingManager.kt sends: ws://<host>:8080/ws?token=<jwt>
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname !== '/ws') {
    socket.destroy();
    return;
  }

  // Android authenticates via ?token= query parameter
  // Browser's WebSocket API cannot send custom headers, so we use the same approach
  const token = url.searchParams.get('token');
  if (!token) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  try {
    const claims = verifyToken(token);
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.userId = claims.user_id || claims.sub;
      ws.userName = claims.name;
      wss.emit('connection', ws, req);
    });
  } catch (err) {
    console.log('[WS] Rejected connection — invalid token');
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  }
});

// --- WebSocket Connection Lifecycle ---
wss.on('connection', (ws) => {
  const userId = ws.userId;
  registerSocket(userId, ws);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      // SECURITY: always stamp sender_id from the authenticated session
      // Never trust the sender_id sent by the client
      msg.sender_id = userId;

      console.log(`[WS] Message from ${userId}: type=${msg.type}`);

      switch (msg.type) {
        // WebRTC signaling — forward to target peer
        case 'webrtc.offer':
        case 'webrtc.answer':
        case 'webrtc.ice_candidate':
          if (msg.receiver_id) {
            sendToUser(msg.receiver_id, msg);
          }
          break;

        default:
          // Unknown type — ignore silently
          break;
      }
    } catch (err) {
      console.error('[WS] Failed to parse message:', err);
    }
  });

  ws.on('close', () => {
    unregisterSocket(userId, ws);
  });

  ws.on('error', (err) => {
    console.error(`[WS] Error for user ${userId}:`, err);
    unregisterSocket(userId, ws);
  });
});

// --- Server Start ---
async function start() {
  try {
    await initDatabase();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 VoiceGuard Backend running on http://0.0.0.0:${PORT}`);
      console.log(`   REST API: http://localhost:${PORT}/api/v1/health`);
      console.log(`   WebSocket: ws://localhost:${PORT}/ws?token=<jwt>`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
