// backend/src/routes/auth.js
// ============================================
// Autenticación con JWT (JSON Web Tokens)
// Solución robusta para cross-origin en Render
// ============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pgPool = require('../pgClient');

const router = express.Router();

// ============================================
// CONFIGURACIÓN JWT
// ============================================
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura-cambiar-en-produccion';
const JWT_EXPIRES_IN = '7d'; // Token válido por 7 días

/**
 * Genera un token JWT para el doctor
 */
function generateToken(doctor) {
    return jwt.sign(
        {
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorEmail: doctor.email,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Verifica y decodifica un token JWT
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

// ============================================
// POST /api/auth/login
// ============================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('🔎 Intento de login:');
    console.log('   email:', email);

    if (!email || !password) {
        return res.status(400).json({
            ok: false,
            message: 'Email y contraseña son obligatorios',
        });
    }

    try {
        console.log('📡 Consultando doctora en PostgreSQL...');
        const { rows } = await pgPool.query(
            'SELECT * FROM doctors WHERE email = $1 LIMIT 1',
            [email]
        );

        const doctor = rows[0];

        if (!doctor) {
            console.log('❌ No se encontró doctora con ese email');
            return res.status(401).json({
                ok: false,
                message: 'Credenciales incorrectas',
            });
        }

        console.log('✅ Doctora encontrada:', doctor.email);

        console.log('🔐 Comparando contraseña con bcrypt...');
        const isMatch = await bcrypt.compare(password, doctor.password_hash);

        if (!isMatch) {
            console.log('❌ Contraseña incorrecta');
            return res.status(401).json({
                ok: false,
                message: 'Credenciales incorrectas',
            });
        }

        console.log('✅ Login correcto, generando JWT...');

        // Generar token JWT
        const token = generateToken(doctor);

        console.log('✅ Token generado exitosamente');

        return res.json({
            ok: true,
            token, // El frontend debe guardar este token
            doctor: {
                id: doctor.id,
                name: doctor.name,
                email: doctor.email,
            },
        });
    } catch (err) {
        console.error('❌ Error en /api/auth/login:', err);
        return res.status(500).json({
            ok: false,
            message: 'Error en el servidor',
        });
    }
});

// ============================================
// POST /api/auth/logout
// ============================================
router.post('/logout', (req, res) => {
    // Con JWT, el logout se maneja en el frontend
    // simplemente eliminando el token del localStorage
    // Aquí solo confirmamos la acción
    console.log('👋 Logout solicitado');
    return res.json({
        ok: true,
        message: 'Sesión cerrada correctamente',
    });
});

// ============================================
// GET /api/auth/me
// Obtiene los datos del doctor autenticado
// ============================================
router.get('/me', (req, res) => {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            ok: false,
            message: 'No autenticado - Token no proporcionado',
        });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({
            ok: false,
            message: 'No autenticado - Token inválido o expirado',
        });
    }

    return res.json({
        ok: true,
        doctor: {
            id: decoded.doctorId,
            name: decoded.doctorName,
            email: decoded.doctorEmail,
        },
    });
});

// ============================================
// POST /api/auth/refresh
// Renueva el token si aún es válido
// ============================================
router.post('/refresh', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            ok: false,
            message: 'Token no proporcionado',
        });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({
            ok: false,
            message: 'Token inválido o expirado',
        });
    }

    try {
        // Verificar que el doctor aún existe en la BD
        const { rows } = await pgPool.query(
            'SELECT id, name, email FROM doctors WHERE id = $1 LIMIT 1',
            [decoded.doctorId]
        );

        const doctor = rows[0];

        if (!doctor) {
            return res.status(401).json({
                ok: false,
                message: 'Doctor no encontrado',
            });
        }

        // Generar nuevo token
        const newToken = generateToken(doctor);

        return res.json({
            ok: true,
            token: newToken,
            doctor: {
                id: doctor.id,
                name: doctor.name,
                email: doctor.email,
            },
        });
    } catch (err) {
        console.error('❌ Error en /api/auth/refresh:', err);
        return res.status(500).json({
            ok: false,
            message: 'Error al renovar token',
        });
    }
});

// ============================================
// GET /api/auth/verify
// Verifica si un token es válido (útil para el frontend)
// ============================================
router.get('/verify', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({
            ok: false,
            valid: false,
        });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.json({
            ok: false,
            valid: false,
        });
    }

    return res.json({
        ok: true,
        valid: true,
        doctor: {
            id: decoded.doctorId,
            name: decoded.doctorName,
            email: decoded.doctorEmail,
        },
    });
});

module.exports = router;