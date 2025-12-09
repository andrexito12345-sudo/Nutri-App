/**
 * Rutas para gestión de pacientes
 * CRUD completo: Crear, Leer, Actualizar, Eliminar
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// ============================================
// 1. OBTENER TODOS LOS PACIENTES (PRIVADO DOCTORA)
//    GET /api/patients?search=&limit=&offset=
// ============================================
router.get('/', requireAuth, (req, res) => {
    const { search, limit = 50, offset = 0 } = req.query;

    let query = `
        SELECT 
          p.*,
          COUNT(DISTINCT c.id) as total_consultations,
          MAX(c.consultation_date) as last_consultation,
          (SELECT weight FROM consultations WHERE patient_id = p.id ORDER BY consultation_date DESC LIMIT 1) as current_weight,
          (SELECT bmi FROM consultations WHERE patient_id = p.id ORDER BY consultation_date DESC LIMIT 1) as current_bmi
        FROM patients p
        LEFT JOIN consultations c ON p.id = c.patient_id
    `;

    const params = [];

    // Búsqueda por nombre, email o teléfono
    if (search) {
        query += ` WHERE p.full_name LIKE ? OR p.email LIKE ? OR p.phone LIKE ?`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }

    // [CAMBIO] Antes: ORDER BY p.created_at (columna que puede no existir en tu BD remota)
    // Para evitar el error 500, ordenamos por p.id DESC, que siempre existe.
    query += ` GROUP BY p.id ORDER BY p.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error al obtener pacientes:', err);
            return res
                .status(500)
                .json({ error: 'Error al obtener pacientes' });
        }

        res.json({
            patients: rows,
            total: rows.length,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
        });
    });
});

// ============================================
// 2. OBTENER UN PACIENTE POR ID (DETALLE)
//    GET /api/patients/:id
// ============================================
router.get('/:id', requireAuth, (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
          p.*,
          COUNT(DISTINCT c.id) as total_consultations,
          MAX(c.consultation_date) as last_consultation,
          MIN(c.consultation_date) as first_consultation,
          (SELECT COUNT(*) FROM appointments WHERE patient_id = p.id) as total_appointments
        FROM patients p
        LEFT JOIN consultations c ON p.id = c.patient_id
        WHERE p.id = ?
        GROUP BY p.id
    `;

    db.get(query, [id], (err, patient) => {
        if (err) {
            console.error('Error al obtener paciente:', err);
            return res
                .status(500)
                .json({ error: 'Error al obtener paciente' });
        }

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        res.json(patient);
    });
});

// ============================================
// 3. CREAR NUEVO PACIENTE
//    POST /api/patients
// ============================================
router.post('/', requireAuth, (req, res) => {
    const {
        full_name,
        email,
        phone,
        birth_date,
        gender,
        occupation,
        address,
        emergency_contact,
        emergency_phone,
        blood_type,
        allergies,
        notes,
    } = req.body;

    // Validaciones
    if (!full_name || !phone) {
        return res.status(400).json({
            error: 'Nombre completo y teléfono son obligatorios',
        });
    }

    // Verificar si ya existe un paciente con el mismo teléfono
    db.get(
        'SELECT id FROM patients WHERE phone = ?',
        [phone],
        (err, existing) => {
            if (err) {
                console.error('Error al verificar paciente:', err);
                return res
                    .status(500)
                    .json({ error: 'Error al verificar paciente' });
            }

            if (existing) {
                return res.status(400).json({
                    error: 'Ya existe un paciente con este número de teléfono',
                });
            }

            // Insertar nuevo paciente
            const query = `
                INSERT INTO patients (
                  full_name, email, phone, birth_date, gender, occupation, 
                  address, emergency_contact, emergency_phone, blood_type, 
                  allergies, notes, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;

            const params = [
                full_name,
                email || null,
                phone,
                birth_date || null,
                gender || null,
                occupation || null,
                address || null,
                emergency_contact || null,
                emergency_phone || null,
                blood_type || null,
                allergies || null,
                notes || null,
            ];

            db.run(query, params, function (err2) {
                if (err2) {
                    console.error('Error al crear paciente:', err2);
                    return res
                        .status(500)
                        .json({ error: 'Error al crear paciente' });
                }

                // Obtener el paciente recién creado
                db.get(
                    'SELECT * FROM patients WHERE id = ?',
                    [this.lastID],
                    (err3, patient) => {
                        if (err3) {
                            console.error(
                                'Error al obtener paciente creado:',
                                err3
                            );
                            return res.status(500).json({
                                error:
                                    'Paciente creado pero error al obtenerlo',
                            });
                        }

                        res.status(201).json({
                            message: 'Paciente creado exitosamente',
                            patient,
                        });
                    }
                );
            });
        }
    );
});

// ============================================
// 4. ACTUALIZAR PACIENTE
//    PUT /api/patients/:id
// ============================================
router.put('/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const {
        full_name,
        email,
        phone,
        birth_date,
        gender,
        occupation,
        address,
        emergency_contact,
        emergency_phone,
        blood_type,
        allergies,
        notes,
    } = req.body;

    // Validaciones
    if (!full_name || !phone) {
        return res.status(400).json({
            error: 'Nombre completo y teléfono son obligatorios',
        });
    }

    // Verificar que el paciente existe
    db.get('SELECT id FROM patients WHERE id = ?', [id], (err, patient) => {
        if (err) {
            console.error('Error al verificar paciente:', err);
            return res
                .status(500)
                .json({ error: 'Error al verificar paciente' });
        }

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // Verificar si el teléfono ya está en uso por otro paciente
        db.get(
            'SELECT id FROM patients WHERE phone = ? AND id != ?',
            [phone, id],
            (err2, existing) => {
                if (err2) {
                    console.error('Error al verificar teléfono:', err2);
                    return res.status(500).json({
                        error: 'Error al verificar teléfono',
                    });
                }

                if (existing) {
                    return res.status(400).json({
                        error:
                            'Ya existe otro paciente con este número de teléfono',
                    });
                }

                // Actualizar paciente
                const query = `
                    UPDATE patients SET
                      full_name = ?,
                      email = ?,
                      phone = ?,
                      birth_date = ?,
                      gender = ?,
                      occupation = ?,
                      address = ?,
                      emergency_contact = ?,
                      emergency_phone = ?,
                      blood_type = ?,
                      allergies = ?,
                      notes = ?,
                      updated_at = datetime('now')
                    WHERE id = ?
                `;

                const params = [
                    full_name,
                    email || null,
                    phone,
                    birth_date || null,
                    gender || null,
                    occupation || null,
                    address || null,
                    emergency_contact || null,
                    emergency_phone || null,
                    blood_type || null,
                    allergies || null,
                    notes || null,
                    id,
                ];

                db.run(query, params, function (err3) {
                    if (err3) {
                        console.error(
                            'Error al actualizar paciente:',
                            err3
                        );
                        return res.status(500).json({
                            error: 'Error al actualizar paciente',
                        });
                    }

                    // Obtener el paciente actualizado
                    db.get(
                        'SELECT * FROM patients WHERE id = ?',
                        [id],
                        (err4, updatedPatient) => {
                            if (err4) {
                                console.error(
                                    'Error al obtener paciente actualizado:',
                                    err4
                                );
                                return res.status(500).json({
                                    error:
                                        'Paciente actualizado pero error al obtenerlo',
                                });
                            }

                            res.json({
                                message:
                                    'Paciente actualizado exitosamente',
                                patient: updatedPatient,
                            });
                        }
                    );
                });
            }
        );
    });
});

// ============================================
// 5. ELIMINAR PACIENTE
//    DELETE /api/patients/:id
// ============================================
router.delete('/:id', requireAuth, (req, res) => {
    const { id } = req.params;

    // Verificar que el paciente existe
    db.get('SELECT id FROM patients WHERE id = ?', [id], (err, patient) => {
        if (err) {
            console.error('Error al verificar paciente:', err);
            return res
                .status(500)
                .json({ error: 'Error al verificar paciente' });
        }

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // Por ahora, eliminación real (DELETE). En prod podrías hacer soft delete.
        db.run('DELETE FROM patients WHERE id = ?', [id], function (err2) {
            if (err2) {
                console.error('Error al eliminar paciente:', err2);
                return res
                    .status(500)
                    .json({ error: 'Error al eliminar paciente' });
            }

            res.json({
                message: 'Paciente eliminado exitosamente',
                deletedId: id,
            });
        });
    });
});

// ============================================
// 6. BUSCAR PACIENTE POR TELÉFONO
//    GET /api/patients/search/phone/:phone
// ============================================
router.get('/search/phone/:phone', requireAuth, (req, res) => {
    const { phone } = req.params;

    db.get(
        'SELECT * FROM patients WHERE phone = ?',
        [phone],
        (err, patient) => {
            if (err) {
                console.error('Error al buscar paciente:', err);
                return res
                    .status(500)
                    .json({ error: 'Error al buscar paciente' });
            }

            if (!patient) {
                return res.status(404).json({
                    error: 'Paciente no encontrado',
                    found: false,
                });
            }

            res.json({
                found: true,
                patient,
            });
        }
    );
});

// ============================================
// 7. OBTENER ESTADÍSTICAS DEL PACIENTE
//    GET /api/patients/:id/stats
// ============================================
router.get('/:id/stats', requireAuth, (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT
          COUNT(*) as total_consultations,
          MIN(weight) as min_weight,
          MAX(weight) as max_weight,
          AVG(weight) as avg_weight,
          MIN(bmi) as min_bmi,
          MAX(bmi) as max_bmi,
          AVG(bmi) as avg_bmi,
          (SELECT weight FROM consultations WHERE patient_id = ? ORDER BY consultation_date ASC LIMIT 1) as initial_weight,
          (SELECT weight FROM consultations WHERE patient_id = ? ORDER BY consultation_date DESC LIMIT 1) as current_weight
        FROM consultations
        WHERE patient_id = ?
    `;

    db.get(query, [id, id, id], (err, stats) => {
        if (err) {
            console.error('Error al obtener estadísticas:', err);
            return res
                .status(500)
                .json({ error: 'Error al obtener estadísticas' });
        }

        // Calcular diferencia de peso
        if (stats && stats.initial_weight && stats.current_weight) {
            stats.weight_difference =
                stats.current_weight - stats.initial_weight;
        }

        res.json(stats);
    });
});

module.exports = router;
