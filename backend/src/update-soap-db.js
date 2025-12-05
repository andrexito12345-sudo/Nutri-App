const db = require('./db');

console.log('🚀 Iniciando actualización a formato SOAP...');

db.serialize(() => {
    // 1. Agregar columna 'subjective' a la tabla consultations
    db.run("ALTER TABLE consultations ADD COLUMN subjective TEXT", (err) => {
        if (err && err.message.includes('duplicate column')) {
            console.log('ℹ️ Columna subjective ya existe.');
        } else if (err) {
            console.error('❌ Error agregando subjective:', err.message);
        } else {
            console.log('✅ Columna subjective agregada a consultations.');
        }
    });

    // 2. Agregar columnas de peso actual a la tabla patients (para la lista de pacientes)
    db.run("ALTER TABLE patients ADD COLUMN current_weight REAL", (err) => {
        if (!err) console.log('✅ Columna current_weight agregada a patients.');
    });

    db.run("ALTER TABLE patients ADD COLUMN current_bmi REAL", (err) => {
        if (!err) console.log('✅ Columna current_bmi agregada a patients.');
    });

    db.run("ALTER TABLE patients ADD COLUMN last_consultation_date DATETIME", (err) => {
        if (!err) console.log('✅ Columna last_consultation_date agregada a patients.');
    });
});

setTimeout(() => {
    console.log('\n🏁 Actualización de BD completada.');
}, 1000);