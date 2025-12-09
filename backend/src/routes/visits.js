// ============================================================
// backend/src/routes/visits.js
// ------------------------------------------------------------
// Rutas para registrar visitas a la landing y obtener
// estadísticas simples de tráfico.
//
// Diseño actual:
//   Tabla page_visits:
//     - id          INTEGER PRIMARY KEY AUTOINCREMENT
//     - path        TEXT NOT NULL
//     - created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
//
// NOTA: ya no se usa ip_address, así que todo el código
// relacionado con IP fue eliminado para evitar errores.
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================================================
// 1. Registrar una visita
// ------------------------------------------------------------
// POST /api/visits
// Body JSON esperado (opcional):
//   { "path": "/ruta/opcional" }
//
// Si no llega path o viene vacío, se guarda '/'.
// ============================================================

router.post('/', (req, res) => {
    try {
        // Tomamos el path que venga del frontend (si viene)
        const rawPath = req.body?.path;

        // Normalizamos el path para evitar valores raros o vacíos
        const normalizedPath =
            typeof rawPath === 'string' && rawPath.trim() !== ''
                ? rawPath.trim()
                : '/';

        // Insertamos la visita en la tabla page_visits
        const sql = `
            INSERT INTO page_visits (path)
            VALUES (?)
        `;

        db.run(sql, [normalizedPath], function (err) {
            if (err) {
                console.error('❌ Error insertando visita:', err);
                return res
                    .status(500)
                    .json({ ok: false, message: 'Error al registrar visita' });
            }

            // Respuesta simple para el frontend
            return res.json({
                ok: true,
                message: 'Visita registrada',
                visitId: this.lastID,
            });
        });
    } catch (error) {
        console.error('❌ Error inesperado en POST /api/visits:', error);
        return res
            .status(500)
            .json({ ok: false, message: 'Error interno al registrar visita' });
    }
});

// ============================================================
// 2. Obtener estadísticas de visitas
// ------------------------------------------------------------
// GET /api/visits/stats
//
// Devuelve:
//   {
//     ok: true,
//     total: 123,   // total de registros en page_visits
//     today: 5      // registros creados hoy (según localtime)
//   }
// ============================================================

router.get('/stats', (req, res) => {
    const sql = `
        SELECT
          COUNT(*) AS total,
          SUM(
            CASE
              WHEN DATE(created_at) = DATE('now','localtime') THEN 1
              ELSE 0
            END
          ) AS today
        FROM page_visits;
    `;

    db.get(sql, [], (err, row) => {
        if (err) {
            console.error('❌ Error obteniendo estadísticas de visitas:', err);
            return res
                .status(500)
                .json({ ok: false, message: 'Error al obtener estadísticas de visitas' });
        }

        // Si row es null por cualquier motivo, devolvemos 0s
        const total = row?.total || 0;
        const today = row?.today || 0;

        console.log(`📊 Estadísticas solicitadas: Total=${total}, Hoy=${today}`);

        return res.json({
            ok: true,
            total,
            today,
        });
    });
});

// ============================================================
// Exportar router
// ============================================================
module.exports = router;
