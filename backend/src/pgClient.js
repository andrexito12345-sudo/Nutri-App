// backend/src/pgClient.js
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || process.env.PG_URL;

if (!connectionString) {
    console.log("ℹ️ PostgreSQL desactivado (no hay DATABASE_URL/PG_URL). Se usará solo SQLite.");
}

let pool = null;

if (connectionString) {
    const isLocal =
        connectionString.includes("localhost") ||
        connectionString.includes("127.0.0.1");

    const config = {
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        // En local: sin SSL. En Render/producción: con SSL.
        ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
    };

    pool = new Pool(config);

    pool.on("error", (err) => {
        console.error("❌ Error inesperado en el pool de PostgreSQL:", err);
    });

    console.log(isLocal ? "✅ Pool PostgreSQL iniciado (SIN SSL - local)" : "✅ Pool PostgreSQL iniciado (CON SSL - prod)");
}

module.exports = pool;
