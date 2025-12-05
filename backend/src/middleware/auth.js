function requireAuth(req, res, next) {
    if (!req.session || !req.session.doctorId) {
        return res.status(401).json({
            ok: false,
            message: 'No autenticado'
        });
    }
    next();
}

module.exports = { requireAuth };
