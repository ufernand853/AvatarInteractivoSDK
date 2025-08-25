const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");

// Create a tentative order
router.post("/", async (req, res) => {
  try {
    const { sessionId, userId, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }
    const order = new Order({ sessionId, userId, items });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Error creating order" });
  }
});

// Retrieve orders by sessionId
router.get("/:sessionId", async (req, res) => {
  try {
    const orders = await Order.find({ sessionId: req.params.sessionId });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

module.exports = router;
