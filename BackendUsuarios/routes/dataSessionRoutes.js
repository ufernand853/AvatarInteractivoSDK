// routes/dataSession.js
const express = require("express");
const router = express.Router();
const DataSession = require("../models/dataSessionModel");

router.post("/", async (req, res) => {
  const { sessionId, text } = req.body;

  if (!sessionId || !text) {
    return res.status(400).json({ error: "Faltan datos: sessionId o text" });
  }

  try {
    const record = new DataSession({ sessionId, text });
    await record.save();
    res.status(200).json({ message: "Registro guardado correctamente" });
  } catch (error) {
    console.error("Error al guardar dataSession:", error);
    res.status(500).json({ error: "Error al guardar el dato de sesión" });
  }
});

module.exports = router;
