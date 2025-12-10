/**
 * Rutas para gestión de pacientes (PostgreSQL)
 * CRUD completo: Crear, Leer, Actualizar, Eliminar
 */

const express = require('express');
const router = express.Router();
const pgPool = require('../pgClient');      // ← usamos Postgres
const { requireAuth } = require('../middleware/auth');

// ============================================
// 1. OBTENER TODOS LOS PACIENTES (PRIVADO DOCTORA)
//    GET /api/patients?search=&limit=&offset=
// ============================================
router.get('/', requireAuth, async (req, res) => {
    const { search, limit = 50, offset = 0 } = req.query;

    const limitNum = parseInt(limit, 10) || 50;
    const offsetNum = parseInt(offset, 10) || 0;

    let query = `
    SELECT 
      p.*,
      COUNT(DISTINCT c.id)::int AS total_consultations,
      MAX(c.consultation_date) AS last_consultation,
      (
        SELECT weight 
        FROM consultations 
        WHERE patient_id = p.id 
        ORDER BY consultation_date DESC 
        LIMIT 1
      ) AS current_weight,
      (
        SELECT bmi 
        FROM consultations 
        WHERE patient_id = p.id 
        ORDER BY consultation_date DESC 
        LIMIT 1
      ) AS current_bmi
    FROM patients p
    LEFT JOIN consultations c ON p.id = c.patient_id
  `;

    const params = [];
    let idx = 1;

    // Búsqueda por nombre, email o teléfono
    if (search) {
        query += `
      WHERE 
        p.full_name ILIKE $${idx} 
        OR p.email ILIKE $${idx} 
        OR p.phone ILIKE $${idx}
    `;
        const searchParam = `%${search}%`;
        params.push(searchParam);
        idx++;
    }

    query += `
    GROUP BY p.id
    ORDER BY p.id DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
    params.push(limitNum, offsetNum);

    try {
        const { rows } = await pgPool.query(query, params);

        return res.json({
            patients: rows,
            total: rows.length,
            limit: limitNum,
            offset: offsetNum,
        });
    } catch (err) {
        console.error('❌ Error al obtener pacientes (Postgres):', err);
        return res
            .status(500)
            .json({ error: 'Error al obtener pacientes' });
    }
});

// ============================================
// 2. OBTENER UN PACIENTE POR ID (DETALLE)
//    GET /api/patients/:id
// ============================================
router.get('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    const query = `
    SELECT 
      p.*,
      COUNT(DISTINCT c.id)::int AS total_consultations,
      MAX(c.consultation_date) AS last_consultation,
      MIN(c.consultation_date) AS first_consultation,
      (
        SELECT COUNT(*)::int 
        FROM appointments 
        WHERE patient_id = p.id
      ) AS total_appointments
    FROM patients p
    LEFT JOIN consultations c ON p.id = c.patient_id
    WHERE p.id = $1
    GROUP BY p.id
  `;

    try {
        const { rows } = await pgPool.query(query, [id]);
        const patient = rows[0];

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        return res.json(patient);
    } catch (err) {
        console.error('❌ Error al obtener paciente (Postgres):', err);
        return res
            .status(500)
            .json({ error: 'Error al obtener paciente' });
    }
});

// ============================================
// 3. CREAR NUEVO PACIENTE
//    POST /api/patients
// ============================================
router.post('/', requireAuth, async (req, res) => {
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

    if (!full_name || !phone) {
        return res.status(400).json({
            error: 'Nombre completo y teléfono son obligatorios',
        });
    }

    try {
        // Verificar si ya existe un paciente con el mismo teléfono
        const existing = await pgPool.query(
            'SELECT id FROM patients WHERE phone = $1 LIMIT 1',
            [phone]
        );

        if (existing.rowCount > 0) {
            return res.status(400).json({
                error: 'Ya existe un paciente con este número de teléfono',
            });
        }

        // Insertar nuevo paciente
        const insertQuery = `
      INSERT INTO patients (
        full_name, email, phone, birth_date, gender, occupation,
        address, emergency_contact, emergency_phone, blood_type,
        allergies, notes, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, NOW()::TEXT, NOW()::TEXT
      )
      RETURNING *;
    `;

        const insertParams = [
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

        const { rows } = await pgPool.query(insertQuery, insertParams);
        const patient = rows[0];

        return res.status(201).json({
            message: 'Paciente creado exitosamente',
            patient,
        });
    } catch (err) {
        console.error('❌ Error al crear paciente (Postgres):', err);
        return res
            .status(500)
            .json({ error: 'Error al crear paciente' });
    }
});

// ============================================
// 4. ACTUALIZAR PACIENTE
//    PUT /api/patients/:id
// ============================================
router.put('/:id', requireAuth, async (req, res) => {
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

    if (!full_name || !phone) {
        return res.status(400).json({
            error: 'Nombre completo y teléfono son obligatorios',
        });
    }

    try {
        // Verificar que el paciente existe
        const existingPatient = await pgPool.query(
            'SELECT id FROM patients WHERE id = $1',
            [id]
        );

        if (existingPatient.rowCount === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // Verificar si el teléfono ya está en uso por otro paciente
        const phoneCheck = await pgPool.query(
            'SELECT id FROM patients WHERE phone = $1 AND id <> $2 LIMIT 1',
            [phone, id]
        );

        if (phoneCheck.rowCount > 0) {
            return res.status(400).json({
                error: 'Ya existe otro paciente con este número de teléfono',
            });
        }

        const updateQuery = `
      UPDATE patients SET
        full_name = $1,
        email = $2,
        phone = $3,
        birth_date = $4,
        gender = $5,
        occupation = $6,
        address = $7,
        emergency_contact = $8,
        emergency_phone = $9,
        blood_type = $10,
        allergies = $11,
        notes = $12,
        updated_at = NOW()::TEXT
      WHERE id = $13
      RETURNING *;
    `;

        const updateParams = [
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

        const { rows } = await pgPool.query(updateQuery, updateParams);
        const updatedPatient = rows[0];

        return res.json({
            message: 'Paciente actualizado exitosamente',
            patient: updatedPatient,
        });
    } catch (err) {
        console.error('❌ Error al actualizar paciente (Postgres):', err);
        return res
            .status(500)
            .json({ error: 'Error al actualizar paciente' });
    }
});

// ============================================
// 5. ELIMINAR PACIENTE
//    DELETE /api/patients/:id
// ============================================
router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar que el paciente existe
        const existing = await pgPool.query(
            'SELECT id FROM patients WHERE id = $1',
            [id]
        );

        if (existing.rowCount === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        await pgPool.query('DELETE FROM patients WHERE id = $1', [id]);

        return res.json({
            message: 'Paciente eliminado exitosamente',
            deletedId: id,
        });
    } catch (err) {
        console.error('❌ Error al eliminar paciente (Postgres):', err);
        return res
            .status(500)
            .json({ error: 'Error al eliminar paciente' });
    }
});

// ============================================
// 6. BUSCAR PACIENTE POR TELÉFONO
//    GET /api/patients/search/phone/:phone
// ============================================
router.get('/search/phone/:phone', requireAuth, async (req, res) => {
    const { phone } = req.params;

    try {
        const { rows } = await pgPool.query(
            'SELECT * FROM patients WHERE phone = $1 LIMIT 1',
            [phone]
        );

        const patient = rows[0];

        if (!patient) {
            return res.status(404).json({
                error: 'Paciente no encontrado',
                found: false,
            });
        }

        return res.json({
            found: true,
            patient,
        });
    } catch (err) {
        console.error('❌ Error al buscar paciente (Postgres):', err);
        return res
            .status(500)
            .json({ error: 'Error al buscar paciente' });
    }
});

// ============================================
// 7. OBTENER ESTADÍSTICAS DEL PACIENTE
//    GET /api/patients/:id/stats
// ============================================
router.get('/:id/stats', requireAuth, async (req, res) => {
    const { id } = req.params;

    const query = `
    SELECT
      COUNT(*)::int AS total_consultations,
      MIN(weight) AS min_weight,
      MAX(weight) AS max_weight,
      AVG(weight) AS avg_weight,
      MIN(bmi) AS min_bmi,
      MAX(bmi) AS max_bmi,
      AVG(bmi) AS avg_bmi,
      (
        SELECT weight 
        FROM consultations 
        WHERE patient_id = $1 
        ORDER BY consultation_date ASC 
        LIMIT 1
      ) AS initial_weight,
      (
        SELECT weight 
        FROM consultations 
        WHERE patient_id = $1 
        ORDER BY consultation_date DESC 
        LIMIT 1
      ) AS current_weight
    FROM consultations
    WHERE patient_id = $1
  `;

    try {
        const { rows } = await pgPool.query(query, [id]);
        const stats = rows[0] || null;

        if (stats && stats.initial_weight != null && stats.current_weight != null) {
            stats.weight_difference =
                Number(stats.current_weight) - Number(stats.initial_weight);
        }

        return res.json(stats);
    } catch (err) {
        console.error('❌ Error al obtener estadísticas (Postgres):', err);
        return res
            .status(500)
            .json({ error: 'Error al obtener estadísticas' });
    }
});

module.exports = router;
