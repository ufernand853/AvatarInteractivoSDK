// models/dataSessionModel.js
const mongoose = require("mongoose");

const dataSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DataSession", dataSessionSchema);
