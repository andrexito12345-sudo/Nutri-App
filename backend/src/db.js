// ============================================================
// backend/src/db.js
// ------------------------------------------------------------
// Módulo de conexión a SQLite para NutriVida Pro.
//
// - Abre (o crea) el archivo nutriapp.db.
// - Se asegura de que existan las tablas básicas:
//
//   - doctors
//   - appointments
//   - visits
//   - patients        ← NUEVA tabla que faltaba en Render
//   - consultations   (por si todavía no está creada)
//
// Con CREATE TABLE IF NOT EXISTS no se borran datos existentes.
// Simplemente crea la tabla si aún no existe.
// ============================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ------------------------------------------------------------
// Ruta del archivo de base de datos
// ------------------------------------------------------------
// Si quieres personalizarla en el futuro puedes usar una
// variable de entorno tipo DB_FILE, pero por ahora dejamos
// el comportamiento que ya tienes.
// ------------------------------------------------------------
const DB_FILE =
    process.env.DB_FILE ||
    path.join(__dirname, 'nutriapp.db');

// ------------------------------------------------------------
// Apertura de la base de datos
// ------------------------------------------------------------
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('❌ Error al conectar a SQLite:', err);
    } else {
        console.log('Conectado a la base de datos SQLite:', DB_FILE);
    }
});

// ------------------------------------------------------------
// Creación de tablas (si no existen)
// ------------------------------------------------------------
// IMPORTANTE: CREATE TABLE IF NOT EXISTS no modifica tablas
// que ya existen, solo las crea si faltan.
// ------------------------------------------------------------
db.serialize(() => {
    // ----------------------------------------------------------
    // Tabla de la doctora / usuarios (doctors)
    // ----------------------------------------------------------
    db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

    // ----------------------------------------------------------
    // Tabla de citas (appointments)
    // ----------------------------------------------------------
    // OJO: aquí no tocamos ninguna columna "rara", solo las que
    // usan tus rutas actuales. Si la tabla ya existe con más
    // columnas, no pasa nada.
    // ----------------------------------------------------------
    db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name TEXT NOT NULL,
      patient_email TEXT,
      patient_phone TEXT,
      reason TEXT,
      appointment_datetime TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendiente',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

    // ----------------------------------------------------------
    // Tabla de visitas (visits) para estadísticas de tráfico
    // ----------------------------------------------------------
    db.run(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visited_at TEXT NOT NULL DEFAULT (datetime('now')),
      source TEXT,
      user_agent TEXT
    )
  `);

    // ----------------------------------------------------------
    // Tabla de pacientes (patients)
    // ----------------------------------------------------------
    // Esta es la tabla que NO existía en Render y que está
    // rompiendo:
    //   - el LEFT JOIN de /api/appointments
    //   - las consultas de /api/patients
    //
    // La definimos con todas las columnas que usa tu
    // backend/src/routes/patients.js
    // ----------------------------------------------------------
    db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      birth_date TEXT,
      gender TEXT,
      occupation TEXT,
      address TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      blood_type TEXT,
      allergies TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);


    // ========================================================
    // NUEVA TABLA: page_visits
    // --------------------------------------------------------
    // - Guarda cada visita a la página (path y fecha/hora).
    // - El backend la usa en routes/visits.js para:
    //   - INSERT INTO page_visits ...
    //   - SELECT COUNT(*) y filtrar por created_at.
    // ========================================================
    db.run(`
        CREATE TABLE IF NOT EXISTS page_visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL,                -- ruta visitada (/doctora/dashboard, etc.)
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- fecha/hora de la visita
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creando tabla page_visits:', err);
        } else {
            console.log('✅ Tabla page_visits verificada/creada correctamente');
        }
    });

    // ----------------------------------------------------------
    // Tabla de consultas nutricionales (consultations)
    // ----------------------------------------------------------
    // La mayoría de tus consultas estadísticas usan:
    //   - patient_id
    //   - consultation_date
    //   - weight
    //   - bmi
    //
    // Si la tabla ya existía con más columnas, CREATE TABLE
    // IF NOT EXISTS no la toca. Si no existía, la crea vacía.
    // ----------------------------------------------------------
    db.run(`
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      consultation_date TEXT NOT NULL,
      weight REAL,
      bmi REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);
});

// ------------------------------------------------------------
// Exportamos la instancia de la base de datos
// ------------------------------------------------------------
module.exports = db;
