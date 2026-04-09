const pool = require("../config/db");

const normalizeCategory = (category) => {
  if (!category) return null;
  const normalized = category.trim().toLowerCase();

  if (normalized === "men" || normalized === "male") return "men";
  if (normalized === "women" || normalized === "female") return "women";
  return normalized;
};

exports.findByCategory = async (category) => {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) return [];

  const query = `SELECT id, name, price, gender FROM products WHERE LOWER(gender) = $1 ORDER BY name`;
  const result = await pool.query(query, [normalizedCategory]);
  return result.rows;
};

exports.findAll = async () => {
  const result = await pool.query(
    `SELECT id, name, price, gender FROM products ORDER BY name`,
  );
  return result.rows;
};
