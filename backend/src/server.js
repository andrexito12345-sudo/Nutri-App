// ============================================================
// backend/src/server.js
// ------------------------------------------------------------

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const pgPool = require('./pgClient');
const path = require('path');

const authRoutes = require('./routes/auth');
const appointmentsRoutes = require('./routes/appointments');
const dashboardRoutes = require('./routes/dashboard');
const visitsRoutes = require('./routes/visits');
const patientsRoutes = require('./routes/patients');
const consultationsRoutes = require('./routes/consultations');

const db = require('./db');
const { seedDoctor } = require('./seedDoctor');

const app = express();

const PORT = process.env.PORT || 4000;

// ===== ENTORNO =============================================================

// Render pone RENDER="true". Aseguramos que esto también cuente como producción.
const isRender = process.env.RENDER === 'true';
const isProduction = process.env.NODE_ENV === 'production' || isRender;

// ===== CORS ================================================================

const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.1.11:5173',
    'https://nutri-app-dashboard.onrender.com',
];

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true); // p.ej. Postman

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn('Origen no permitido por CORS:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ===== SESIONES ============================================================

// Necesario detrás de proxy (Render) para que secure/samesite funcionen bien
app.set('trust proxy', 1);

const sessionStore = new SQLiteStore({
    db: 'sessions.sqlite',
    // dir: './backend', // solo si quieres cambiar la carpeta
});

const sessionOptions = {
    name: 'nvpsid', // nombre de la cookie de sesión
    secret: process.env.SESSION_SECRET || 'dev-secret-muy-largo-y-seguro',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
        // En Render (subdominios distintos, peticiones XHR) necesitamos SameSite=None + Secure
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
    },
};

app.use(session(sessionOptions));

// ===== RUTAS BASE ==========================================================

app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'API Nutricionista funcionando 🚀' });
});

app.post('/api/landing/form', async (req, res) => {
    try {
        const payload = req.body;

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

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/consultations', consultationsRoutes);

// ===== ARRANQUE ============================================================

async function start() {
    try {
        console.log('🚀 Ejecutando seedDoctor() al inicio...');
        await seedDoctor();
        console.log('✅ seedDoctor() completado. Iniciando servidor Express...');
    } catch (err) {
        console.error('❌ Error durante seedDoctor():', err.message || err);
        // process.exit(1); // si quieres que no arranque sin seed
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Servidor backend escuchando en puerto ${PORT}`);
        console.log('   isProduction =', isProduction, 'RENDER =', process.env.RENDER);
    });
}

start();
