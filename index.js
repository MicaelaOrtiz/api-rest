const express = require("express");
const logger = require("./logger");

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware de logging por request
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    body: req.method === "POST" ? req.body : undefined,
  });
  next();
});

// Base de datos simulada en memoria
const db = [];

// ─────────────────────────────────────────────
// GET /status/200 — Respuesta exitosa
// ─────────────────────────────────────────────
app.get("/status/200", (req, res) => {
  try {
    logger.info("GET /status/200 — respuesta exitosa");
    res.status(200).json({ message: "hola mundo" });
  } catch (error) {
    logger.error("Error inesperado en GET /status/200", { error: error.message });
    res.status(500).json({ message: "internal server error" });
  }
});

// ─────────────────────────────────────────────
// GET /status/500 — Error interno simulado
// ─────────────────────────────────────────────
app.get("/status/500", (req, res) => {
  try {
    logger.error("GET /status/500 — internal server error simulado");
    res.status(500).json({ message: "internal server error" });
  } catch (error) {
    logger.error("Error inesperado en GET /status/500", { error: error.message });
    res.status(500).json({ message: "internal server error" });
  }
});

// ─────────────────────────────────────────────
// GET /status/429 — Too Many Requests simulado
// ─────────────────────────────────────────────
app.get("/status/429", (req, res) => {
  try {
    logger.warn("GET /status/429 — too many requests simulado");
    res.status(429).json({ message: "too many requests" });
  } catch (error) {
    logger.error("Error inesperado en GET /status/429", { error: error.message });
    res.status(500).json({ message: "internal server error" });
  }
});

// ─────────────────────────────────────────────
// POST /status/save — Guardar JSON en "DB"
// ─────────────────────────────────────────────
app.post("/status/save", (req, res) => {
  try {
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
      logger.warn("POST /status/save — body vacío o inválido");
      return res.status(400).json({ message: "El body no puede estar vacío" });
    }

    // 50% de probabilidad de fallo simulado en la DB
    const dbFails = Math.random() < 0.5;

    if (dbFails) {
      logger.error("POST /status/save — fallo simulado en la base de datos");
      return res.status(500).json({ message: "internal server error: fallo en la base de datos" });
    }

    const record = {
      id: db.length + 1,
      data: body,
      createdAt: new Date().toISOString(),
    };

    db.push(record);
    logger.info("POST /status/save — registro guardado exitosamente", { record });
    res.status(201).json({ message: "Registro guardado", record });
  } catch (error) {
    logger.error("Error inesperado en POST /status/save", { error: error.message });
    res.status(500).json({ message: "internal server error" });
  }
});

// ─────────────────────────────────────────────
// GET /status/save — Obtener todos los registros
// ─────────────────────────────────────────────
app.get("/status/save", (req, res) => {
  try {
    logger.info(`GET /status/save — devolviendo ${db.length} registro(s)`);
    res.status(200).json({ total: db.length, records: db });
  } catch (error) {
    logger.error("Error inesperado en GET /status/save", { error: error.message });
    res.status(500).json({ message: "internal server error" });
  }
});

// ─────────────────────────────────────────────
// Handler para rutas no encontradas (404)
// ─────────────────────────────────────────────
app.use((req, res) => {
  logger.warn(`Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Ruta no encontrada" });
});

// ─────────────────────────────────────────────
// Handler global de errores
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error("Error no manejado capturado por el middleware global", {
    error: err.message,
    stack: err.stack,
  });
  res.status(500).json({ message: "internal server error" });
});

// ─────────────────────────────────────────────
// Iniciar servidor
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Servidor iniciado en http://localhost:${PORT}`);
});

module.exports = app;
