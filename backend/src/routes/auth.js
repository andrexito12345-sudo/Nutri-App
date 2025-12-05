const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            ok: false,
            message: 'Email y contraseña son obligatorios'
        });
    }

    db.get('SELECT * FROM doctors WHERE email = ?', [email], (err, doctor) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ ok: false, message: 'Error en el servidor' });
        }

        if (!doctor) {
            return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
        }

        bcrypt.compare(password, doctor.password_hash, (compareErr, isMatch) => {
            if (compareErr) {
                console.error(compareErr);
                return res.status(500).json({ ok: false, message: 'Error al verificar contraseña' });
            }

            if (!isMatch) {
                return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
            }

            // Login correcto → guardar en sesión
            req.session.doctorId = doctor.id;
            req.session.doctorName = doctor.name;
            req.session.doctorEmail = doctor.email;

            return res.json({
                ok: true,
                doctor: {
                    id: doctor.id,
                    name: doctor.name,
                    email: doctor.email
                }
            });
        });
    });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ ok: false, message: 'No se pudo cerrar sesión' });
        }
        res.clearCookie('connect.sid');
        return res.json({ ok: true, message: 'Sesión cerrada' });
    });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
    if (!req.session || !req.session.doctorId) {
        return res.status(401).json({ ok: false, message: 'No autenticado' });
    }

    return res.json({
        ok: true,
        doctor: {
            id: req.session.doctorId,
            name: req.session.doctorName,
            email: req.session.doctorEmail
        }
    });
});

module.exports = router;
