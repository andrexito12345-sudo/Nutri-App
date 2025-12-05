const db = require('./db');

console.log('🚀 Creando tablas de pacientes...\n');

db.serialize(() => {
    // Tabla de pacientes
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
        if (err) console.error('❌ Error en patients:', err.message);
        else console.log('✅ Tabla patients creada');
    });

    // Tabla de consultas
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
        if (err) console.error('❌ Error en consultations:', err.message);
        else console.log('✅ Tabla consultations creada');
    });

    // Tabla de mediciones
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
        if (err) console.error('❌ Error en measurements:', err.message);
        else console.log('✅ Tabla measurements creada');
    });

    // Tabla de notas de evolución
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
        if (err) console.error('❌ Error en evolution_notes:', err.message);
        else console.log('✅ Tabla evolution_notes creada');
    });
});

setTimeout(() => {
    console.log('\n🎉 ¡Tablas creadas correctamente!');
    process.exit(0);
}, 1000);