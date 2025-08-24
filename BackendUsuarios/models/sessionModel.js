// models/Session.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now, expires: '2h' }, // expira en 2 horas
});

module.exports = mongoose.model("Session", sessionSchema);
