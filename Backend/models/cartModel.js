const pool = require("../config/db");

exports.getCartItems = async (userId) => {
  const query = `
    SELECT p.id, p.name, p.price, p.gender, p.category, p.image, c.quantity
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

exports.addToCart = async (userId, productId, quantity = 1) => {
  const numericQuantity = Number(quantity);
  const safeQuantity =
    Number.isInteger(numericQuantity) && numericQuantity > 0
      ? numericQuantity
      : 1;

  const query = `
    INSERT INTO cart (user_id, product_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
    RETURNING quantity
  `;
  const result = await pool.query(query, [userId, productId, safeQuantity]);
  return result.rows[0];
};

exports.removeFromCart = async (userId, productId) => {
  const query = `DELETE FROM cart WHERE user_id = $1 AND product_id = $2`;
  const result = await pool.query(query, [userId, productId]);
  return result.rowCount > 0;
};
