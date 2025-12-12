// backend/src/middleware/auth.js
// ============================================
// Middleware de Autenticación JWT
// Protege las rutas que requieren login
// ============================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura-cambiar-en-produccion';

/**
 * Middleware que verifica el token JWT
 * Extrae el token del header Authorization: Bearer <token>
 */
function requireAuth(req, res, next) {
    console.log('🔐 [AUTH] Verificando JWT...');
    console.log('   URL:', req.originalUrl);

    // Obtener el header de autorización
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log('   ⚠️ No se proporcionó header Authorization');
        return res.status(401).json({
            ok: false,
            message: 'No autenticado - Token no proporcionado',
        });
    }

    // Verificar formato "Bearer <token>"
    if (!authHeader.startsWith('Bearer ')) {
        console.log('   ⚠️ Formato de token inválido (debe ser: Bearer <token>)');
        return res.status(401).json({
            ok: false,
            message: 'No autenticado - Formato de token inválido',
        });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];

    if (!token) {
        console.log('   ⚠️ Token vacío');
        return res.status(401).json({
            ok: false,
            message: 'No autenticado - Token vacío',
        });
    }

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET);

        console.log('   ✅ Token válido. doctorId =', decoded.doctorId);

        // Adjuntar datos del doctor al request para uso en las rutas
        req.doctorId = decoded.doctorId;
        req.doctorName = decoded.doctorName;
        req.doctorEmail = decoded.doctorEmail;

        // Continuar con la siguiente función/ruta
        next();
    } catch (err) {
        console.log('   ❌ Token inválido o expirado:', err.message);

        // Diferenciar entre token expirado y token inválido
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                ok: false,
                message: 'No autenticado - Token expirado',
                expired: true,
            });
        }

        return res.status(401).json({
            ok: false,
            message: 'No autenticado - Token inválido',
        });
    }
}

/**
 * Middleware opcional: verifica el token si existe, pero no bloquea
 * Útil para rutas que funcionan diferente si hay usuario autenticado
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No hay token, continuar sin autenticación
        req.doctorId = null;
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.doctorId = decoded.doctorId;
        req.doctorName = decoded.doctorName;
        req.doctorEmail = decoded.doctorEmail;
    } catch (err) {
        // Token inválido, continuar sin autenticación
        req.doctorId = null;
    }

    next();
}

module.exports = {
    requireAuth,
    optionalAuth,
};