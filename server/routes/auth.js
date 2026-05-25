const express = require('express');
const { query } = require('../db');
const { crearIniciales, createToken, hashPassword, publicUser } = require('../utils/auth');

const router = express.Router();
const roles = new Set(['docente', 'directivo', 'padre', 'estudiante']);

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contrasena son obligatorios' });
    }

    const users = await query(
      'SELECT id, nombre, email, rol, iniciales, password_hash FROM usuarios WHERE email = :email LIMIT 1',
      { email: String(email).trim().toLowerCase() },
    );

    const user = users[0];
    if (!user || user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const usuario = publicUser(user);
    res.json({ usuario, token: createToken(usuario) });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !roles.has(rol)) {
      return res.status(400).json({ message: 'Datos de registro incompletos' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await query('SELECT id FROM usuarios WHERE email = :email LIMIT 1', { email: cleanEmail });
    if (existing.length) {
      return res.status(409).json({ message: 'El correo ya esta registrado' });
    }

    const result = await query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, iniciales)
       VALUES (:nombre, :email, :passwordHash, :rol, :iniciales)`,
      {
        nombre: String(nombre).trim(),
        email: cleanEmail,
        passwordHash: hashPassword(password),
        rol,
        iniciales: crearIniciales(nombre),
      },
    );

    const usuario = {
      id: result.insertId,
      nombre: String(nombre).trim(),
      email: cleanEmail,
      rol,
      iniciales: crearIniciales(nombre),
    };

    res.status(201).json({ usuario, token: createToken(usuario) });
  } catch (error) {
    next(error);
  }
});

module.exports = { router };
