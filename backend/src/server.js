require('dotenv').config();

const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const path = require('path');

// Rutas
const authRoutes = require('./routes/auth');
const appointmentsRoutes = require('./routes/appointments');
const dashboardRoutes = require('./routes/dashboard');
const visitsRoutes = require('./routes/visits');
const patientsRoutes = require('./routes/patients');
const consultationsRoutes = require('./routes/consultations');

// Importar la base de datos (esto crea tablas si falta algo)
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// ---------- CORS SOLO PARA LOCALHOST ----------
const corsOptions = {
    origin: [
        'http://localhost:5173',
        // agrega también la IP de tu PC:
        'http://192.168.1.11:5173', // ejemplo

    ],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Si algún día pasas backend por proxy/https, esto ayuda con cookies
app.set('trust proxy', 1);

// ---------- SESIONES (login doctora) ----------
app.use(session({
    store: new SQLiteStore({ db: 'sessions.sqlite' }),
    secret: process.env.SESSION_SECRET || 'DanielaVca12@',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 día
        sameSite: 'lax',
        secure: false, // porque el backend está en http, no https
    },
}));

// ---------- RUTA DE PRUEBA ----------
app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'API Nutricionista funcionando 🚀' });
});

// ---------- RUTAS API CON PREFIJO /api ----------
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/consultations', consultationsRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
