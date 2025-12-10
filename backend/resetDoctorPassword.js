// backend/resetDoctorPassword.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/db');

const email = process.env.DOCTOR_EMAIL || 'doctora@nutrividapro.com';

// ⚠ Elige aquí la nueva contraseña REAL que vas a usar en el login
const NEW_PASSWORD = 'NutriTest123!';

console.log('🔐 Reseteando contraseña para:', email);
console.log('   Nueva contraseña (texto plano):', NEW_PASSWORD);

bcrypt.hash(NEW_PASSWORD, 10, (err, hash) => {
    if (err) {
        console.error('❌ Error al encriptar nueva contraseña:', err);
        process.exit(1);
    }

    db.run(
        'UPDATE doctors SET password_hash = ? WHERE email = ?',
        [hash, email],
        function (updateErr) {
            if (updateErr) {
                console.error('❌ Error al actualizar password_hash en doctors:', updateErr);
                process.exit(1);
            }

            if (this.changes === 0) {
                console.error('⚠️ No se encontró ninguna doctora con ese email:', email);
            } else {
                console.log('✅ Contraseña actualizada correctamente en la tabla doctors.');
            }
            process.exit(0);
        }
    );
});
