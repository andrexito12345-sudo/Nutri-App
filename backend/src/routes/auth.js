// backend/src/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
// Antes usábamos: const db = require('../db');
const pg = require('../pgClient');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('🔎 Intento de login:');
    console.log('   email:', email);
    console.log('   password recibido (longitud):', password ? password.length : 0);

    if (!email || !password) {
        console.log('⚠️  Falta email o password en el body');
        return res.status(400).json({
            ok: false,
            message: 'Email y contraseña son obligatorios',
        });
    }

    try {
        // Buscamos a la doctora en PostgreSQL
        console.log('📡 Consultando doctora en PostgreSQL...');
        const { rows } = await pg.query(
            'SELECT * FROM doctors WHERE email = $1 LIMIT 1',
            [email]
        );

        console.log('   rows.length:', rows.length);

        const doctor = rows[0];

        if (!doctor) {
            console.log('❌ No se encontró doctora con ese email en la tabla doctors');
            return res
                .status(401)
                .json({ ok: false, message: 'Credenciales incorrectas' });
        }

        console.log('✅ Doctora encontrada:');
        console.log('   id:', doctor.id);
        console.log('   email:', doctor.email);
        console.log(
            '   hash (primeros 20 chars):',
            typeof doctor.password_hash === 'string'
                ? doctor.password_hash.slice(0, 20) + '...'
                : '(no es string)'
        );

        // Verificar contraseña
        console.log('🔐 Comparando contraseña con bcrypt...');
        const isMatch = await bcrypt.compare(password, doctor.password_hash);
        console.log('   Resultado bcrypt.compare isMatch =', isMatch);

        if (!isMatch) {
            console.log('❌ La contraseña NO coincide con el hash guardado');
            return res
                .status(401)
                .json({ ok: false, message: 'Credenciales incorrectas' });
        }

        console.log('✅ Contraseña correcta, creando sesión...');

        // Login correcto → guardar en sesión
        req.session.doctorId = doctor.id;
        req.session.doctorName = doctor.name;
        req.session.doctorEmail = doctor.email;

        return res.json({
            ok: true,
            doctor: {
                id: doctor.id,
                name: doctor.name,
                email: doctor.email,
            },
        });
    } catch (err) {
        console.error('❌ Error en /api/auth/login:', err);
        return res
            .status(500)
            .json({ ok: false, message: 'Error en el servidor' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res
                .status(500)
                .json({ ok: false, message: 'No se pudo cerrar sesión' });
        }
        res.clearCookie('connect.sid');
        return res.json({ ok: true, message: 'Sesión cerrada' });
    });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
    if (!req.session || !req.session.doctorId) {
        return res
            .status(401)
            .json({ ok: false, message: 'No autenticado' });
    }

    return res.json({
        ok: true,
        doctor: {
            id: req.session.doctorId,
            name: req.session.doctorName,
            email: req.session.doctorEmail,
        },
    });
});

module.exports = router;
