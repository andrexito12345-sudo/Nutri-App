// ============================================================
// backend/src/routes/visits.js
// ------------------------------------------------------------
// Rutas para registrar visitas a la landing y obtener
// estadísticas simples de tráfico, usando PostgreSQL.
// ============================================================

const express = require('express');
const router = express.Router();
const pg = require('../pgClient'); // ← ahora usamos Postgres

// ============================================================
// 1. Registrar una visita
// POST /api/visits
// Body JSON (opcional): { "path": "/ruta/opcional" }
// ============================================================

router.post('/', async (req, res) => {
    try {
        const rawPath = req.body?.path;

        const normalizedPath =
            typeof rawPath === 'string' && rawPath.trim() !== ''
                ? rawPath.trim()
                : '/';

        const sql = `
            INSERT INTO page_visits (path)
            VALUES ($1)
            RETURNING id
        `;

        const { rows } = await pg.query(sql, [normalizedPath]);

        return res.json({
            ok: true,
            message: 'Visita registrada',
            visitId: rows[0]?.id,
        });
    } catch (error) {
        console.error('❌ Error insertando visita:', error);
        return res
            .status(500)
            .json({ ok: false, message: 'Error al registrar visita' });
    }
});

// ============================================================
// 2. Obtener estadísticas de visitas
// GET /api/visits/stats
// Devuelve: { ok:true, total, today }
// ============================================================

router.get('/stats', async (req, res) => {
    try {
        const sql = `
            SELECT
              COUNT(*)::integer AS total,
              COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::integer AS today
            FROM page_visits;
        `;

        const { rows } = await pg.query(sql);
        const row = rows[0] || { total: 0, today: 0 };

        const total = row.total || 0;
        const today = row.today || 0;

        console.log(`📊 Estadísticas solicitadas: Total=${total}, Hoy=${today}`);

        return res.json({
            ok: true,
            total,
            today,
        });
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas de visitas:', error);
        return res
            .status(500)
            .json({ ok: false, message: 'Error al obtener estadísticas de visitas' });
    }
});

module.exports = router;
