const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware para procesar JSON
app.use(bodyParser.json());

// Conectar a SQLite (crea un archivo database.db si no existe)
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos", err.message);
  } else {
    console.log("Conectado a SQLite");
  }
});

// Crear la tabla si no existe
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  )`
);

// Rutas de la API

// Obtener todos los usuarios
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });
});

// Obtener un usuario por ID
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    row ? res.json(row) : res.status(404).json({ error: "Usuario no encontrado" });
  });
});

// Crear un nuevo usuario
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, name, email });
  });
});

// Actualizar un usuario por ID
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    this.changes > 0 ? res.json({ id, name, email }) : res.status(404).json({ error: "Usuario no encontrado" });
  });
});

// Eliminar un usuario por ID
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    this.changes > 0 ? res.json({ message: "Usuario eliminado" }) : res.status(404).json({ error: "Usuario no encontrado" });
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
