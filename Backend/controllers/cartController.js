const cartModel = require("../models/cartModel");

exports.getCart = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const cartItems = await cartModel.getCartItems(userId);
    res.json(cartItems);
  } catch (err) {
    console.error("GET CART ERROR:", err);
    res.status(500).json({ error: "Failed to load cart" });
  }
};

exports.addCart = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { productId, quantity, size } = req.body;
  if (!productId) {
    return res.status(400).json({ error: "Product ID required" });
  }

  try {
    const result = await cartModel.addToCart(userId, productId, quantity, size);
    res.json({
      message: "Product added to cart",
      quantity: result.quantity,
      size: result.size,
    });
  } catch (err) {
    console.error("ADD CART ERROR:", err);
    res.status(500).json({ error: "Failed to add product to cart" });
  }
};

exports.removeCart = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { productId } = req.params;
  const { size } = req.query;
  if (!productId) {
    return res.status(400).json({ error: "Product ID required" });
  }

  try {
    const removed = await cartModel.removeFromCart(userId, productId, size);
    if (removed) {
      res.json({ message: "Product removed from cart" });
    } else {
      res.status(404).json({ error: "Product not found in cart" });
    }
  } catch (err) {
    console.error("REMOVE CART ERROR:", err);
    res.status(500).json({ error: "Failed to remove product from cart" });
  }
};
