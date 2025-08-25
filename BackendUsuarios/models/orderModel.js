const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  color: { type: String },
  size: { type: String },
  quantity: { type: Number, default: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  sessionId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: { type: [itemSchema], required: true },
  status: { type: String, default: 'tentative' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
