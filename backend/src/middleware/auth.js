// backend/src/middleware/auth.js

function requireAuth(req, res, next) {
    console.log('🔐 [AUTH] Verificando sesión...');
    console.log('   URL:', req.originalUrl);
    console.log('   sessionID:', req.sessionID);
    console.log('   req.session completo:', req.session);

    if (!req.session || !req.session.doctorId) {
        console.log('   ⚠️ No autenticado. Falta doctorId en la sesión.');
        return res.status(401).json({
            ok: false,
            message: 'No autenticado',
        });
    }

    console.log('   ✅ Sesión OK. doctorId =', req.session.doctorId);
    next();
}

module.exports = { requireAuth };
