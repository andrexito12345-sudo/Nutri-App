// backend/seedDoctor.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

// ============================================================
// CONFIGURACIÓN DE LA DOCTORA (desde variables de entorno)
// ============================================================

const name = process.env.DOCTOR_NAME || 'Dra. Nutricionista';
const email = process.env.DOCTOR_EMAIL || 'nutri@example.com';
const plainPassword = process.env.DOCTOR_PASSWORD || 'ClaveSegura123';

// Validaciones básicas
if (!email || !plainPassword) {
    console.error('❌ Error: EMAIL y PASSWORD son requeridos en el archivo .env');
    process.exit(1);
}

if (plainPassword.length < 8) {
    console.error('❌ Error: La contraseña debe tener al menos 8 caracteres');
    process.exit(1);
}

// ============================================================
// VERIFICAR SI YA EXISTE LA DOCTORA
// ============================================================

db.get('SELECT * FROM doctors WHERE email = ?', [email], (err, row) => {
    if (err) {
        console.error('❌ Error al verificar doctora existente:', err);
        process.exit(1);
    }

    if (row) {
        console.log('⚠️  Ya existe una doctora con ese email:', email);
        console.log('📋 ID:', row.id);
        console.log('👤 Nombre:', row.name);
        console.log('\n🔄 Si deseas actualizar la contraseña, ejecuta: node updateDoctorPassword.js\n');
        process.exit(0);
    }

    // ============================================================
    // CREAR NUEVA DOCTORA
    // ============================================================

    console.log('🔐 Encriptando contraseña...');

    bcrypt.hash(plainPassword, 10, (hashErr, hash) => {
        if (hashErr) {
            console.error('❌ Error al encriptar la contraseña:', hashErr);
            process.exit(1);
        }

        console.log('✅ Contraseña encriptada correctamente');
        console.log('💾 Insertando doctora en la base de datos...');

        db.run(
            'INSERT INTO doctors (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hash],
            function (insertErr) {
                if (insertErr) {
                    console.error('❌ Error al insertar doctora:', insertErr.message);
                    process.exit(1);
                }

                console.log('\n🎉 ¡Doctora creada exitosamente!\n');
                console.log('═══════════════════════════════════════');
                console.log('📋 ID:', this.lastID);
                console.log('👤 Nombre:', name);
                console.log('📧 Email:', email);
                console.log('🔑 Contraseña:', plainPassword);
                console.log('═══════════════════════════════════════');
                console.log('\n⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro');
                console.log('🗑️  Considera eliminar este archivo después de usarlo\n');

                process.exit(0);
            }
        );
    });
});

// ============================================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================================

process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada:', reason);
    process.exit(1);
});