const express = require('express');
const { query } = require('../db');

const router = express.Router();

router.get('/estudiantes', async (_req, res, next) => {
  try {
    const estudiantes = await query(
      `SELECT id, nombre, curso, email, acudiente, acudiente_email AS acudienteEmail,
              presente = 1 AS presente, justificado = 1 AS justificado
       FROM estudiantes
       ORDER BY nombre`,
    );
    res.json(estudiantes);
  } catch (error) {
    next(error);
  }
});

router.post('/estudiantes', async (req, res, next) => {
  try {
    const { nombre, curso, email, acudiente, acudienteEmail } = req.body;
    const result = await query(
      `INSERT INTO estudiantes (nombre, curso, email, acudiente, acudiente_email, presente, justificado)
       VALUES (:nombre, :curso, :email, :acudiente, :acudienteEmail, 1, 0)`,
      {
        nombre,
        curso,
        email: String(email).trim().toLowerCase(),
        acudiente,
        acudienteEmail: String(acudienteEmail).trim().toLowerCase(),
      },
    );

    await query(
      `INSERT INTO notas (estudiante_id, materia, periodo, nota1, nota2, nota3, ultima_modificacion)
       SELECT :estudianteId, materia, periodo, 0, 0, 0, 0
       FROM materias_periodos`,
      { estudianteId: result.insertId },
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      curso,
      email: String(email).trim().toLowerCase(),
      acudiente,
      acudienteEmail: String(acudienteEmail).trim().toLowerCase(),
      presente: true,
      justificado: false,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/estudiantes/:id/curso', async (req, res, next) => {
  try {
    await query('UPDATE estudiantes SET curso = :curso WHERE id = :id', {
      id: Number(req.params.id),
      curso: req.body.curso,
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.patch('/estudiantes/:id/asistencia', async (req, res, next) => {
  try {
    await query('UPDATE estudiantes SET presente = :presente, justificado = :justificado WHERE id = :id', {
      id: Number(req.params.id),
      presente: req.body.presente ? 1 : 0,
      justificado: req.body.justificado ? 1 : 0,
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/estudiantes/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM estudiantes WHERE id = :id', { id: Number(req.params.id) });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get('/notas', async (_req, res, next) => {
  try {
    const notas = await query(
      `SELECT estudiante_id AS estudianteId, materia, periodo, nota1, nota2, nota3,
              ultima_modificacion AS ultimaModificacion
       FROM notas`,
    );
    res.json(notas);
  } catch (error) {
    next(error);
  }
});

router.patch('/notas', async (req, res, next) => {
  try {
    const { estudianteId, materia, periodo, campo, valor } = req.body;
    if (!['nota1', 'nota2', 'nota3'].includes(campo)) {
      return res.status(400).json({ message: 'Campo de nota invalido' });
    }

    const nota = Math.max(0, Math.min(5, Number(valor) || 0));
    await query(
      `UPDATE notas
       SET ${campo} = :nota, ultima_modificacion = :ultimaModificacion
       WHERE estudiante_id = :estudianteId AND materia = :materia AND periodo = :periodo`,
      {
        nota,
        ultimaModificacion: Date.now(),
        estudianteId,
        materia,
        periodo,
      },
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get('/comunicados', async (_req, res, next) => {
  try {
    const comunicados = await query(
      `SELECT id, titulo, mensaje, destinatario, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, tipo, autor
       FROM comunicados
       ORDER BY fecha DESC, id DESC`,
    );
    res.json(comunicados);
  } catch (error) {
    next(error);
  }
});

router.post('/comunicados', async (req, res, next) => {
  try {
    const { titulo, mensaje, destinatario, tipo, autor } = req.body;
    const fecha = new Date().toISOString().split('T')[0];
    const result = await query(
      `INSERT INTO comunicados (titulo, mensaje, destinatario, fecha, tipo, autor)
       VALUES (:titulo, :mensaje, :destinatario, :fecha, :tipo, :autor)`,
      { titulo, mensaje, destinatario, fecha, tipo, autor },
    );
    res.status(201).json({ id: result.insertId, titulo, mensaje, destinatario, fecha, tipo, autor });
  } catch (error) {
    next(error);
  }
});

module.exports = { router };
