// backend/src/migrateLanding.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,  // [No verificado] aceptamos el cert sin validarlo
    },
});

(async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS landing_leads (
        id SERIAL PRIMARY KEY,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

        console.log('✅ Tabla landing_leads creada/verificada correctamente');
    } catch (err) {
        console.error('❌ Error creando tabla landing_leads:', err);
    } finally {
        await pool.end();
    }
})();
