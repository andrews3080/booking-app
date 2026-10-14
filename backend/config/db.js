// config/db.js
require('dotenv').config();
const { Pool } = require('pg');

// A pool reuses database connections instead of opening a new one per request
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Hosted databases (Neon, Render) need SSL in production; local Postgres doesn't
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
});

module.exports = pool;