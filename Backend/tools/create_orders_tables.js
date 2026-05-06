require("dotenv").config();
const pool = require("../config/db");

const create = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total NUMERIC(10, 2) NOT NULL DEFAULT 0,
        status VARCHAR(40) NOT NULL DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        unit_price NUMERIC(10, 2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        line_total NUMERIC(10, 2) NOT NULL,
        size VARCHAR(20) NOT NULL DEFAULT 'Unspecified',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS size VARCHAR(20)
    `);

    await pool.query(`
      UPDATE order_items
      SET size = 'Unspecified'
      WHERE size IS NULL OR BTRIM(size) = ''
    `);

    await pool.query(`
      ALTER TABLE order_items
      ALTER COLUMN size SET DEFAULT 'Unspecified'
    `);

    await pool.query(`
      ALTER TABLE order_items
      ALTER COLUMN size SET NOT NULL
    `);

    console.log("orders and order_items tables created (or already exist)");
    process.exit(0);
  } catch (err) {
    console.error("create table error", err);
    process.exit(1);
  }
};

create();
