const pool = require("../config/db");

exports.getSavedProducts = async (userId) => {
  const query = `
    SELECT p.id, p.name, p.price, p.gender, p.category, p.image
    FROM saved s
    JOIN products p ON s.product_id = p.id
    WHERE s.user_id = $1
    ORDER BY s.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

exports.addSavedProduct = async (userId, productId) => {
  const query = `
    INSERT INTO saved (user_id, product_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, product_id) DO NOTHING
    RETURNING id
  `;
  const result = await pool.query(query, [userId, productId]);
  return result.rows.length > 0;
};

exports.removeSavedProduct = async (userId, productId) => {
  const query = `DELETE FROM saved WHERE user_id = $1 AND product_id = $2`;
  const result = await pool.query(query, [userId, productId]);
  return result.rowCount > 0;
};
