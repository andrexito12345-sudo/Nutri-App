const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta del archivo de base de datos
const dbPath = path.resolve(__dirname, 'nutriapp.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite:', dbPath);
    }
});

// Crear tablas necesarias
db.serialize(() => {
    // Tabla de la doctora (usuario admin)
    db.run(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    `);

    // Tabla de citas
    db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_name TEXT NOT NULL,
            patient_email TEXT,
            patient_phone TEXT,
            patient_id INTEGER,
            reason TEXT,
            appointment_datetime TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pendiente',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);

    // Tabla para contar visitas a la página
    db.run(`
        CREATE TABLE IF NOT EXISTS page_visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);

    // ============================================
    // TABLA DE CONSULTAS - SOAP PROFESIONAL COMPLETO
    // ============================================
    db.run(`
        CREATE TABLE IF NOT EXISTS consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            appointment_id INTEGER,
            consultation_date TEXT NOT NULL,

            -- ===== SUBJETIVO (S) =====
            subjective TEXT,
            symptoms TEXT,
            appetite TEXT,
            sleep_quality TEXT,
            stress_level TEXT,
            physical_activity TEXT,
            water_intake TEXT,
            bowel_habits TEXT,

            -- ===== OBJETIVO (O) - Antropometría =====
            weight REAL,
            height REAL,
            bmi REAL,
            waist REAL,
            hip REAL,
            waist_hip_ratio REAL,
            body_fat REAL,
            muscle_mass REAL,
            ideal_weight REAL,

            -- ===== OBJETIVO (O) - Signos Vitales =====
            blood_pressure TEXT,
            heart_rate INTEGER,
            temperature REAL,

            -- ===== OBJETIVO (O) - Datos Bioquímicos =====
            glucose REAL,
            hba1c REAL,
            cholesterol REAL,
            triglycerides REAL,
            hdl REAL,
            ldl REAL,
            hemoglobin REAL,
            albumin REAL,
            objective_notes TEXT,

            -- ===== ANÁLISIS (A) - Diagnóstico PES =====
            pes_problem TEXT,
            pes_etiology TEXT,
            pes_signs TEXT,
            diagnosis TEXT,
            assessment_notes TEXT,
            nutritional_status TEXT,
            risk_level TEXT,
            priority TEXT,

            -- ===== PLAN (P) =====
            treatment_plan TEXT,
            treatment_goals TEXT,
            calories_prescribed INTEGER,
            protein_prescribed REAL,
            carbs_prescribed REAL,
            fats_prescribed REAL,
            diet_type TEXT,
            supplements_recommended TEXT,
            education_provided TEXT,
            referrals TEXT,
            next_appointment TEXT,

            -- ===== METADATOS =====
            notes TEXT,
            created_by INTEGER,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),

            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (appointment_id) REFERENCES appointments(id)
        )
    `);

    // Tabla de mediciones adicionales
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
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (consultation_id) REFERENCES consultations(id)
        )
    `);

    // Tabla de notas de evolución
    db.run(`
        CREATE TABLE IF NOT EXISTS evolution_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            consultation_id INTEGER,
            note_date TEXT NOT NULL DEFAULT (datetime('now')),
            note_type TEXT DEFAULT 'Seguimiento',
            note TEXT NOT NULL,
            is_important INTEGER DEFAULT 0,
            created_by INTEGER,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (consultation_id) REFERENCES consultations(id)
        )
    `);

    console.log('✅ Todas las tablas verificadas/creadas correctamente');
});

module.exports = db;