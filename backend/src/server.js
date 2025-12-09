// ============================================================
// backend/src/server.js
// ------------------------------------------------------------
// Punto de entrada del backend de NutriVida Pro.
// Arranca un servidor Express, configura CORS, sesiones,
// monta las rutas /api/... y antes de escuchar el puerto,
// ejecuta seedDoctor() para asegurarse de que la doctora
// existe en la base de datos.
// ============================================================

require('dotenv').config(); // Carga variables de entorno desde .env

const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const pgPool = require("./pgClient");
const path = require('path');

// ------------------------------------------------------------
// Rutas de la API (cada archivo maneja un módulo distinto)
// ------------------------------------------------------------
const authRoutes = require('./routes/auth');
const appointmentsRoutes = require('./routes/appointments');
const dashboardRoutes = require('./routes/dashboard');
const visitsRoutes = require('./routes/visits');
const patientsRoutes = require('./routes/patients');
const consultationsRoutes = require('./routes/consultations');

// ------------------------------------------------------------
// Conexión a la base de datos SQLite
// ------------------------------------------------------------
// Al requerir este módulo, normalmente ya se crean las tablas
// necesarias si no existen (según tu archivo db.js).
// ------------------------------------------------------------
const db = require('./db');

// ------------------------------------------------------------
// Seed de la doctora (crea la cuenta si no existe)
// ------------------------------------------------------------
const { seedDoctor } = require('./seedDoctor');

const app = express();




// Puerto para escuchar el backend.
// En Render, Render asigna PORT en env vars.
// En local, usas 4000 por defecto.
const PORT = process.env.PORT || 4000;

// ============================================================
// CAMBIO: detectar entorno (desarrollo vs producción)
// ------------------------------------------------------------
// Usaremos esta constante para ajustar CORS y las cookies
// de sesión según si estamos en Render (NODE_ENV=production)
// o en local.
// ============================================================
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================
// CONFIGURACIÓN DE CORS
// ------------------------------------------------------------
// - Permite que el frontend (React + Vite) se comunique con la API.
// - `credentials: true` porque usamos sesiones/cookies.
// - IMPORTANTE: el `origin` debe incluir el dominio del frontend
//   tanto en local como en producción (Render).
// ------------------------------------------------------------
// CAMBIO: en lugar de pasar directamente un array como `origin`,
//         usamos una función + lista `allowedOrigins` para poder
//         controlar mejor qué orígenes se aceptan y seguir
//         soportando herramientas como Postman (sin origin).
// ============================================================

// CAMBIO: lista de orígenes permitidos
const allowedOrigins = [
    // Frontend en local (Vite)
    'http://localhost:5173',

    // Si pruebas en tu red local con la IP de tu PC:
    // Cambia esta IP por la tuya real si es necesario.
    'http://192.168.1.11:5173',

    // Frontend de producción en Render (ajusta si tu dominio cambia)
    'https://nutri-app-dashboard.onrender.com',
];

const corsOptions = {
    // CAMBIO: función para validar dinámicamente el origen
    origin(origin, callback) {
        // Permitir llamadas sin origin (por ejemplo, Postman, curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn('Origen no permitido por CORS:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // permite enviar cookies (sesiones) al backend
};

app.use(cors(corsOptions));

// Para que Express pueda leer JSON en los body de las peticiones
app.use(express.json());

// ============================================================
// CONFIGURACIÓN DE SESIONES
// ------------------------------------------------------------
// Usamos `express-session` con almacenamiento en SQLite
// (archivo sessions.sqlite) mediante connect-sqlite3.
// Esto permite mantener la sesión de la doctora después de login.
// ------------------------------------------------------------
// CAMBIO: ajustamos las cookies según el entorno:
//   - En producción (Render, HTTPS, dominios distintos):
//       sameSite: 'none', secure: true
//     → permite que la cookie se envíe en contexto cross-site.
//   - En desarrollo local (http://localhost:5173):
//       sameSite: 'lax', secure: false
//     → más cómodo para pruebas en local.
// ============================================================

// CAMBIO: necesario en Render (proxy) para que secure/samesite funcionen bien
app.set('trust proxy', 1); // recomendado si algún día usas proxy/https

app.use(
    session({
        store: new SQLiteStore({ db: 'sessions.sqlite' }), // archivo donde se guardan las sesiones
        secret: process.env.SESSION_SECRET || 'DanielaVca12@', // cambia esto en producción por algo fuerte
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // duración de la cookie: 1 día

            // CAMBIO: configuración dinámica para soportar frontend y backend en dominios distintos (Render)
            sameSite: isProduction ? 'none' : 'lax', // 'none' en producción (cross-site), 'lax' en local

            // CAMBIO: en producción (HTTPS en Render) la cookie debe ser secure
            secure: isProduction, // true en Render (https), false en local
        },
    })
);

