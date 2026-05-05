const { createLogger, format, transports } = require("winston");

const { combine, timestamp, printf, colorize, errors } = format;

// Formato personalizado legible para consola
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `[${timestamp}] ${level}: ${message}`;

  // Mostrar metadata extra si existe (record, error, etc.)
  if (Object.keys(meta).length > 0) {
    log += `\n  → ${JSON.stringify(meta, null, 2)}`;
  }

  // Mostrar stack trace si hay error
  if (stack) {
    log += `\n${stack}`;
  }

  return log;
});

const logger = createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),      // Captura stack traces de errores
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    consoleFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize({ all: true }),  // Colores en consola según nivel
        errors({ stack: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        consoleFormat
      ),
    }),
  ],
});

module.exports = logger;
