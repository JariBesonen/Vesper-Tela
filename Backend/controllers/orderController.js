const orderModel = require("../models/orderModel");

exports.checkout = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const order = await orderModel.createOrderFromCart(userId);
    if (!order) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    return res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    return res.status(500).json({ error: "Failed to place order" });
  }
};

exports.getHistory = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const orders = await orderModel.getOrderHistory(userId);
    return res.json(orders);
  } catch (err) {
    console.error("ORDER HISTORY ERROR:", err);
    return res.status(500).json({ error: "Failed to load order history" });
  }
};
