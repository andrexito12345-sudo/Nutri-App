require('dotenv').config();
const authRoutes = require('./routes/auth');
const appointmentsRoutes = require('./routes/appointments');
const dashboardRoutes = require('./routes/dashboard');
const visitsRoutes = require('./routes/visits');

const patientsRoutes = require('./routes/patients');
const consultationsRoutes = require('./routes/consultations');

const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const path = require('path');

// Importar la base de datos (esto ejecuta la creación de tablas)
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Luego ajustamos según el puerto del frontend
    credentials: true
}));
app.use(express.json());

// Configuración de sesiones (para login de la doctora)
app.use(session({
    store: new SQLiteStore({ db: 'sessions.sqlite' }),
    secret: process.env.SESSION_SECRET || 'DanielaVca12@',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));

// Ruta básica de prueba
app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'API Nutricionista funcionando 🚀' });
});

// Rutas de la API (con prefijo /api)
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/consultations', consultationsRoutes);


app.use('/patients', patientsRoutes);
app.use('/consultations', consultationsRoutes);
app.use('/auth', authRoutes);
// 🔁 Alias sin /api para el nuevo dashboard del frontend
// Citas
app.use('/appointments', appointmentsRoutes);
app.use('/visits', visitsRoutes);
// Dashboard (si llegas a llamar a /dashboard)
app.use('/dashboard', dashboardRoutes);

// Visitas (dentro de este router tendrás algo como router.get('/stats', ...))
app.use('/visits', visitsRoutes);

// TODO: aquí luego agregaremos:
// - Rutas de autenticación (login/logout de la doctora)
// - Rutas de citas (crear, listar, cambiar estado)
// - Rutas para métricas del dashboard (visitas, pendientes, realizadas, etc.)

app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});