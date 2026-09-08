// src/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db.js';
import { generateToken } from '../auth.js';
import { isUserOnline } from '../hub.js';

export const authRouter = express.Router();

// POST /api/v1/auth/register
authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validation (matches Go auth_service.go validation)
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'name cannot be empty' } });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'email cannot be empty' } });
  }
  if (!email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'invalid email address format' } });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'password must be at least 6 characters' } });
  }

  try {
    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10); // bcrypt DefaultCost = 10
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, created_at, updated_at`,
      [id, name.trim(), email.trim().toLowerCase(), hash]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: { ...user, is_online: true }
    });

  } catch (err) {
    if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email address already registered' }
      });
    }
    console.error('[Auth] Register error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Registration failed' }
    });
  }
});

// POST /api/v1/auth/login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'email and password are required' }
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, created_at, updated_at, last_seen FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    await pool.query('UPDATE users SET last_seen = NOW() WHERE id = $1', [user.id]);

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id:         user.id,
        name:       user.name,
        email:      user.email,
        is_online:  isUserOnline(user.id),
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_seen:  new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Login failed: ' + err.message }
    });
  }
});
