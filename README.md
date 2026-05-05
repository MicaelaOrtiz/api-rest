# API REST con Express + Winston

API REST construida con **Node.js + Express** y sistema de logging con **Winston**.

---

##  Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor
npm start

# 3. (Opcional) Modo desarrollo con auto-reload
npm run dev
```

El servidor corre en: `http://localhost:3000`

---

##  Endpoints

### GET /status/200
Devuelve un mensaje exitoso con status 200.
```bash
curl http://localhost:3000/status/200
# {"message":"hola mundo"}
```

---

### GET /status/500
Devuelve un error interno simulado con status 500.
```bash
curl http://localhost:3000/status/500
# {"message":"internal server error"}
```

---

### GET /status/429
Devuelve un error de demasiadas solicitudes con status 429.
```bash
curl http://localhost:3000/status/429
# {"message":"too many requests"}
```

---

### POST /status/save
Recibe un JSON en el body y lo guarda en la base de datos en memoria.
> ⚠️ Tiene un **50% de probabilidad** de devolver error 500 (fallo de DB simulado).

```bash
curl -X POST http://localhost:3000/status/save \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan", "edad": 30}'

# Éxito (201):
# {"message":"Registro guardado","record":{"id":1,"data":{"nombre":"Juan","edad":30},"createdAt":"..."}}

# Error (500, 50% de chance):
# {"message":"internal server error: fallo en la base de datos"}
```

---

### GET /status/save
Devuelve todos los registros guardados en la base de datos simulada.
```bash
curl http://localhost:3000/status/save
# {"total":1,"records":[{"id":1,"data":{...},"createdAt":"..."}]}
```

---

##  Sistema de Logging (Winston)

Los logs se muestran en consola con el siguiente formato:

```
[YYYY-MM-DD HH:mm:ss] LEVEL: mensaje
  → { metadata opcional en JSON }
```

### Niveles de log usados:
| Nivel   | Color     | Cuándo se usa                        |
|---------|-----------|--------------------------------------|
| `info`  | 🟢 Verde  | Solicitudes exitosas, servidor listo |
| `warn`  | 🟡 Amarillo | Status 429, body vacío, ruta 404  |
| `error` | 🔴 Rojo   | Status 500, errores de DB, excepciones |

### Ejemplo de salida en consola:
```
[2026-04-25 10:30:00] info: Servidor iniciado en http://localhost:3000
[2026-04-25 10:30:05] info: Incoming request: POST /status/save
[2026-04-25 10:30:05] error: POST /status/save — fallo simulado en la base de datos
[2026-04-25 10:30:10] info: GET /status/save — devolviendo 0 registro(s)
```

---

##  Manejo de Excepciones (Bonus)

- Cada endpoint está envuelto en `try/catch` para capturar errores inesperados.
- Middleware global `(err, req, res, next)` captura cualquier error no manejado.
- Handler de rutas no encontradas devuelve `404`.
- Todos los errores son logueados con Winston antes de responder.
