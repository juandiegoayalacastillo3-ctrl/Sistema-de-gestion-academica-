const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function crearIniciales(nombre) {
  return String(nombre)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(parte => parte.charAt(0).toUpperCase())
    .join('');
}

function createToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    rol: user.rol,
    exp: Date.now() + 1000 * 60 * 60 * 8,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function publicUser(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    rol: row.rol,
    iniciales: row.iniciales,
  };
}

module.exports = { hashPassword, crearIniciales, createToken, publicUser };
