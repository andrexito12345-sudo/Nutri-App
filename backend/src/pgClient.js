// backend/src/pgClient.js
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.PG_URL;

if (!connectionString) {
    console.log('ℹ️ PostgreSQL desactivado (no hay DATABASE_URL/PG_URL). Se usará solo SQLite.');
}

let pool = null;

if (connectionString) {
    pool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        ssl: {
            rejectUnauthorized: false, // necesario en Render
        },
    });

    pool.on('error', (err) => {
        console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
    });

    console.log('✅ Pool de PostgreSQL inicializado con SSL');
}

// Exportamos el pool directamente.
// En las rutas podrás hacer: const pg = require('../pgClient');  y luego pg.query(...)
module.exports = pool;
