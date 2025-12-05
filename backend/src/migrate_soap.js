/**
 * SCRIPT DE MIGRACIÓN - SOAP PROFESIONAL
 * Ejecutar UNA VEZ para agregar las columnas nuevas a la BD existente
 *
 * Uso: node migrate_soap.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'nutriapp.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Iniciando migración de la base de datos...\n');

// Columnas nuevas a agregar
const newColumns = [
    // Subjetivo
    { name: 'symptoms', type: 'TEXT' },
    { name: 'appetite', type: 'TEXT' },
    { name: 'sleep_quality', type: 'TEXT' },
    { name: 'stress_level', type: 'TEXT' },
    { name: 'physical_activity', type: 'TEXT' },
    { name: 'water_intake', type: 'TEXT' },
    { name: 'bowel_habits', type: 'TEXT' },

    // Objetivo - Antropometría
    { name: 'waist_hip_ratio', type: 'REAL' },
    { name: 'body_fat', type: 'REAL' },
    { name: 'ideal_weight', type: 'REAL' },

    // Objetivo - Signos Vitales
    { name: 'blood_pressure', type: 'TEXT' },
    { name: 'temperature', type: 'REAL' },

    // Objetivo - Bioquímicos
    { name: 'glucose', type: 'REAL' },
    { name: 'hba1c', type: 'REAL' },
    { name: 'cholesterol', type: 'REAL' },
    { name: 'triglycerides', type: 'REAL' },
    { name: 'hdl', type: 'REAL' },
    { name: 'ldl', type: 'REAL' },
    { name: 'hemoglobin', type: 'REAL' },
    { name: 'albumin', type: 'REAL' },
    { name: 'objective_notes', type: 'TEXT' },

    // Análisis - PES
    { name: 'pes_problem', type: 'TEXT' },
    { name: 'pes_etiology', type: 'TEXT' },
    { name: 'pes_signs', type: 'TEXT' },
    { name: 'assessment_notes', type: 'TEXT' },
    { name: 'nutritional_status', type: 'TEXT' },
    { name: 'risk_level', type: 'TEXT' },
    { name: 'priority', type: 'TEXT' },

    // Plan
    { name: 'treatment_goals', type: 'TEXT' },
    { name: 'calories_prescribed', type: 'INTEGER' },
    { name: 'protein_prescribed', type: 'REAL' },
    { name: 'carbs_prescribed', type: 'REAL' },
    { name: 'fats_prescribed', type: 'REAL' },
    { name: 'diet_type', type: 'TEXT' },
    { name: 'supplements_recommended', type: 'TEXT' },
    { name: 'education_provided', type: 'TEXT' },
    { name: 'referrals', type: 'TEXT' },
    { name: 'next_appointment', type: 'TEXT' }
];

// Función para verificar si una columna existe
const columnExists = (tableName, columnName) => {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
            if (err) reject(err);
            else {
                const exists = rows && rows.some(row => row.name === columnName);
                resolve(exists);
            }
        });
    });
};

// Función para agregar una columna
const addColumn = (tableName, columnName, columnType) => {
    return new Promise((resolve, reject) => {
        const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`;
        db.run(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Función para crear la tabla si no existe
const createTableIfNotExists = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS consultations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                appointment_id INTEGER,
                consultation_date TEXT NOT NULL,
                subjective TEXT,
                weight REAL,
                height REAL,
                bmi REAL,
                waist REAL,
                hip REAL,
                muscle_mass REAL,
                heart_rate INTEGER,
                diagnosis TEXT,
                treatment_plan TEXT,
                notes TEXT,
                created_by INTEGER,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        `;
        db.run(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Crear tablas auxiliares
const createAuxiliaryTables = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS measurements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER NOT NULL,
                    consultation_id INTEGER,
                    measurement_date TEXT NOT NULL,
                    chest REAL, arm_left REAL, arm_right REAL,
                    forearm_left REAL, forearm_right REAL,
                    thigh_left REAL, thigh_right REAL,
                    calf_left REAL, calf_right REAL,
                    notes TEXT,
                    created_at TEXT NOT NULL DEFAULT (datetime('now'))
                )
            `);

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
                    created_at TEXT NOT NULL DEFAULT (datetime('now'))
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};

// Ejecutar migración
const runMigration = async () => {
    try {
        // 1. Crear tabla si no existe
        console.log('📋 Verificando tabla consultations...');
        await createTableIfNotExists();
        console.log('   ✅ Tabla consultations verificada\n');

        // 2. Agregar columnas nuevas
        console.log('📊 Agregando columnas nuevas...\n');
        let added = 0;
        let skipped = 0;

        for (const col of newColumns) {
            const exists = await columnExists('consultations', col.name);
            if (!exists) {
                await addColumn('consultations', col.name, col.type);
                console.log(`   ✅ Columna '${col.name}' agregada`);
                added++;
            } else {
                skipped++;
            }
        }

        console.log(`\n   📈 Resumen: ${added} columnas agregadas, ${skipped} ya existían`);

        // 3. Crear tablas auxiliares
        console.log('\n📋 Verificando tablas auxiliares...');
        await createAuxiliaryTables();
        console.log('   ✅ Tablas measurements y evolution_notes verificadas');

        console.log('\n✨ ¡Migración completada exitosamente!\n');

    } catch (error) {
        console.error('\n❌ Error durante la migración:', error.message);
    } finally {
        db.close();
    }
};

runMigration();