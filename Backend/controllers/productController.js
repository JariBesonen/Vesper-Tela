const db = require("../config/db");
const productModel = require("../models/productModel");

const normalizeGender = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "male") return "men";
  if (normalized === "female") return "women";
  if (normalized === "men" || normalized === "women") return normalized;
  return null;
};

exports.getProducts = async (req, res) => {
  const { gender, category } = req.query;

  // Backward compatibility: existing UI sends ?category=men|women.
  const inferredGender = normalizeGender(category);
  const requestedGender = normalizeGender(gender) || inferredGender;
  const requestedCategory = requestedGender && inferredGender ? null : category;

  try {
    const products = requestedGender
      ? await productModel.findByCategory(requestedGender, requestedCategory)
      : await productModel.findAll();

    return res.json(products);
  } catch (err) {
    console.error("PRODUCTS ERROR:", err);
    return res.status(500).json({ error: "Failed to load products" });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(product);
  } catch (err) {
    console.error("PRODUCT BY ID ERROR:", err);
    return res.status(500).json({ error: "Failed to load product" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, gender, category, image } = req.body;

    if (!name || price === undefined || !gender) {
      return res
        .status(400)
        .json({ error: "Name, price, and gender are required" });
    }

    const result = await db.query(
      "INSERT INTO products (name, price, gender, category, image) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, price, gender, category || null, image || null],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
