// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    nombre: { type: String, required: true },
    direccion: { type: String },
    telefono: { type: String },
    prefijo: { type: String },
    pais: { type: String },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true }
});

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('contraseña')) {
        const salt = await bcrypt.genSalt();
        this.contraseña = await bcrypt.hash(this.contraseña, salt);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
