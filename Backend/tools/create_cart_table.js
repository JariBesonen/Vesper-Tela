require("dotenv").config();
const pool = require("../config/db");

const create = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        size VARCHAR(20) NOT NULL DEFAULT 'Unspecified',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id, size)
      );
    `);

    await pool.query(`
      ALTER TABLE cart
      ADD COLUMN IF NOT EXISTS size VARCHAR(20)
    `);

    await pool.query(`
      UPDATE cart
      SET size = 'Unspecified'
      WHERE size IS NULL OR BTRIM(size) = ''
    `);

    await pool.query(`
      ALTER TABLE cart
      ALTER COLUMN size SET DEFAULT 'Unspecified'
    `);

    await pool.query(`
      ALTER TABLE cart
      ALTER COLUMN size SET NOT NULL
    `);

    await pool.query(`
      ALTER TABLE cart
      DROP CONSTRAINT IF EXISTS cart_user_id_product_id_key
    `);

    await pool.query(`
      ALTER TABLE cart
      DROP CONSTRAINT IF EXISTS cart_user_id_product_id_size_key
    `);

    await pool.query(`
      ALTER TABLE cart
      ADD CONSTRAINT cart_user_id_product_id_size_key
      UNIQUE (user_id, product_id, size)
    `);
    console.log("cart table created (or already exists)");
    process.exit(0);
  } catch (err) {
    console.error("create table error", err);
    process.exit(1);
  }
};

create();
