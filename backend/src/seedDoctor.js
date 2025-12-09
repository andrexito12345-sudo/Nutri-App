// ============================================================
// backend/src/seedDoctor.js
// ------------------------------------------------------------
// Este módulo se encarga de CREAR la cuenta de la doctora
// en la tabla `doctors` si todavía no existe.
//
// IMPORTANTE:
// - Ya NO hace `process.exit()` para no matar el servidor.
// - Exporta una función `seedDoctor()` que devuelve una Promise.
// - Se usa desde server.js al arrancar el backend.
// ============================================================

require('dotenv').config();          // Carga variables de entorno desde .env
const bcrypt = require('bcryptjs');  // Para encriptar la contraseña
const db = require('./db');          // Conexión a SQLite (y creación de tablas)

// ============================================================
// FUNCIÓN PRINCIPAL: seedDoctor()
// ------------------------------------------------------------
// - Lee DOCTOR_NAME, DOCTOR_EMAIL, DOCTOR_PASSWORD de las env vars.
// - Verifica si ya existe una doctora con ese email.
// - Si existe: solo muestra info en consola y termina.
// - Si no existe: inserta una nueva doctora con contraseña encriptada.
// - Devuelve una Promise para poder usar `await` desde server.js.
// ============================================================

function seedDoctor() {
    return new Promise((resolve, reject) => {
        // --------------------------------------------------------
        // 1. Leer configuración de la doctora desde variables de entorno
        // --------------------------------------------------------
        const name = process.env.DOCTOR_NAME || 'Dra. Nutricionista';
        const email = process.env.DOCTOR_EMAIL || 'nutri@example.com';
        const plainPassword = process.env.DOCTOR_PASSWORD || 'ClaveSegura123';

        // --------------------------------------------------------
        // 2. Validaciones básicas de email y password
        // --------------------------------------------------------
        if (!email || !plainPassword) {
            console.error('❌ Error: DOCTOR_EMAIL y DOCTOR_PASSWORD son requeridos en las variables de entorno');
            return reject(new Error('DOCTOR_EMAIL y DOCTOR_PASSWORD son requeridos'));
        }

        if (plainPassword.length < 8) {
            console.error('❌ Error: La contraseña debe tener al menos 8 caracteres');
            return reject(new Error('Contraseña demasiado corta'));
        }

        // --------------------------------------------------------
        // 3. Verificar si ya existe una doctora con ese email
        // --------------------------------------------------------
        db.get('SELECT * FROM doctors WHERE email = ?', [email], (err, row) => {
            if (err) {
                console.error('❌ Error al verificar doctora existente:', err);
                return reject(err);
            }

            if (row) {
                // Ya existe una doctora con ese email: no hacemos nada más
                console.log('⚠️  Ya existe una doctora con ese email:', email);
                console.log('📋 ID:', row.id);
                console.log('👤 Nombre:', row.name);
                console.log('ℹ️  seedDoctor() no creó una nueva cuenta porque esa doctora ya estaba registrada.');
                return resolve({
                    existed: true,
                    id: row.id,
                    email,
                });
            }

            // ------------------------------------------------------
            // 4. No existe doctora con ese email → crear una nueva
            // ------------------------------------------------------
            console.log('🔐 Encriptando contraseña...');

            // Encriptar la contraseña con bcrypt (salt = 10)
            bcrypt.hash(plainPassword, 10, (hashErr, hash) => {
                if (hashErr) {
                    console.error('❌ Error al encriptar la contraseña:', hashErr);
                    return reject(hashErr);
                }

                console.log('✅ Contraseña encriptada correctamente');
                console.log('💾 Insertando doctora en la base de datos...');

                // Insertar la nueva doctora en la tabla `doctors`
                db.run(
                    'INSERT INTO doctors (name, email, password_hash) VALUES (?, ?, ?)',
                    [name, email, hash],
                    function (insertErr) {
                        if (insertErr) {
                            console.error('❌ Error al insertar doctora:', insertErr.message);
                            return reject(insertErr);
                        }

                        // `this.lastID` es el ID autoincrement generado por SQLite
                        console.log('\n🎉 ¡Doctora creada exitosamente!\n');
                        console.log('═══════════════════════════════════════');
                        console.log('📋 ID:', this.lastID);
                        console.log('👤 Nombre:', name);
                        console.log('📧 Email:', email);
                        console.log('🔑 Contraseña (texto plano):', plainPassword);
                        console.log('═══════════════════════════════════════');
                        console.log('⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro.');
                        console.log('ℹ️  Puedes cambiar DOCTOR_EMAIL y DOCTOR_PASSWORD en las variables de entorno.');

                        return resolve({
                            created: true,
                            id: this.lastID,
                            email,
                        });
                    }
                );
            });
        });
    });
}

// ============================================================
// EXPORTAR LA FUNCIÓN
// ------------------------------------------------------------
// Exportamos `seedDoctor` para poder llamarla desde `server.js`
// usando:
//   const { seedDoctor } = require('./seedDoctor');
//   await seedDoctor();
// ============================================================

module.exports = { seedDoctor };
