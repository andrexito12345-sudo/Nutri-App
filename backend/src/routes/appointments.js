const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/appointments/stats  (solo doctora)
// GET /api/appointments/stats  (solo doctora)
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
            return res.status(500).json({ ok: false, message: 'Error al obtener estadísticas de hoy' });
        }

        db.get(last30Sql, [], (err2, last30Row) => {
            if (err2) {
                console.error('Error obteniendo stats de últimos 30 días:', err2);
                return res.status(500).json({ ok: false, message: 'Error al obtener estadísticas de los últimos 30 días' });
            }

            return res.json({
                ok: true,
                today: normalize(todayRow),
                last30: normalize(last30Row),
            });
        });
    });
});

// POST /api/appointments  (público: desde la landing)
router.post('/', (req, res) => {
    const {
        patient_name,
        patient_email,
        patient_phone,
        reason,
        appointment_datetime
    } = req.body;

    if (!patient_name || !appointment_datetime) {
        return res.status(400).json({
            ok: false,
            message: 'El nombre del paciente y la fecha/hora de la cita son obligatorios'
        });
    }

    const sql = `
    INSERT INTO appointments
      (patient_name, patient_email, patient_phone, reason, appointment_datetime, status)
    VALUES (?, ?, ?, ?, ?, 'pendiente')
  `;

    db.run(
        sql,
        [patient_name, patient_email || null, patient_phone || null, reason || null, appointment_datetime],
        function (err) {
            if (err) {
                console.error('Error al crear cita:', err);
                return res.status(500).json({ ok: false, message: 'Error al crear la cita' });
            }

            return res.status(201).json({
                ok: true,
                message: 'Cita creada correctamente',
                appointmentId: this.lastID
            });
        }
    );
});

// GET /api/appointments  (privado: doctora) con filtros
// GET /api/appointments (privado: doctora) con filtros
router.get('/', requireAuth, (req, res) => {
    const { status, q, date_from, date_to } = req.query;

    // MODIFICACIÓN CLAVE: Hacemos LEFT JOIN para encontrar el ID del paciente
    // basándonos en el email o el teléfono.
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
        sql += ' AND a.status = ?'; // Agregamos 'a.' para especificar la tabla
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

    // DESCendente = Nueva a Vieja (Lo más reciente primero)
    sql += ' ORDER BY a.created_at DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error al obtener citas:', err);
            return res.status(500).json({ ok: false, message: 'Error al obtener citas' });
        }
        return res.json({ ok: true, appointments: rows });
    });
});

// PATCH /api/appointments/:id/status  (privado: doctora)
router.patch('/:id/status', requireAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pendiente', 'realizada', 'cancelada'];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            ok: false,
            message: 'Estado inválido'
        });
    }

    db.run(
        'UPDATE appointments SET status = ? WHERE id = ?',
        [status, id],
        function (err) {
            if (err) {
                console.error('Error al actualizar cita:', err);
                return res.status(500).json({ ok: false, message: 'Error al actualizar cita' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ ok: false, message: 'Cita no encontrada' });
            }

            return res.json({ ok: true, message: 'Estado actualizado' });
        }
    );
});

module.exports = router;
