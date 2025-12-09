// backend/src/routes/appointments.js
// ============================================
// Rutas para gestión de citas
// ============================================

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ============================================
// 1. STATS DE CITAS (SOLO DOCTORA)
//    GET /api/appointments/stats
// ============================================
router.get('/stats', requireAuth, (req, res) => {
    const todaySql = `
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'realizada' THEN 1 ELSE 0 END) AS done,
            SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) AS cancelled
        FROM appointments
        WHERE date(appointment_datetime) = date('now', 'localtime')
    `;

    const last30Sql = `
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'realizada' THEN 1 ELSE 0 END) AS done,
            SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) AS cancelled
        FROM appointments
        WHERE date(appointment_datetime) >= date('now', '-30 day', 'localtime')
    `;

    const normalize = (row) => ({
        total: row?.total || 0,
        pending: row?.pending || 0,
        done: row?.done || 0,
        cancelled: row?.cancelled || 0,
    });

    db.get(todaySql, [], (err, todayRow) => {
        if (err) {
            console.error('Error obteniendo stats de hoy:', err);
            return res
                .status(500)
                .json({ ok: false, message: 'Error al obtener estadísticas de hoy' });
        }

        db.get(last30Sql, [], (err2, last30Row) => {
            if (err2) {
                console.error('Error obteniendo stats de últimos 30 días:', err2);
                return res.status(500).json({
                    ok: false,
                    message: 'Error al obtener estadísticas de los últimos 30 días',
                });
            }

            return res.json({
                ok: true,
                today: normalize(todayRow),
                last30: normalize(last30Row),
            });
        });
    });
});

// ============================================
// 2. CREAR CITA (PÚBLICO - DESDE LANDING)
//    POST /api/appointments
// ============================================
router.post('/', (req, res) => {
    const {
        patient_name,
        patient_email,
        patient_phone,
        reason,
        appointment_datetime,
    } = req.body;

    if (!patient_name || !appointment_datetime) {
        return res.status(400).json({
            ok: false,
            message:
                'El nombre del paciente y la fecha/hora de la cita son obligatorios',
        });
    }

    const sql = `
        INSERT INTO appointments
          (patient_name, patient_email, patient_phone, reason, appointment_datetime, status)
        VALUES (?, ?, ?, ?, ?, 'pendiente')
    `;

    db.run(
        sql,
        [
            patient_name,
            patient_email || null,
            patient_phone || null,
            reason || null,
            appointment_datetime,
        ],
        function (err) {
            if (err) {
                console.error('Error al crear cita:', err);
                return res
                    .status(500)
                    .json({ ok: false, message: 'Error al crear la cita' });
            }

            return res.status(201).json({
                ok: true,
                message: 'Cita creada correctamente',
                appointmentId: this.lastID,
            });
        }
    );
});

// ============================================
// 3. OBTENER CITA(S) (PRIVADO - DOCTORA)
//    GET /api/appointments
//    Filtros: status, q, date_from, date_to
// ============================================
router.get('/', requireAuth, (req, res) => {
    const { status, q, date_from, date_to } = req.query;

    // Hacemos LEFT JOIN con patients para intentar vincular por email/teléfono
    let sql = `
        SELECT a.*, p.id as linked_patient_id 
        FROM appointments a
        LEFT JOIN patients p ON (
            (a.patient_email IS NOT NULL AND a.patient_email != '' AND a.patient_email = p.email) 
            OR 
            (a.patient_phone IS NOT NULL AND a.patient_phone != '' AND a.patient_phone = p.phone)
        )
        WHERE 1=1
    `;

    const params = [];

    if (status) {
        sql += ' AND a.status = ?';
        params.push(status);
    }

    if (q) {
        sql += ' AND (a.patient_name LIKE ? OR a.patient_email LIKE ?)';
        const like = `%${q}%`;
        params.push(like, like);
    }

    if (date_from) {
        sql += ' AND a.appointment_datetime >= ?';
        params.push(date_from);
    }

    if (date_to) {
        sql += ' AND a.appointment_datetime <= ?';
        params.push(date_to);
    }

    // [CAMBIO] Antes ordenábamos por a.created_at (columna que puede no existir
    // en tu BD de Render). Para evitar el error 500, ordenamos por appointment_datetime,
    // que sí existe en la tabla.
    sql += ' ORDER BY a.appointment_datetime DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error al obtener citas:', err);
            return res
                .status(500)
                .json({ ok: false, message: 'Error al obtener citas' });
        }
        return res.json({ ok: true, appointments: rows });
    });
});

// ============================================
// 4. ACTUALIZAR ESTADO DE CITA (PRIVADO - DOCTORA)
//    PATCH /api/appointments/:id/status
// ============================================
router.patch('/:id/status', requireAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pendiente', 'realizada', 'cancelada'];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            ok: false,
            message: 'Estado inválido',
        });
    }

    db.run(
        'UPDATE appointments SET status = ? WHERE id = ?',
        [status, id],
        function (err) {
            if (err) {
                console.error('Error al actualizar cita:', err);
                return res
                    .status(500)
                    .json({ ok: false, message: 'Error al actualizar cita' });
            }

            if (this.changes === 0) {
                return res
                    .status(404)
                    .json({ ok: false, message: 'Cita no encontrada' });
            }

            return res.json({ ok: true, message: 'Estado actualizado' });
        }
    );
});

module.exports = router;
