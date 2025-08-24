const User = require('../models/userModel');

// Crear un nuevo usuario
const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al crear usuario', error });
  }
};

// Leer todos los usuarios
const readAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al leer usuarios:', error);
    res.status(500).json({ mensaje: 'Error al leer usuarios', error });
  }
};

// Leer un usuario por ID
const readUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error al leer usuario:', error);
    res.status(500).json({ mensaje: 'Error al leer usuario', error });
  }
};

// Actualizar usuario por ID
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error });
  }
};

// Eliminar usuario por ID
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error });
  }
};

module.exports = {
  createUser,
  readAllUsers,
  readUserById,
  updateUser,
  deleteUser,
};
