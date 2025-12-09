// ============================================================
// backend/src/routes/visits.js
// ------------------------------------------------------------
// Rutas para registrar visitas a la página y obtener estadísticas
// de tráfico (total de visitas y visitas del día).
//
// Esta versión:
//  - Garantiza que siempre se inserte un "path" (para evitar
//    NOT NULL constraint failed: page_visits.path).
//  - Evita registrar visitas duplicadas del mismo IP + path
//    dentro de una ventana de 5 minutos.
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================================================
// 1. Registrar una visita
// ------------------------------------------------------------
// POST /api/visits
// Body opcional:
//   { path: "/doctora/dashboard" }
//
// Si el frontend no envía path, se intenta obtener desde:
//   - cabecera X-Page-Path
//   - cabecera Referer
//   - y si nada existe, se usa "/" como valor por defecto.
// ============================================================

router.post('/', (req, res) => {
    // -------------------------------
    // Obtener IP del cliente
    // -------------------------------
    const ipHeader = req.headers['x-forwarded-for'];
    const ip = ipHeader
        ? ipHeader.split(',')[0].trim()
        : (req.socket?.remoteAddress || 'unknown');

    // -------------------------------
    // Obtener User-Agent (navegador)
    // -------------------------------
    const userAgent = req.headers['user-agent'] || 'unknown';

    // -------------------------------
    // Obtener el path de la página
    // -------------------------------
    const bodyPath   = req.body?.path;               // lo ideal: lo envía el frontend
    const headerPath = req.headers['x-page-path'];   // alternativa por cabecera
    const referer    = req.headers['referer'];       // como último intento, la URL de referencia

    // Si nada viene, usamos "/" para no violar el NOT NULL
    const finalPath =
        bodyPath ||
        headerPath ||
        (referer ? new URL(referer).pathname : null) ||
        '/';

    // -------------------------------
    // Evitar SPAM: no registrar la misma
    // IP + path más de una vez cada 5 min
    // -------------------------------
    const checkSql = `
        SELECT id
        FROM page_visits
        WHERE ip_address = ?
          AND path = ?
          AND created_at >= datetime('now', '-5 minutes', 'localtime')
        LIMIT 1
    `;

    db.get(checkSql, [ip, finalPath], (checkErr, existing) => {
        if (checkErr) {
            console.error('❌ Error verificando visita previa:', checkErr);
            // No rompemos nada al frontend, solo logueamos
            return res.status(200).json({ ok: true, skipped: true });
        }

        if (existing) {
            // Ya hubo una visita reciente desde este IP a este path
            console.log(
                `ℹ️ Visita duplicada bloqueada desde IP: ${ip} en path: ${finalPath} (últimos 5 min)`
            );
            return res.status(200).json({ ok: true, duplicated: true });
        }

        // -------------------------------
        // Insertar la visita
        // -------------------------------
        const insertSql = `
            INSERT INTO page_visits (path, ip_address, user_agent, created_at)
            VALUES (?, ?, ?, datetime('now', 'localtime'))
        `;

        db.run(insertSql, [finalPath, ip, userAgent], function (err) {
            if (err) {
                console.error('❌ Error insertando visita:', err);
                // IMPORTANTE: no queremos que falle el dashboard por esto,
                // devolvemos 200 y solo avisamos en el log.
                return res.status(200).json({
                    ok: false,
                    message: 'Error al registrar visita (solo analytics)',
                });
            }

            console.log(
                `✅ Visita registrada: path=${finalPath}, ip=${ip}, id=${this.lastID}`
            );

            return res.status(201).json({
                ok: true,
                visitId: this.lastID,
            });
        });
    });
});

// ============================================================
// 2. Estadísticas de visitas
// ------------------------------------------------------------
// GET /api/visits/stats
//
// Devuelve:
//   {
//     ok: true,
//     total: 123,
//     today: 5
//   }
// ============================================================

router.get('/stats', (req, res) => {
    const statsSql = `
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

    db.get(statsSql, [], (err, row) => {
        if (err) {
            console.error(
                '❌ Error obteniendo estadísticas de visitas:',
                err
            );
            return res.status(500).json({
                ok: false,
                message: 'Error al obtener estadísticas de visitas',
            });
        }

        const total = row?.total || 0;
        const today = row?.today || 0;

        console.log(
            `📊 Estadísticas solicitadas: Total=${total}, Hoy=${today}`
        );

        return res.json({
            ok: true,
            total,
            today,
        });
    });
});

module.exports = router;
