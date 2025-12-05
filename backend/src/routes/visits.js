// backend/routes/visits.js
const express = require('express');
const db = require('../db');

const router = express.Router();

// ============================================================
// CACHÉ EN MEMORIA PARA CONTROLAR VISITAS DUPLICADAS
// ============================================================

const visitCache = new Map();

// Limpiar caché cada hora para evitar fuga de memoria
setInterval(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - 300000; // 5 minutos

    // Eliminar entradas antiguas del caché
    for (const [ip, timestamp] of visitCache.entries()) {
        if (timestamp < fiveMinutesAgo) {
            visitCache.delete(ip);
        }
    }

    console.log(`🧹 Caché de visitas limpiado. Entradas activas: ${visitCache.size}`);
}, 3600000); // Limpiar cada 1 hora

// ============================================================
// POST / - REGISTRAR UNA VISITA A LA LANDING
// ============================================================

router.post('/', (req, res) => {
    // Obtener IP del visitante
    const ip = req.ip ||
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection.remoteAddress ||
        'unknown';

    const now = Date.now();
    const fiveMinutesInMs = 300000; // 5 minutos = 300,000 ms

    // Verificar si esta IP ya visitó recientemente
    if (visitCache.has(ip)) {
        const lastVisit = visitCache.get(ip);
        const timeSinceLastVisit = now - lastVisit;

        // Si visitó hace menos de 5 minutos, no contar
        if (timeSinceLastVisit < fiveMinutesInMs) {
            const minutesLeft = Math.ceil((fiveMinutesInMs - timeSinceLastVisit) / 60000);

            console.log(`⚠️  Visita duplicada bloqueada desde IP: ${ip} (espera ${minutesLeft} min)`);

            return res.json({
                ok: true,
                counted: false,
                message: `Visita reciente detectada. Espera ${minutesLeft} minuto(s) para contar otra visita.`,
                nextAllowedIn: minutesLeft
            });
        }
    }

    // Registrar la nueva visita en el caché
    visitCache.set(ip, now);

    // Guardar en la base de datos
    const timestamp = new Date().toISOString();

    db.run(
        `INSERT INTO page_visits (created_at) VALUES (?)`,
        [timestamp],
        function (err) {
            if (err) {
                console.error('❌ Error insertando visita:', err);
                return res.status(500).json({
                    ok: false,
                    counted: false,
                    error: 'Error al registrar visita en la base de datos'
                });
            }

            console.log(`✅ Visita registrada correctamente desde IP: ${ip} | ID: ${this.lastID}`);

            res.json({
                ok: true,
                counted: true,
                id: this.lastID,
                message: 'Visita registrada correctamente',
                timestamp: timestamp
            });
        }
    );
});

// ============================================================
// GET /stats - OBTENER ESTADÍSTICAS DE VISITAS
// ============================================================

router.get('/stats', (req, res) => {
    db.get(
        `
        SELECT
          COUNT(*) AS total,
          SUM(
            CASE
              WHEN DATE(created_at) = DATE('now','localtime') THEN 1
              ELSE 0
            END
          ) AS today
        FROM page_visits;
        `,
        [],
        (err, row) => {
            if (err) {
                console.error('❌ Error obteniendo estadísticas de visitas:', err);
                return res.status(500).json({
                    ok: false,
                    error: 'Error al obtener estadísticas'
                });
            }

            const stats = {
                ok: true,
                total: row ? row.total : 0,
                today: row ? row.today : 0,
            };

            console.log(`📊 Estadísticas solicitadas: Total=${stats.total}, Hoy=${stats.today}`);

            res.json(stats);
        }
    );
});

// ============================================================
// GET /cache-info - INFORMACIÓN DEL CACHÉ (OPCIONAL - DEBUGGING)
// ============================================================

router.get('/cache-info', (req, res) => {
    const now = Date.now();
    const cacheEntries = Array.from(visitCache.entries()).map(([ip, timestamp]) => {
        const minutesAgo = Math.floor((now - timestamp) / 60000);
        return {
            ip: ip.replace(/\d+$/, 'XXX'), // Ocultar último octeto por privacidad
            minutesAgo: minutesAgo
        };
    });

    res.json({
        ok: true,
        cacheSize: visitCache.size,
        entries: cacheEntries
    });
});

module.exports = router;