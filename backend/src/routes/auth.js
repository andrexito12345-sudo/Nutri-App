// backend/src/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
// Antes usábamos: const db = require('../db');
const pg = require('../pgClient');

const router = express.Router();

// POST /api/auth/login
// backend/src/routes/auth.js

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('🔎 Intento de login:');
    console.log('   email:', email);
    console.log('   password recibido (longitud):', password ? password.length : 0);

    if (!email || !password) {
        return res.status(400).json({
            ok: false,
            message: 'Email y contraseña son obligatorios',
        });
    }

    try {
        console.log('📡 Consultando doctora en PostgreSQL...');
        const { rows } = await pg.query(
            'SELECT * FROM doctors WHERE email = $1 LIMIT 1',
            [email]
        );

        const doctor = rows[0];

        if (!doctor) {
            console.log('❌ No se encontró doctora con ese email');
            return res
                .status(401)
                .json({ ok: false, message: 'Credenciales incorrectas' });
        }

        console.log('✅ Doctora encontrada:');
        console.log('   id:', doctor.id);
        console.log('   email:', doctor.email);

        const isMatch = await bcrypt.compare(password, doctor.password_hash);
        console.log('🔐 Comparando contraseña con bcrypt...');
        console.log('   Resultado bcrypt.compare isMatch =', isMatch);

        if (!isMatch) {
            console.log('❌ Contraseña incorrecta');
            return res
                .status(401)
                .json({ ok: false, message: 'Credenciales incorrectas' });
        }

        console.log('✅ Login correcto, regenerando sesión...');

        // 🔄 Regenerar sesión para tener un SID limpio
        req.session.regenerate((err) => {
            if (err) {
                console.error('❌ Error al regenerar sesión:', err);
                return res
                    .status(500)
                    .json({ ok: false, message: 'Error al crear sesión' });
            }

            // 🧠 Guardar datos de la doctora en la sesión
            req.session.doctorId = doctor.id;
            req.session.doctorName = doctor.name;
            req.session.doctorEmail = doctor.email;

            console.log('[AUTH] Sesión después de login:');
            console.log('   sessionID:', req.sessionID);
            console.log('   doctorId:', req.session.doctorId);
            console.log('   cookie:', req.session.cookie);

            // 💾 Forzar guardado de la sesión en el store
            req.session.save((err2) => {
                if (err2) {
                    console.error('❌ Error guardando la sesión:', err2);
                    return res
                        .status(500)
                        .json({ ok: false, message: 'Error al guardar sesión' });
                }

                console.log('✅ Sesión guardada correctamente en el store');

                return res.json({
                    ok: true,
                    doctor: {
                        id: doctor.id,
                        name: doctor.name,
                        email: doctor.email,
                    },
                });
            });
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
