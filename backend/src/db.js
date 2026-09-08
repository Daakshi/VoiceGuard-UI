// src/db.js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Single shared connection pool — reused across all requests
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,               // max simultaneous connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Called once on startup — creates tables if they don't exist
export async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('[DB] Connected to PostgreSQL. Verifying schema...');

    await client.query(`
      -- Users table: stores registered accounts
      CREATE TABLE IF NOT EXISTS users (
        id            VARCHAR(64)  PRIMARY KEY,
        name          VARCHAR(255) NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_seen     TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      -- Calls table: stores call session records
      CREATE TABLE IF NOT EXISTS calls (
        id          VARCHAR(64) PRIMARY KEY,
        caller_id   VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status      VARCHAR(32) NOT NULL DEFAULT 'RINGING',
        started_at  TIMESTAMP WITH TIME ZONE,
        answered_at TIMESTAMP WITH TIME ZONE,
        ended_at    TIMESTAMP WITH TIME ZONE,
        duration    INTEGER DEFAULT 0,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_calls_caller     ON calls(caller_id);
      CREATE INDEX IF NOT EXISTS idx_calls_receiver   ON calls(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
    `);

    console.log('[DB] Schema verified successfully.');
  } catch (err) {
    console.error('[DB] Schema migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
