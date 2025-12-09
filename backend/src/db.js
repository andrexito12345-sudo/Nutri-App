// ============================================================
// backend/src/db.js
// ------------------------------------------------------------
// Conexión y esquema SQLite para NutriVida Pro.
//
// - Abre (o crea) nutriapp.db
// - Crea tablas si no existen:
//     doctors, appointments, visits, patients, page_visits,
//     consultations
// - Asegura que la tabla consultations tenga las columnas
//     appointment_id, subjective, objective, assessment, plan
//   (usadas por el módulo de consultas / SOAP).
// ============================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ------------------------------------------------------------
// Ruta del archivo de base de datos
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
// Helper: asegurar que exista una columna en una tabla
// ------------------------------------------------------------
// columnDef: ej. "subjective TEXT" o "appointment_id INTEGER"
// ------------------------------------------------------------
function ensureColumn(tableName, columnDef) {
    const columnName = columnDef.split(/\s+/)[0]; // primera palabra

    db.all(`PRAGMA table_info(${tableName});`, (err, rows) => {
        if (err) {
            console.error(`❌ Error leyendo esquema de ${tableName}:`, err);
            return;
        }

        const exists = rows.some((col) => col.name === columnName);
        if (exists) {
            // Ya existe, nada que hacer
            // console.log(`↪ Columna ${tableName}.${columnName} ya existe, OK`);
            return;
        }

        const alterSQL = `ALTER TABLE ${tableName} ADD COLUMN ${columnDef}`;
        db.run(alterSQL, (alterErr) => {
            if (alterErr) {
                console.error(
                    `❌ Error añadiendo columna ${tableName}.${columnName}:`,
                    alterErr
                );
            } else {
                console.log(
                    `✅ Columna añadida: ${tableName}.${columnName} (${columnDef})`
                );
            }
        });
    });
}

// ------------------------------------------------------------
// Creación de tablas básicas (si no existen)
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
    // Tabla de visitas simples (visits)
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

    // ----------------------------------------------------------
    // Tabla de visitas de página (page_visits) para el contador
    // del dashboard (visitas hoy / totales).
    // ----------------------------------------------------------
    db.run(
        `
      CREATE TABLE IF NOT EXISTS page_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
        (err) => {
            if (err) {
                console.error('❌ Error creando tabla page_visits:', err);
            } else {
                console.log('✅ Tabla page_visits verificada/creada correctamente');
            }
        }
    );

    // ----------------------------------------------------------
    // Tabla de consultas nutricionales (consultations)
    // ----------------------------------------------------------
    // Definimos las columnas "mínimas" aquí; luego abajo
    // añadimos, si faltan, appointment_id y los campos SOAP.
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

    // ========================================================
    // MIGRACIONES: añadir columnas que puedan faltar
    // en la tabla consultations (sin borrar datos).
    // ========================================================
    // 1) Relación opcional con una cita
    ensureColumn('consultations', 'appointment_id INTEGER');

    // 2) Campos SOAP completos
    ensureColumn('consultations', 'subjective TEXT'); // S
    ensureColumn('consultations', 'objective TEXT');  // O
    ensureColumn('consultations', 'assessment TEXT'); // A
    ensureColumn('consultations', 'plan TEXT');       // P
});

// ------------------------------------------------------------
// Exportar instancia de la base de datos
// ------------------------------------------------------------
module.exports = db;
