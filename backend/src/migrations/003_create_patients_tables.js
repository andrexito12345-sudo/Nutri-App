/**
 * Migración 003: Crear tablas para Historial Médico
 * - Pacientes
 * - Consultas
 * - Mediciones
 * - Notas de evolución
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

function runMigration() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error al conectar a la base de datos:', err);
            return;
        }
        console.log('📦 Conectado a la base de datos');
    });

    db.serialize(() => {
        console.log('🚀 Iniciando migración 003: Tablas de Historial Médico...\n');

        // 1. TABLA DE PACIENTES (extendida)
        db.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        birth_date DATE,
        gender TEXT CHECK(gender IN ('Masculino', 'Femenino', 'Otro')),
        occupation TEXT,
        address TEXT,
        emergency_contact TEXT,
        emergency_phone TEXT,
        blood_type TEXT,
        allergies TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
            if (err) {
                console.error('❌ Error al crear tabla patients:', err);
            } else {
                console.log('✅ Tabla patients creada');
            }
        });

        // 2. TABLA DE CONSULTAS/VISITAS
        db.run(`
      CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        appointment_id INTEGER,
        consultation_date DATETIME NOT NULL,
        weight REAL,
        height REAL,
        bmi REAL,
        body_fat_percentage REAL,
        muscle_mass REAL,
        waist REAL,
        hip REAL,
        systolic_pressure INTEGER,
        diastolic_pressure INTEGER,
        heart_rate INTEGER,
        diagnosis TEXT,
        treatment_plan TEXT,
        notes TEXT,
        next_consultation_date DATE,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
      )
    `, (err) => {
            if (err) {
                console.error('❌ Error al crear tabla consultations:', err);
            } else {
                console.log('✅ Tabla consultations creada');
            }
        });

        // 3. TABLA DE MEDICIONES ADICIONALES (opcional, más detalladas)
        db.run(`
      CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        consultation_id INTEGER NOT NULL,
        measurement_date DATETIME NOT NULL,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
      )
    `, (err) => {
            if (err) {
                console.error('❌ Error al crear tabla measurements:', err);
            } else {
                console.log('✅ Tabla measurements creada');
            }
        });

        // 4. TABLA DE NOTAS DE EVOLUCIÓN
        db.run(`
      CREATE TABLE IF NOT EXISTS evolution_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        consultation_id INTEGER,
        note_date DATETIME NOT NULL,
        note_type TEXT CHECK(note_type IN ('Seguimiento', 'Observación', 'Alerta', 'Progreso')) DEFAULT 'Seguimiento',
        note TEXT NOT NULL,
        is_important BOOLEAN DEFAULT 0,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL
      )
    `, (err) => {
            if (err) {
                console.error('❌ Error al crear tabla evolution_notes:', err);
            } else {
                console.log('✅ Tabla evolution_notes creada');
            }
        });

        // 5. AGREGAR COLUMNA patient_id A appointments (si no existe)
        db.run(`
      ALTER TABLE appointments ADD COLUMN patient_id INTEGER REFERENCES patients(id)
    `, (err) => {
            if (err) {
                // Es normal que falle si la columna ya existe
                console.log('⚠️  Columna patient_id ya existe en appointments (normal si ya se ejecutó antes)');
            } else {
                console.log('✅ Columna patient_id agregada a appointments');
            }
        });

        // 6. CREAR ÍNDICES para mejorar rendimiento
        console.log('\n📊 Creando índices...');

        db.run(`CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email)`, (err) => {
            if (!err) console.log('✅ Índice idx_patients_email creado');
        });

        db.run(`CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone)`, (err) => {
            if (!err) console.log('✅ Índice idx_patients_phone creado');
        });

        db.run(`CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id)`, (err) => {
            if (!err) console.log('✅ Índice idx_consultations_patient creado');
        });

        db.run(`CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date)`, (err) => {
            if (!err) console.log('✅ Índice idx_consultations_date creado');
        });

        db.run(`CREATE INDEX IF NOT EXISTS idx_evolution_notes_patient ON evolution_notes(patient_id)`, (err) => {
            if (!err) console.log('✅ Índice idx_evolution_notes_patient creado');
        });

        db.run(`CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id)`, (err) => {
            if (!err) console.log('✅ Índice idx_appointments_patient creado');
        });

        console.log('\n🎉 Migración 003 completada exitosamente!\n');
    });

    db.close((err) => {
        if (err) {
            console.error('❌ Error al cerrar la base de datos:', err);
        } else {
            console.log('📦 Base de datos cerrada');
        }
    });
}

// Ejecutar migración
if (require.main === module) {
    runMigration();
}

module.exports = runMigration;