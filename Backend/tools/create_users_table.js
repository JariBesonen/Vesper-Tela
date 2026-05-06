require('dotenv').config();
const pool = require('../config/db');

const create = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL DEFAULT 'Customer',
        last_name VARCHAR(100) NOT NULL DEFAULT '',
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)
    `);

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)
    `);

    await pool.query(`
      UPDATE users
      SET first_name = COALESCE(NULLIF(BTRIM(first_name), ''), username)
      WHERE first_name IS NULL OR BTRIM(first_name) = ''
    `);

    await pool.query(`
      UPDATE users
      SET last_name = COALESCE(NULLIF(BTRIM(last_name), ''), '')
      WHERE last_name IS NULL
    `);

    await pool.query(`
      ALTER TABLE users
      ALTER COLUMN first_name SET DEFAULT 'Customer'
    `);

    await pool.query(`
      ALTER TABLE users
      ALTER COLUMN last_name SET DEFAULT ''
    `);

    await pool.query(`
      ALTER TABLE users
      ALTER COLUMN first_name SET NOT NULL
    `);

    await pool.query(`
      ALTER TABLE users
      ALTER COLUMN last_name SET NOT NULL
    `);

    console.log('users table created (or already exists)');
    process.exit(0);
  } catch (err) {
    console.error('create table error', err);
    process.exit(1);
  }
};

create();
