/**
 * Rutas para gestión de consultas médicas
 * CRUD completo para consultas SOAP Profesional
 * ACTUALIZADO: Soporte completo para SOAP nutricional con PES
 */

const express = require('express');
const router = express.Router();

// AHORA USAMOS POSTGRES
const pg = require('../pgClient');

// Helpers para convertir valores opcionales
function toFloatOrNull(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === 'string' && value.trim() === '') return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
}

function toIntOrNull(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === 'string' && value.trim() === '') return null;
    const num = parseInt(value, 10);
    return Number.isNaN(num) ? null : num;
}



// ===================================================================
// 0. CÁLCULOS NUTRICIONALES (guardados aparte)
// ===================================================================

// Guardar cálculo nutricional
router.post('/calculations', async (req, res) => {
    const {
        patient_id,
        consultation_id,
        calculation_data
    } = req.body;

    try {
        const query = `
            INSERT INTO nutritional_calculations (
                patient_id, consultation_id, calculation_date,
                weight, height, age, gender,
                formula_used, activity_level, stress_factor, goal, condition,
                tmb_value, get_value, calories_prescribed,
                protein_grams, carbs_grams, fats_grams,
                distribution_strategy, meal_distribution
            ) VALUES (
                $1, $2, NOW(),
                $3, $4, $5, $6,
                $7, $8, $9, $10, $11,
                $12, $13, $14,
                $15, $16, $17,
                $18, $19
            )
            RETURNING id
        `;

        const values = [
            patient_id,
            consultation_id,
            calculation_data.weight,
            calculation_data.height,
            calculation_data.age,
            calculation_data.gender,
            calculation_data.formula,
            calculation_data.activityLevel,
            calculation_data.stressFactor,
            calculation_data.goal,
            calculation_data.condition,
            calculation_data.results.tmb,
            calculation_data.results.get,
            calculation_data.results.calorieGoal.calories,
            calculation_data.results.macros.protein.grams,
            calculation_data.results.macros.carbs.grams,
            calculation_data.results.macros.fats.grams,
            calculation_data.results.metadata.distribution_strategy,
            JSON.stringify(calculation_data.results.mealDistribution),
        ];

        const { rows } = await pg.query(query, values);

        res.json({
            success: true,
            id: rows[0].id,
            message: 'Cálculo guardado exitosamente',
        });
    } catch (error) {
        console.error('Error guardando cálculo:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// Obtener historial de cálculos de un paciente
router.get('/calculations/patient/:patientId', async (req, res) => {
    const { patientId } = req.params;

    try {
        const { rows } = await pg.query(
            `SELECT *
             FROM nutritional_calculations
             WHERE patient_id = $1
             ORDER BY calculation_date DESC`,
            [patientId]
        );

        res.json({
            success: true,
            calculations: rows,
        });
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});


// ===================================================================
// 1. OBTENER TODAS LAS CONSULTAS DE UN PACIENTE
// ===================================================================
router.get('/patient/:patientId', async (req, res) => {
    const { patientId } = req.params;
    const limit = parseInt(req.query.limit || 50, 10);
    const offset = parseInt(req.query.offset || 0, 10);

    const query = `
        SELECT 
            c.*,
            p.full_name AS patient_name,
            (
                SELECT COUNT(*) 
                FROM evolution_notes en 
                WHERE en.consultation_id = c.id
            ) AS notes_count
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        WHERE c.patient_id = $1
        ORDER BY c.consultation_date DESC
        LIMIT $2 OFFSET $3
    `;

    try {
        const { rows } = await pg.query(query, [patientId, limit, offset]);

        res.json({
            consultations: rows,
            total: rows.length,
            limit,
            offset,
        });
    } catch (err) {
        console.error('Error al obtener consultas:', err);
        res.status(500).json({ error: 'Error al obtener consultas' });
    }
});

// ===================================================================
// 2. OBTENER UNA CONSULTA ESPECÍFICA
// ===================================================================
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT
            c.*,
            p.full_name AS patient_name,
            p.email AS patient_email,
            p.phone AS patient_phone
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        WHERE c.id = $1
    `;

    try {
        const { rows } = await pg.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error SQL al obtener consulta:', err);
        res.status(500).json({ error: 'Error interno de base de datos' });
    }
});

// ===================================================================
// 3. CREAR NUEVA CONSULTA (SOAP PROFESIONAL COMPLETO)
// ===================================================================
router.post('/', async (req, res) => {
    const {
        patient_id,
        appointment_id,
        consultation_date,

        // S
        subjective,
        symptoms,
        appetite,
        sleep_quality,
        stress_level,
        physical_activity,
        water_intake,
        bowel_habits,

        // O - Antropometría
        weight,
        height,
        waist,
        hip,
        body_fat,
        body_fat_percentage,
        muscle_mass,
        ideal_weight,

        // O - Signos vitales
        blood_pressure,
        heart_rate,
        temperature,

        // O - Bioquímicos
        glucose,
        hba1c,
        cholesterol,
        triglycerides,
        hdl,
        ldl,
        hemoglobin,
        albumin,
        objective_notes,

        // A
        pes_problem,
        pes_etiology,
        pes_signs,
        diagnosis,
        assessment_notes,
        nutritional_status,
        risk_level,
        priority,

        // P
        treatment_plan,
        treatment_goals,
        calories_prescribed,
        protein_prescribed,
        carbs_prescribed,
        fats_prescribed,
        diet_type,
        supplements_recommended,
        education_provided,
        referrals,
        next_appointment,

        // Otros
        notes,
        created_by,
        measurements,
    } = req.body;

    if (!patient_id || !consultation_date) {
        return res.status(400).json({
            error: 'ID del paciente y fecha de consulta son obligatorios',
        });
    }

    let bmi = null;
    if (weight && height) {
        const heightInMeters = height / 100;
        bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    let waist_hip_ratio = null;
    if (waist && hip) {
        waist_hip_ratio = (waist / hip).toFixed(2);
    }

    try {
        // 1) Verificar que el paciente existe en POSTGRES
        const { rows: patientRows } = await pg.query(
            'SELECT id FROM patients WHERE id = $1',
            [patient_id]
        );

        if (patientRows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // 2) Insertar consulta completa
        const insertQuery = `
            INSERT INTO consultations (
                patient_id, appointment_id, consultation_date,
                
                -- Subjetivo
                subjective, symptoms, appetite, sleep_quality, 
                stress_level, physical_activity, water_intake, bowel_habits,
                
                -- Objetivo Antropometría
                weight, height, bmi, waist, hip, waist_hip_ratio,
                body_fat, body_fat_percentage, muscle_mass, ideal_weight,
                
                -- Objetivo Signos Vitales
                blood_pressure, heart_rate, temperature,
                
                -- Objetivo Bioquímicos
                glucose, hba1c, cholesterol, triglycerides, hdl, ldl,
                hemoglobin, albumin, objective_notes,
                
                -- Análisis
                pes_problem, pes_etiology, pes_signs, diagnosis,
                assessment_notes, nutritional_status, risk_level, priority,
                
                -- Plan
                treatment_plan, treatment_goals, calories_prescribed,
                protein_prescribed, carbs_prescribed, fats_prescribed,
                diet_type, supplements_recommended, education_provided,
                referrals, next_appointment,
                
                -- Metadatos
                notes, created_by, created_at, updated_at
            ) VALUES (
                $1, $2, $3,
                $4, $5, $6, $7,
                $8, $9, $10, $11,
                $12, $13, $14, $15, $16, $17,
                $18, $19, $20, $21,
                $22, $23, $24,
                $25, $26, $27, $28, $29, $30,
                $31, $32, $33,
                $34, $35, $36, $37,
                $38, $39, $40, $41,
                $42, $43, $44,
                $45, $46, $47, $48,
                $49, $50, $51, $52,
                $53, $54, NOW(), NOW()
            )
            RETURNING *
        `;

        const values = [
            // IDs
            toIntOrNull(patient_id),
            toIntOrNull(appointment_id),
            consultation_date || null,

            // Subjetivo
            subjective || null,
            symptoms || null,
            appetite || null,
            sleep_quality || null,
            stress_level || null,
            physical_activity || null,
            water_intake || null,
            bowel_habits || null,

            // Antropometría (todos números → toFloatOrNull)
            toFloatOrNull(weight),
            toFloatOrNull(height),
            toFloatOrNull(bmi),
            toFloatOrNull(waist),
            toFloatOrNull(hip),
            toFloatOrNull(waist_hip_ratio),
            toFloatOrNull(body_fat),
            toFloatOrNull(body_fat_percentage),
            toFloatOrNull(muscle_mass),
            toFloatOrNull(ideal_weight),

            // Signos vitales
            blood_pressure || null,
            toIntOrNull(heart_rate),
            toFloatOrNull(temperature),

            // Bioquímicos
            toFloatOrNull(glucose),
            toFloatOrNull(hba1c),
            toFloatOrNull(cholesterol),
            toFloatOrNull(triglycerides),
            toFloatOrNull(hdl),
            toFloatOrNull(ldl),
            toFloatOrNull(hemoglobin),
            toFloatOrNull(albumin),
            objective_notes || null,

            // Análisis (PES)
            pes_problem || null,
            pes_etiology || null,
            pes_signs || null,
            diagnosis || null,
            assessment_notes || null,
            nutritional_status || null,
            risk_level || null,
            priority || null,

            // Plan
            treatment_plan || null,
            treatment_goals || null,
            toFloatOrNull(calories_prescribed),
            toFloatOrNull(protein_prescribed),
            toFloatOrNull(carbs_prescribed),
            toFloatOrNull(fats_prescribed),
            diet_type || null,
            supplements_recommended || null,
            education_provided || null,
            referrals || null,
            next_appointment || null,

            // Metadatos
            notes || null,
            created_by || null,
        ];


        const { rows } = await pg.query(insertQuery, values);
        const consultation = rows[0];
        const consultationId = consultation.id;

        // 3) Actualizaciones paralelas (no bloquean la respuesta)
        // 3.1 Actualizar datos básicos del paciente
        const weightForUpdate = toFloatOrNull(weight);
        const bmiForUpdate = toFloatOrNull(bmi);

        if (weightForUpdate !== null) {
            pg.query(
                `
                    UPDATE patients
                    SET current_weight = $1,
                        current_bmi = $2,
                        last_consultation_date = $3
                    WHERE id = $4
                `,
                [weightForUpdate, bmiForUpdate, consultation_date || null, toIntOrNull(patient_id)]
            ).catch(err =>
                console.error('Error actualizando datos del paciente:', err)
            );
        }

        // 3.2 Marcar cita como realizada
        if (appointment_id) {
            pg.query(
                `
                UPDATE appointments
                SET status = 'Realizada',
                    patient_id = $1
                WHERE id = $2
                `,
                [patient_id, appointment_id]
            ).catch(err =>
                console.error('Error actualizando estado de la cita:', err)
            );
        }

        // 3.3 Guardar mediciones adicionales
        if (measurements && Object.keys(measurements).length > 0) {
            pg.query(
                `
                INSERT INTO measurements (
                    patient_id, consultation_id, measurement_date,
                    chest, arm_left, arm_right, forearm_left, forearm_right,
                    thigh_left, thigh_right, calf_left, calf_right, notes
                ) VALUES (
                    $1, $2, $3,
                    $4, $5, $6, $7, $8,
                    $9, $10, $11, $12, $13
                )
                `,
                [
                    patient_id,
                    consultationId,
                    consultation_date,
                    measurements.chest || null,
                    measurements.arm_left || null,
                    measurements.arm_right || null,
                    measurements.forearm_left || null,
                    measurements.forearm_right || null,
                    measurements.thigh_left || null,
                    measurements.thigh_right || null,
                    measurements.calf_left || null,
                    measurements.calf_right || null,
                    measurements.notes || null,
                ]
            ).catch(err => console.error('Error al guardar mediciones:', err));
        }

        // 4) Respuesta
        res.status(201).json({
            message: '✅ Consulta SOAP creada exitosamente',
            consultation,
        });
    } catch (err) {
        console.error('Error al crear consulta:', err);
        res.status(500).json({ error: 'Error al crear consulta: ' + err.message });
    }
});

// ===================================================================
// 4. ACTUALIZAR CONSULTA
// ===================================================================
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        consultation_date,

        // Subjetivo
        subjective, symptoms, appetite, sleep_quality,
        stress_level, physical_activity, water_intake, bowel_habits,

        // Antropometría
        weight, height, waist, hip, body_fat, body_fat_percentage,
        muscle_mass, ideal_weight,

        // Signos vitales
        blood_pressure, heart_rate, temperature,

        // Bioquímicos
        glucose, hba1c, cholesterol, triglycerides, hdl, ldl,
        hemoglobin, albumin, objective_notes,

        // Análisis
        pes_problem, pes_etiology, pes_signs, diagnosis,
        assessment_notes, nutritional_status, risk_level, priority,

        // Plan
        treatment_plan, treatment_goals, calories_prescribed,
        protein_prescribed, carbs_prescribed, fats_prescribed,
        diet_type, supplements_recommended, education_provided,
        referrals, next_appointment,

        notes,
    } = req.body;

    let bmi = null;
    if (weight && height) {
        const heightInMeters = height / 100;
        bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    let waist_hip_ratio = null;
    if (waist && hip) {
        waist_hip_ratio = (waist / hip).toFixed(2);
    }

    try {
        // Verificar que exista
        const { rows: existing } = await pg.query(
            'SELECT id FROM consultations WHERE id = $1',
            [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }

        const query = `
            UPDATE consultations SET
                consultation_date = COALESCE($1, consultation_date),
                
                -- Subjetivo
                subjective = $2, symptoms = $3, appetite = $4, sleep_quality = $5,
                stress_level = $6, physical_activity = $7, water_intake = $8, bowel_habits = $9,
                
                -- Antropometría
                weight = $10, height = $11, bmi = $12, waist = $13, hip = $14, waist_hip_ratio = $15,
                body_fat = $16, body_fat_percentage = $17, muscle_mass = $18, ideal_weight = $19,
                
                -- Signos vitales
                blood_pressure = $20, heart_rate = $21, temperature = $22,
                
                -- Bioquímicos
                glucose = $23, hba1c = $24, cholesterol = $25, triglycerides = $26,
                hdl = $27, ldl = $28, hemoglobin = $29, albumin = $30, objective_notes = $31,
                
                -- Análisis
                pes_problem = $32, pes_etiology = $33, pes_signs = $34, diagnosis = $35,
                assessment_notes = $36, nutritional_status = $37, risk_level = $38, priority = $39,
                
                -- Plan
                treatment_plan = $40, treatment_goals = $41, calories_prescribed = $42,
                protein_prescribed = $43, carbs_prescribed = $44, fats_prescribed = $45,
                diet_type = $46, supplements_recommended = $47, education_provided = $48,
                referrals = $49, next_appointment = $50,
                
                notes = $51,
                updated_at = NOW()
            WHERE id = $52
            RETURNING *
        `;

        const params = [
            consultation_date || null,

            subjective || null, symptoms || null, appetite || null, sleep_quality || null,
            stress_level || null, physical_activity || null, water_intake || null, bowel_habits || null,

            weight || null, height || null, bmi, waist || null, hip || null, waist_hip_ratio,
            body_fat || null, body_fat_percentage || null, muscle_mass || null, ideal_weight || null,

            blood_pressure || null, heart_rate || null, temperature || null,

            glucose || null, hba1c || null, cholesterol || null, triglycerides || null,
            hdl || null, ldl || null, hemoglobin || null, albumin || null, objective_notes || null,

            pes_problem || null, pes_etiology || null, pes_signs || null, diagnosis || null,
            assessment_notes || null, nutritional_status || null, risk_level || null, priority || null,

            treatment_plan || null, treatment_goals || null, calories_prescribed || null,
            protein_prescribed || null, carbs_prescribed || null, fats_prescribed || null,
            diet_type || null, supplements_recommended || null, education_provided || null,
            referrals || null, next_appointment || null,

            notes || null,
            id,
        ];

        const { rows } = await pg.query(query, params);
        const updatedConsultation = rows[0];

        res.json({
            message: '✅ Consulta actualizada exitosamente',
            consultation: updatedConsultation,
        });
    } catch (err) {
        console.error('Error al actualizar consulta:', err);
        res.status(500).json({ error: 'Error al actualizar consulta' });
    }
});

// ===================================================================
// 5. ELIMINAR CONSULTA
// ===================================================================
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { rows } = await pg.query(
            'SELECT id FROM consultations WHERE id = $1',
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }

        await pg.query('DELETE FROM consultations WHERE id = $1', [id]);

        res.json({
            message: '✅ Consulta eliminada exitosamente',
            deletedId: id,
        });
    } catch (err) {
        console.error('Error al eliminar consulta:', err);
        res.status(500).json({ error: 'Error al eliminar consulta' });
    }
});

// ===================================================================
// 6. OBTENER EVOLUCIÓN COMPLETA (Peso, Grasa, Músculo)
// ===================================================================
router.get('/patient/:patientId/weight-history', async (req, res) => {
    const { patientId } = req.params;
    const limit = parseInt(req.query.limit || 20, 10);

    const query = `
        SELECT
            consultation_date AS date,
            weight,
            bmi,
            body_fat_percentage,
            muscle_mass
        FROM consultations
        WHERE patient_id = $1 AND weight IS NOT NULL
        ORDER BY consultation_date ASC
        LIMIT $2
    `;

    try {
        const { rows } = await pg.query(query, [patientId, limit]);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener historial:', err);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// ===================================================================
// 7. AGREGAR NOTA DE EVOLUCIÓN
// ===================================================================
router.post('/:consultationId/notes', async (req, res) => {
    const { consultationId } = req.params;
    const {
        note,
        note_type = 'Seguimiento',
        is_important = false,
        created_by,
    } = req.body;

    if (!note) {
        return res.status(400).json({ error: 'La nota no puede estar vacía' });
    }

    try {
        const { rows: consRows } = await pg.query(
            'SELECT patient_id FROM consultations WHERE id = $1',
            [consultationId]
        );
        if (consRows.length === 0) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }

        const patientId = consRows[0].patient_id;

        const insertQuery = `
            INSERT INTO evolution_notes (
                patient_id, consultation_id, note_date,
                note_type, note, is_important, created_by
            ) VALUES (
                $1, $2, NOW(),
                $3, $4, $5, $6
            )
            RETURNING *
        `;

        const { rows } = await pg.query(insertQuery, [
            patientId,
            consultationId,
            note_type,
            note,
            is_important,
            created_by || null,
        ]);

        res.status(201).json({
            message: '✅ Nota agregada exitosamente',
            note: rows[0],
        });
    } catch (err) {
        console.error('Error al crear nota:', err);
        res.status(500).json({ error: 'Error al crear nota' });
    }
});

// ===================================================================
// 8. OBTENER ÚLTIMAS CONSULTAS (dashboard)
// ===================================================================
router.get('/recent/all', async (req, res) => {
    const limit = parseInt(req.query.limit || 10, 10);

    const query = `
        SELECT 
            c.*, 
            p.full_name AS patient_name, 
            p.phone AS patient_phone
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        ORDER BY c.consultation_date DESC
        LIMIT $1
    `;

    try {
        const { rows } = await pg.query(query, [limit]);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener consultas recientes:', err);
        res.status(500).json({ error: 'Error al obtener consultas recientes' });
    }
});

module.exports = router;
