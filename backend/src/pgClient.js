// backend/src/pgClient.js
const { Pool } = require("pg");
const isProduction = process.env.NODE_ENV === 'production';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // No definimos host/port/user/password aquí,
    // todo viene en la URL que pusiste en Render.
    ssl: isProduction
        ? { rejectUnauthorized: false } // en Render
        : false,
});

module.exports = pool;
