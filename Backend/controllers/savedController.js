const savedModel = require("../models/savedModel");

exports.getSaved = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const products = await savedModel.getSavedProducts(userId);
    res.json(products);
  } catch (err) {
    console.error("GET SAVED ERROR:", err);
    res.status(500).json({ error: "Failed to load saved products" });
  }
};

exports.addSaved = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: "Product ID required" });
  }

  try {
    const added = await savedModel.addSavedProduct(userId, productId);
    if (added) {
      res.json({ message: "Product saved" });
    } else {
      res.status(409).json({ error: "Product already saved" });
    }
  } catch (err) {
    console.error("ADD SAVED ERROR:", err);
    res.status(500).json({ error: "Failed to save product" });
  }
};

exports.removeSaved = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { productId } = req.params;
  if (!productId) {
    return res.status(400).json({ error: "Product ID required" });
  }

  try {
    const removed = await savedModel.removeSavedProduct(userId, productId);
    if (removed) {
      res.json({ message: "Product removed from saved" });
    } else {
      res.status(404).json({ error: "Product not found in saved" });
    }
  } catch (err) {
    console.error("REMOVE SAVED ERROR:", err);
    res.status(500).json({ error: "Failed to remove product" });
  }
};
