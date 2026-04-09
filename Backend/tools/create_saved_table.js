require("dotenv").config();
const pool = require("../config/db");

const create = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `);
    console.log("saved table created (or already exists)");
    process.exit(0);
  } catch (err) {
    console.error("create table error", err);
    process.exit(1);
  }
};

create();
