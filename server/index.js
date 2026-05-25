const cors = require('cors');
const express = require('express');
require('dotenv').config();

const { query } = require('./db');
const { router: authRouter } = require('./routes/auth');
const { router: academicRouter } = require('./routes/academic');

const app = express();
const port = Number(process.env.API_PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1 AS ok');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/academic', academicRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Error interno del servidor',
  });
});

app.listen(port, () => {
  console.log(`API academica escuchando en http://localhost:${port}`);
});
