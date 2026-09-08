// src/routes/calls.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db.js';
import { sendToUser } from '../hub.js';

export const callsRouter = express.Router();

// Helper: fetch call with caller and receiver user objects joined
async function getCallWithUsers(callId) {
  const result = await pool.query(
    `SELECT c.*,
            json_build_object('id', u1.id, 'name', u1.name, 'email', u1.email) AS caller,
            json_build_object('id', u2.id, 'name', u2.name, 'email', u2.email) AS receiver
     FROM calls c
     JOIN users u1 ON c.caller_id = u1.id
     JOIN users u2 ON c.receiver_id = u2.id
     WHERE c.id = $1`,
    [callId]
  );
  return result.rows[0] || null;
}

// POST /api/v1/calls — Initiate a call, dispatch call.incoming to receiver
callsRouter.post('/', async (req, res) => {
  const { receiver_id } = req.body;
  const caller_id = req.userId;

  if (!receiver_id || !receiver_id.trim()) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'receiver_id is required' } });
  }
  if (receiver_id === caller_id) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Cannot call yourself' } });
  }

  try {
    const callerRes   = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [caller_id]);
    const receiverRes = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [receiver_id]);

    if (receiverRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Receiver user not found' } });
    }

    const caller   = callerRes.rows[0];
    const receiver = receiverRes.rows[0];
    const callId   = uuidv4();
    const now      = new Date();

    await pool.query(
      `INSERT INTO calls (id, caller_id, receiver_id, status, started_at, created_at)
       VALUES ($1, $2, $3, 'RINGING', $4, $5)`,
      [callId, caller_id, receiver_id, now, now]
    );

    const call = {
      id: callId, caller_id, receiver_id, status: 'RINGING',
      started_at: now.toISOString(), created_at: now.toISOString(),
      duration: 0, caller, receiver
    };

    // Push real-time notification to receiver's phone AND web browser
    sendToUser(receiver_id, {
      type:        'call.incoming',
      call_id:     callId,
      sender_id:   caller_id,
      sender_name: caller.name,
      receiver_id
    });

    res.status(201).json({ success: true, call });

  } catch (err) {
    console.error('[Calls] CreateCall error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } });
  }
});

// GET /api/v1/calls — List calling history for the authenticated user
callsRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
              json_build_object('id', u1.id, 'name', u1.name, 'email', u1.email) AS caller,
              json_build_object('id', u2.id, 'name', u2.name, 'email', u2.email) AS receiver
       FROM calls c
       JOIN users u1 ON c.caller_id = u1.id
       JOIN users u2 ON c.receiver_id = u2.id
       WHERE c.caller_id = $1 OR c.receiver_id = $1
       ORDER BY c.created_at DESC`,
      [req.userId]
    );
    res.json({ success: true, calls: result.rows });

  } catch (err) {
    console.error('[Calls] ListCalls error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch call history' } });
  }
});

// GET /api/v1/calls/:id — Get a single call
callsRouter.get('/:id', async (req, res) => {
  try {
    const call = await getCallWithUsers(req.params.id);
    if (!call) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Call not found' } });
    if (call.caller_id !== req.userId && call.receiver_id !== req.userId) {
      return res.status(403).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Forbidden' } });
    }
    res.json({ success: true, call });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } });
  }
});

// POST /api/v1/calls/:id/accept — Receiver accepts, notifies caller
callsRouter.post('/:id/accept', async (req, res) => {
  const now = new Date();
  try {
    const result = await pool.query(
      `UPDATE calls
       SET status = 'ACCEPTED', answered_at = $1
       WHERE id = $2 AND receiver_id = $3 AND status = 'RINGING'
       RETURNING *`,
      [now, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Call not found, already answered, or you are not the receiver' } });
    }

    const call = result.rows[0];
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);

    // Notify caller — Android's CallViewModel handles this with TYPE_CALL_ACCEPTED
    sendToUser(call.caller_id, {
      type:        'call.accepted',
      call_id:     call.id,
      sender_id:   req.userId,
      sender_name: userRes.rows[0]?.name,
      receiver_id: call.caller_id
    });

    res.json({ success: true, call: { ...call, status: 'ACCEPTED', answered_at: now } });

  } catch (err) {
    console.error('[Calls] AcceptCall error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } });
  }
});

// POST /api/v1/calls/:id/reject — Receiver declines, notifies caller
callsRouter.post('/:id/reject', async (req, res) => {
  const now = new Date();
  try {
    const result = await pool.query(
      `UPDATE calls
       SET status = 'REJECTED', ended_at = $1
       WHERE id = $2 AND receiver_id = $3 AND status = 'RINGING'
       RETURNING *`,
      [now, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Call not found or already resolved' } });
    }

    const call = result.rows[0];
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);

    sendToUser(call.caller_id, {
      type:        'call.rejected',
      call_id:     call.id,
      sender_id:   req.userId,
      sender_name: userRes.rows[0]?.name,
      receiver_id: call.caller_id
    });

    res.json({ success: true, call: { ...call, status: 'REJECTED', ended_at: now } });

  } catch (err) {
    console.error('[Calls] RejectCall error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } });
  }
});

// POST /api/v1/calls/:id/end — Either party ends the call, notifies the other
callsRouter.post('/:id/end', async (req, res) => {
  const now = new Date();
  try {
    const callResult = await pool.query('SELECT * FROM calls WHERE id = $1', [req.params.id]);
    if (callResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Call not found' } });
    }

    const call = callResult.rows[0];

    // Only participants can end the call
    if (call.caller_id !== req.userId && call.receiver_id !== req.userId) {
      return res.status(403).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'You are not a participant of this call' } });
    }

    // Calculate duration since answered_at
    const duration = call.answered_at
      ? Math.round((now - new Date(call.answered_at)) / 1000)
      : 0;

    await pool.query(
      `UPDATE calls SET status = 'ENDED', ended_at = $1, duration = $2 WHERE id = $3`,
      [now, duration, call.id]
    );

    // Notify the other participant
    const peerId = call.caller_id === req.userId ? call.receiver_id : call.caller_id;
    sendToUser(peerId, {
      type:        'call.ended',
      call_id:     call.id,
      sender_id:   req.userId,
      receiver_id: peerId
    });

    res.json({
      success: true,
      call: { ...call, status: 'ENDED', ended_at: now, duration }
    });

  } catch (err) {
    console.error('[Calls] EndCall error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message } });
  }
});
