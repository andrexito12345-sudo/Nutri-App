// ============================================================
// backend/src/seedDoctor.js  (VERSIÓN PostgreSQL)
// ------------------------------------------------------------
// Crea la cuenta de la doctora en la tabla `doctors` de PG
// si todavía no existe.
// ============================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pg = require('./pgClient');   // ← ahora usamos PostgreSQL

// ------------------------------------------------------------
// seedDoctor(): crea la doctora en PG si no existe
// ------------------------------------------------------------
async function seedDoctor() {
    try {
        const name = process.env.DOCTOR_NAME || 'Dra. Nutricionista';
        const email = process.env.DOCTOR_EMAIL || 'nutri@example.com';
        const plainPassword =
            process.env.DOCTOR_PASSWORD || 'ClaveSegura123';

        if (!email || !plainPassword) {
            console.error(
                '❌ DOCTOR_EMAIL y DOCTOR_PASSWORD son requeridos en .env'
            );
            return;
        }

        if (plainPassword.length < 8) {
            console.error(
                '❌ La contraseña de la doctora debe tener al menos 8 caracteres'
            );
            return;
        }

        // 1) Asegurar que exista la tabla doctors en PostgreSQL
        await pg.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

        // 2) Verificar si ya existe una doctora con ese email en PG
        const { rows } = await pg.query(
            'SELECT id, name, email FROM doctors WHERE email = $1 LIMIT 1',
            [email]
        );

        if (rows.length > 0) {
            const row = rows[0];
            console.log('⚠️  Ya existe una doctora en PostgreSQL con ese email:');
            console.log('   ID:', row.id);
            console.log('   Nombre:', row.name);
            console.log('   Email:', row.email);
            console.log(
                'ℹ️  seedDoctor() (PG) no creó una nueva cuenta porque ya estaba registrada.'
            );
            return;
        }

        // 3) No existe → crearla en PG
        console.log('🔐 Encriptando contraseña de la doctora para PostgreSQL...');
        const hash = await bcrypt.hash(plainPassword, 10);

        const insertResult = await pg.query(
            `INSERT INTO doctors (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
            [name, email, hash]
        );

        const newId = insertResult.rows[0].id;

        console.log('\n🎉 ¡Doctora creada exitosamente en PostgreSQL!\n');
        console.log('═══════════════════════════════════════');
        console.log('📋 ID:', newId);
        console.log('👤 Nombre:', name);
        console.log('📧 Email:', email);
        console.log('🔑 Contraseña (texto plano):', plainPassword);
        console.log('═══════════════════════════════════════');
        console.log(
            '⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro.'
        );
    } catch (err) {
        console.error('❌ Error en seedDoctor() (PostgreSQL):', err);
    }
}

module.exports = { seedDoctor };
