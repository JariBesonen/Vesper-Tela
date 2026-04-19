const pool = require("../config/db");

const normalizeGender = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "male") return "men";
  if (normalized === "female") return "women";
  if (normalized === "men" || normalized === "women") return normalized;
  return null;
};

const normalizeProductCategory = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (["shirts", "pants", "shoes"].includes(normalized)) return normalized;
  return null;
};

const mapLegacyRows = (rows) =>
  rows.map((row) => ({
    ...row,
    category: row.category || null,
    image: row.image || null,
  }));

const safeQueryWithOptionalColumns = async (
  queryWithColumns,
  fallbackQuery,
  params,
) => {
  try {
    const result = await pool.query(queryWithColumns, params);
    return result.rows;
  } catch (error) {
    if (error && error.code === "42703") {
      const fallback = await pool.query(fallbackQuery, params);
      return mapLegacyRows(fallback.rows);
    }
    throw error;
  }
};

exports.findByCategory = async (gender, category = null) => {
  const normalizedGender = normalizeGender(gender);
  if (!normalizedGender) return [];

  const normalizedCategory = normalizeProductCategory(category);
  const params = [normalizedGender];

  let query =
    "SELECT id, name, price, gender, category, image FROM products WHERE LOWER(gender) = $1";
  let fallbackQuery =
    "SELECT id, name, price, gender FROM products WHERE LOWER(gender) = $1";

  if (normalizedCategory) {
    query += " AND LOWER(category) = $2";
    // If the products table is still on the legacy schema (no category column),
    // do not return all products for a category-filtered request.
    fallbackQuery += " AND $2 = '__missing_category_column__'";
    params.push(normalizedCategory);
  }

  query += " ORDER BY name";
  fallbackQuery += " ORDER BY name";

  return safeQueryWithOptionalColumns(query, fallbackQuery, params);
};

exports.findAll = async () => {
  const query =
    "SELECT id, name, price, gender, category, image FROM products ORDER BY name";
  const fallbackQuery =
    "SELECT id, name, price, gender FROM products ORDER BY name";
  return safeQueryWithOptionalColumns(query, fallbackQuery, []);
};
