// backend/src/routes/dashboard.js

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const pg = require('../pgClient');

const router = express.Router();

// GET /api/dashboard/summary  (privado: doctora)
router.get('/summary', requireAuth, async (req, res) => {
    try {
        const summary = {};

        // 1) Contar citas por estado
        const appointmentsSql = `
            SELECT
                COUNT(*)::integer AS total,
                SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END)::integer AS pendientes,
                SUM(CASE WHEN status = 'realizada' THEN 1 ELSE 0 END)::integer AS realizadas,
                SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END)::integer AS canceladas
            FROM appointments;
        `;
        const { rows: [appointmentsRow] } = await pg.query(appointmentsSql);
        summary.appointments = appointmentsRow || {
            total: 0,
            pendientes: 0,
            realizadas: 0,
            canceladas: 0,
        };

        // 2) Visitas totales
        const visitsTotalSql = `
            SELECT COUNT(*)::integer AS total_visits
            FROM page_visits;
        `;
        const { rows: [visitsRow] } = await pg.query(visitsTotalSql);
        summary.visits = visitsRow || { total_visits: 0 };

        // 3) Visitas de hoy
        const visitsTodaySql = `
            SELECT COUNT(*)::integer AS visits_today
            FROM page_visits
            WHERE DATE(created_at) = CURRENT_DATE;
        `;
        const { rows: [todayRow] } = await pg.query(visitsTodaySql);
        summary.visits_today = todayRow?.visits_today || 0;

        return res.json({ ok: true, summary });
    } catch (err) {
        console.error('❌ Error en dashboard summary:', err);
        return res
            .status(500)
            .json({ ok: false, message: 'Error en dashboard (summary)' });
    }
});

module.exports = router;
