const productModel = require("../models/productModel");

exports.getProducts = async (req, res) => {
  const { category } = req.query;

  try {
    const products = category
      ? await productModel.findByCategory(category)
      : await productModel.findAll();

    return res.json(products);
  } catch (err) {
    console.error("PRODUCTS ERROR:", err);
    return res.status(500).json({ error: "Failed to load products" });
  }
};
