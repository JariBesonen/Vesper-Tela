const pool = require("../config/db");

exports.getCartItems = async (userId) => {
  const query = `
    SELECT p.id, p.name, p.price, p.gender, c.quantity
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

exports.addToCart = async (userId, productId) => {
  const query = `
    INSERT INTO cart (user_id, product_id, quantity)
    VALUES ($1, $2, 1)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET quantity = cart.quantity + 1
    RETURNING quantity
  `;
  const result = await pool.query(query, [userId, productId]);
  return result.rows[0];
};

exports.removeFromCart = async (userId, productId) => {
  const query = `DELETE FROM cart WHERE user_id = $1 AND product_id = $2`;
  const result = await pool.query(query, [userId, productId]);
  return result.rowCount > 0;
};
