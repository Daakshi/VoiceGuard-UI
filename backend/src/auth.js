// src/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '24h';

// Generate a signed JWT for a user object { id, email, name }
export function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.id,    // Used by Android's AuthInterceptor
      sub:     user.id,    // Standard JWT subject claim
      email:   user.email,
      name:    user.name,
      iss:     'voiceguard-api',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// Verify and decode a token string — throws if invalid
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Express middleware for protected routes
// Attaches req.userId on success
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' }
    });
  }

  const token = authHeader.substring(7);
  try {
    const claims = verifyToken(token);
    req.userId = claims.user_id || claims.sub;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
    });
  }
}
