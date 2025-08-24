// routes/session.js
const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Session = require("../models/sessionModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// POST /api/session
router.post("/", async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    const user = await User.findOne({ correo: usuario });

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const passwordValida = await bcrypt.compare(contraseña, user.contraseña);
    if (!passwordValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const sessionId = crypto.randomUUID();

    await Session.create({
      sessionId,
      userId: user._id,
    });

    res.json({ success: true, sessionId });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
