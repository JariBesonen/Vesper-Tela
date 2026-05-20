const pool = require("../config/db");
const MAX_CART_ITEM_QUANTITY = 3;

const normalizeSize = (value) => {
  const size = String(value || "").trim();
  return size || "Unspecified";
};

exports.getCartItems = async (userId) => {
  const query = `
    SELECT p.id, p.name, p.price, p.gender, p.category, p.image, c.quantity, c.size
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

exports.addToCart = async (userId, productId, quantity = 1, size) => {
  const numericQuantity = Number(quantity);
  const safeQuantity =
    Number.isInteger(numericQuantity) && numericQuantity > 0
      ? Math.min(numericQuantity, MAX_CART_ITEM_QUANTITY)
      : 1;
  const safeSize = normalizeSize(size);

  const query = `
    INSERT INTO cart (user_id, product_id, quantity, size)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, product_id, size)
    DO UPDATE SET quantity = LEAST($5, cart.quantity + EXCLUDED.quantity)
    RETURNING quantity, size
  `;
  const result = await pool.query(query, [
    userId,
    productId,
    safeQuantity,
    safeSize,
    MAX_CART_ITEM_QUANTITY,
  ]);
  return result.rows[0];
};

exports.removeFromCart = async (userId, productId, size) => {
  const safeSize = normalizeSize(size);
  const query = `
    DELETE FROM cart
    WHERE user_id = $1 AND product_id = $2 AND size = $3
  `;
  const result = await pool.query(query, [userId, productId, safeSize]);
  return result.rowCount > 0;
};
