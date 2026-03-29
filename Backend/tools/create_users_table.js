require('dotenv').config();
const pool = require('../config/db');

const create = async () => {
  console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
  console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'undefined');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('users table created (or already exists)');
    process.exit(0);
  } catch (err) {
    console.error('create table error', err);
    process.exit(1);
  }
};

create();
