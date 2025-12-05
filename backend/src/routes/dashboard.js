const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/summary  (privado: doctora)
router.get('/summary', requireAuth, (req, res) => {
    const result = {};

    // Contar citas por estado
    db.get(
        `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN status = 'realizada' THEN 1 ELSE 0 END) as realizadas,
        SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) as canceladas
     FROM appointments`,
        [],
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ ok: false, message: 'Error en dashboard (citas)' });
            }

            result.appointments = row;

            // Contar visitas totales
            db.get('SELECT COUNT(*) as total_visits FROM page_visits', [], (err2, visitsRow) => {
                if (err2) {
                    console.error(err2);
                    return res.status(500).json({ ok: false, message: 'Error en dashboard (visitas)' });
                }

                result.visits = visitsRow;

                // Visitas de hoy (fecha local de hoy)
                db.get(
                    `SELECT COUNT(*) as visits_today
           FROM page_visits
           WHERE date(created_at) = date('now','localtime')`,
                    [],
                    (err3, todayRow) => {
                        if (err3) {
                            console.error(err3);
                            return res.status(500).json({ ok: false, message: 'Error en dashboard (visitas hoy)' });
                        }

                        result.visits_today = todayRow.visits_today;

                        return res.json({ ok: true, summary: result });
                    }
                );
            });
        }
    );
});

module.exports = router;