// ============================================================
// RUTA DE SALUD (HEALTHCHECK)
// ------------------------------------------------------------
// Útil para probar rápidamente si la API está respondiendo.
// GET /api/health
// ============================================================

app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'API Nutricionista funcionando 🚀' });
});

// ============================================================
// ENDPOINT: Guardar formulario del landing en PostgreSQL
// ============================================================
app.post('/api/landing/form', async (req, res) => {
    try {
        const payload = req.body; // TODO el body del formulario

        const result = await pgPool.query(
            `INSERT INTO landing_leads (payload)
             VALUES ($1)
             RETURNING id, created_at`,
            [payload]
        );

        const row = result.rows[0];

        res.status(201).json({
            ok: true,
            id: row.id,
            createdAt: row.created_at,
        });
    } catch (err) {
        console.error('❌ Error guardando formulario de landing en Postgres:', err);
        res.status(500).json({
            ok: false,
            error: 'Error guardando formulario de landing',
        });
    }
});

// ============================================================
// MONTAJE DE RUTAS DE LA API
// ------------------------------------------------------------
// Todas las rutas se montan bajo el prefijo /api.
// - /api/auth            → login, logout, etc.
// - /api/appointments    → citas
// - /api/dashboard       → estadísticas generales del sistema
// - /api/visits          → visitas a la web
// - /api/patients        → pacientes
// - /api/consultations   → consultas nutricionales
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/consultations', consultationsRoutes);

// ============================================================
// FUNCIÓN DE ARRANQUE DEL SERVIDOR
// ------------------------------------------------------------
// Hacemos una función async `start()` para poder:
// 1) Ejecutar seedDoctor() antes de escuchar el puerto.
// 2) Manejar errores de inicialización de forma ordenada.
// ============================================================

async function start() {
    try {
        console.log('🚀 Ejecutando seedDoctor() al inicio...');

        // Espera a que seedDoctor termine:
        // - Crea la doctora si no existe.
        // - Si ya existe, solo muestra info en logs.
        await seedDoctor();

        console.log('✅ seedDoctor() completado. Iniciando servidor Express...');
    } catch (err) {
        // Si algo falla durante el seed, lo mostramos en consola.
        // Puedes decidir aquí si quieres que:
        // - El servidor de todos modos arranque, o
        // - Se detenga el proceso (process.exit(1)).
        console.error('❌ Error durante seedDoctor():', err.message || err);

        // Si quieres que el backend NO arranque si el seed falla,
        // descomenta la siguiente línea:
        // process.exit(1);
    }

    // ----------------------------------------------------------
    // Finalmente, arrancamos el servidor Express en el puerto
    // correspondiente y escuchamos en todas las interfaces
    // (0.0.0.0) para que Render pueda acceder.
    // ----------------------------------------------------------
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Servidor backend escuchando en puerto ${PORT}`);
    });
}

// ============================================================
// EJECUTAR LA FUNCIÓN DE ARRANQUE
// ============================================================
start();
