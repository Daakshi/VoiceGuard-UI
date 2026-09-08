// src/routes/users.js
import express from 'express';
import { pool } from '../db.js';
import { isUserOnline } from '../hub.js';

export const usersRouter = express.Router();

// GET /api/v1/users/me — returns authenticated user's profile
usersRouter.get('/me', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at, updated_at, last_seen FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: { ...user, is_online: isUserOnline(user.id) }
    });

  } catch (err) {
    console.error('[Users] GetMe error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch user profile' }
    });
  }
});

// GET /api/v1/users — returns all other registered users with real-time online status
usersRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, created_at, updated_at, last_seen
       FROM users
       WHERE id != $1
       ORDER BY name ASC`,
      [req.userId]
    );

    const users = result.rows.map(u => ({
      ...u,
      is_online: isUserOnline(u.id)
    }));

    res.json({ success: true, users });

  } catch (err) {
    console.error('[Users] ListUsers error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch users' }
    });
  }
});
