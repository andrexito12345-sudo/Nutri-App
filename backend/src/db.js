// ============================================================
// backend/src/db.js
// ------------------------------------------------------------
// Conexión y esquema SQLite para NutriVida Pro.
//
// - Abre (o crea) nutriapp.db
// - Crea tablas base si no existen:
//     doctors, appointments, visits, patients, page_visits
//     consultations (SOAP completo)
//     nutritional_calculations, measurements, evolution_notes
// - Hace una “migración” ligera: añade las columnas nuevas
//   que falten en tablas existentes (especialmente consultations)
//   usando ALTER TABLE.
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
        console.log('✅ Conectado a la base de datos SQLite:', DB_FILE);
    }
});

// ------------------------------------------------------------
// Helpers para migraciones suaves (añadir columnas si faltan)
// ------------------------------------------------------------
function ensureColumnExists(table, column, definition) {
    db.all(`PRAGMA table_info(${table})`, (err, columns) => {
        if (err) {
            console.error(`❌ Error leyendo esquema de ${table}:`, err);
            return;
        }

        const exists = columns.some((col) => col.name === column);
        if (exists) {
            console.log(`ℹ️ Columna ${column} ya existe en ${table}, no se altera la tabla.`);
            return;
        }
    });
}

// ------------------------------------------------------------
// Creación de tablas (si no existen) + migraciones
// ------------------------------------------------------------
db.serialize(() => {
    // ==========================
    // Tabla doctors
    // ==========================
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

    // ==========================
    // Tabla appointments
    // ==========================
    db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
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

    // ==========================
    // Tabla visits (estadísticas)
    // ==========================
    db.run(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visited_at TEXT NOT NULL DEFAULT (datetime('now')),
      source TEXT,
      user_agent TEXT
    )
  `);

    // ==========================
    // Tabla patients
    // ==========================
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
      -- Campos para último estado antropométrico
      current_weight REAL,
      current_bmi REAL,
      last_consultation_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

    // Migración defensiva por si patients ya existía sin estos campos
    ensureColumnExists('patients', 'current_weight', 'REAL');
    ensureColumnExists('patients', 'current_bmi', 'REAL');
    ensureColumnExists('patients', 'last_consultation_date', 'TEXT');


    // Asegurar columnas extra en consultations para composición corporal
    //ensureColumnExists('consultations', 'body_fat', 'REAL');             // si la usas
    //ensureColumnExists('consultations', 'body_fat_percentage', 'REAL');  // % grasa
    //ensureColumnExists('consultations', 'muscle_mass', 'REAL');          // masa muscular

    // Migraciones ligeras
    //ensureColumn('consultations', 'body_fat_percentage', 'REAL');


    // ==========================
    // Tabla page_visits (tráfico)
    // ==========================
    db.run(`
    CREATE TABLE IF NOT EXISTS page_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
        if (err) {
            console.error('❌ Error creando tabla page_visits:', err);
        } else {
            console.log('✅ Tabla page_visits verificada/creada');
        }
    });

    // ==========================
    // Tabla consultations (SOAP completo)
    // ==========================
    db.run(`
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      appointment_id INTEGER,
      consultation_date TEXT NOT NULL,

      -- Subjetivo
      subjective TEXT,
      symptoms TEXT,
      appetite TEXT,
      sleep_quality TEXT,
      stress_level TEXT,
      physical_activity TEXT,
      water_intake TEXT,
      bowel_habits TEXT,

      -- Objetivo antropometría
      weight REAL,
      height REAL,
      bmi REAL,
      waist REAL,
      hip REAL,
      waist_hip_ratio REAL,
      body_fat REAL,
      body_fat_percentage REAL,
      muscle_mass REAL,
      ideal_weight REAL,

      -- Signos vitales
      blood_pressure TEXT,
      heart_rate INTEGER,
      temperature REAL,

      -- Bioquímicos
      glucose REAL,
      hba1c REAL,
      cholesterol REAL,
      triglycerides REAL,
      hdl REAL,
      ldl REAL,
      hemoglobin REAL,
      albumin REAL,
      objective_notes TEXT,

      -- Análisis (PES)
      pes_problem TEXT,
      pes_etiology TEXT,
      pes_signs TEXT,
      diagnosis TEXT,
      assessment_notes TEXT,
      nutritional_status TEXT,
      risk_level TEXT,
      priority TEXT,

      -- Plan
      treatment_plan TEXT,
      treatment_goals TEXT,
      calories_prescribed REAL,
      protein_prescribed REAL,
      carbs_prescribed REAL,
      fats_prescribed REAL,
      diet_type TEXT,
      supplements_recommended TEXT,
      education_provided TEXT,
      referrals TEXT,
      next_appointment TEXT,

      -- Metadatos
      notes TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

    // ------- Migración de columnas faltantes en consultations ------
    const consultationColumns = [
        ['appointment_id', 'INTEGER'],
        ['consultation_date', 'TEXT'],

        // Subjetivo
        ['subjective', 'TEXT'],
        ['symptoms', 'TEXT'],
        ['appetite', 'TEXT'],
        ['sleep_quality', 'TEXT'],
        ['stress_level', 'TEXT'],
        ['physical_activity', 'TEXT'],
        ['water_intake', 'TEXT'],
        ['bowel_habits', 'TEXT'],

        // Antropometría
        ['weight', 'REAL'],
        ['height', 'REAL'],
        ['bmi', 'REAL'],
        ['waist', 'REAL'],
        ['hip', 'REAL'],
        ['waist_hip_ratio', 'REAL'],
        ['body_fat', 'REAL'],
        ['muscle_mass', 'REAL'],
        ['ideal_weight', 'REAL'],

        // Signos vitales
        ['blood_pressure', 'TEXT'],
        ['heart_rate', 'INTEGER'],
        ['temperature', 'REAL'],

        // Bioquímicos
        ['glucose', 'REAL'],
        ['hba1c', 'REAL'],
        ['cholesterol', 'REAL'],
        ['triglycerides', 'REAL'],
        ['hdl', 'REAL'],
        ['ldl', 'REAL'],
        ['hemoglobin', 'REAL'],
        ['albumin', 'REAL'],
        ['objective_notes', 'TEXT'],

        // Análisis
        ['pes_problem', 'TEXT'],
        ['pes_etiology', 'TEXT'],
        ['pes_signs', 'TEXT'],
        ['diagnosis', 'TEXT'],
        ['assessment_notes', 'TEXT'],
        ['nutritional_status', 'TEXT'],
        ['risk_level', 'TEXT'],
        ['priority', 'TEXT'],

        // Plan
        ['treatment_plan', 'TEXT'],
        ['treatment_goals', 'TEXT'],
        ['calories_prescribed', 'REAL'],
        ['protein_prescribed', 'REAL'],
        ['carbs_prescribed', 'REAL'],
        ['fats_prescribed', 'REAL'],
        ['diet_type', 'TEXT'],
        ['supplements_recommended', 'TEXT'],
        ['education_provided', 'TEXT'],
        ['referrals', 'TEXT'],
        ['next_appointment', 'TEXT'],

        // Metadatos (por si algún entorno viejo no los tiene)
        ['notes', 'TEXT'],
        ['created_by', 'TEXT'],
        ['created_at', "TEXT DEFAULT (datetime('now'))"],
        ['updated_at', "TEXT DEFAULT (datetime('now'))"]
    ];

    consultationColumns.forEach(([name, def]) => {
        ensureColumnExists('consultations', name, def);
    });

    // ==========================
    // Tabla nutritional_calculations
    // ==========================
    db.run(`
    CREATE TABLE IF NOT EXISTS nutritional_calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      consultation_id INTEGER,
      calculation_date TEXT NOT NULL,

      weight REAL,
      height REAL,
      age INTEGER,
      gender TEXT,

      formula_used TEXT,
      activity_level TEXT,
      stress_factor TEXT,
      goal TEXT,
      condition TEXT,

      tmb_value REAL,
      get_value REAL,
      calories_prescribed REAL,

      protein_grams REAL,
      carbs_grams REAL,
      fats_grams REAL,

      distribution_strategy TEXT,
      meal_distribution TEXT, -- JSON string

      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (consultation_id) REFERENCES consultations(id)
    )
  `);

    // ==========================
    // Tabla measurements (mediciones corporales)
    // ==========================
    db.run(`
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      consultation_id INTEGER,
      measurement_date TEXT NOT NULL,

      chest REAL,
      arm_left REAL,
      arm_right REAL,
      forearm_left REAL,
      forearm_right REAL,
      thigh_left REAL,
      thigh_right REAL,
      calf_left REAL,
      calf_right REAL,

      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (consultation_id) REFERENCES consultations(id)
    )
  `);

    // ==========================
    // Tabla evolution_notes (notas de evolución)
    // ==========================
    db.run(`
    CREATE TABLE IF NOT EXISTS evolution_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      consultation_id INTEGER NOT NULL,
      note_date TEXT NOT NULL,
      note_type TEXT,
      note TEXT NOT NULL,
      is_important INTEGER DEFAULT 0,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),

      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (consultation_id) REFERENCES consultations(id)
    )
  `);
});

// ------------------------------------------------------------
// Helper de migraciones simples: agrega columna si no existe
// ------------------------------------------------------------
function ensureColumnExists(table, column, definition) {
    db.all(`PRAGMA table_info(${table})`, (err, columns) => {
        if (err) {
            console.error(`❌ Error leyendo esquema de ${table}:`, err);
            return;
        }

        const exists = columns.some(col => col.name === column);

        if (exists) {
            console.log(`ℹ️ Columna ${column} ya existe en ${table}, no se altera la tabla.`);
            return;
        }

        const alterSQL = `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`;
        db.run(alterSQL, (err) => {
            if (err) {
                console.error(`❌ Error agregando columna ${column} en ${table}:`, err);
            } else {
                console.log(`✅ Columna ${column} agregada a ${table} (${definition}).`);
            }
        });
    });
}


// ------------------------------------------------------------
// Exportar instancia de la base de datos
// ------------------------------------------------------------
module.exports = db;
