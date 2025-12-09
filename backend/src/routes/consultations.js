/**
 * Rutas para gestión de consultas médicas
 * CRUD completo para consultas SOAP Profesional
 * ACTUALIZADO: Soporte completo para SOAP nutricional con PES
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.run(query, [
            patient_id,
            consultation_id,
            new Date().toISOString(),
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
            JSON.stringify(calculation_data.results.mealDistribution)
        ]);

        res.json({
            success: true,
            id: result.lastID,
            message: 'Cálculo guardado exitosamente'
        });
    } catch (error) {
        console.error('Error guardando cálculo:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Obtener historial de cálculos de un paciente
router.get('/calculations/patient/:patientId', async (req, res) => {
    const { patientId } = req.params;

    try {
        const calculations = await db.all(
            `SELECT * FROM nutritional_calculations 
             WHERE patient_id = ? 
             ORDER BY calculation_date DESC`,
            [patientId]
        );

        res.json({
            success: true,
            calculations
        });
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});



// ============================================
// 1. OBTENER TODAS LAS CONSULTAS DE UN PACIENTE
// ============================================
router.get('/patient/:patientId', (req, res) => {
    const { patientId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
        SELECT 
            c.*,
            p.full_name as patient_name,
            (SELECT COUNT(*) FROM evolution_notes WHERE consultation_id = c.id) as notes_count
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        WHERE c.patient_id = ?
        ORDER BY c.consultation_date DESC
        LIMIT ? OFFSET ?
    `;

    db.all(query, [patientId, parseInt(limit), parseInt(offset)], (err, rows) => {
        if (err) {
            console.error('Error al obtener consultas:', err);
            return res.status(500).json({ error: 'Error al obtener consultas' });
        }

        res.json({
            consultations: rows,
            total: rows.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    });
});

// ============================================
// 2. OBTENER UNA CONSULTA ESPECÍFICA (CORREGIDO)
// ============================================
router.get('/:id', (req, res) => {
    const { id } = req.params;

    // Consulta simplificada para evitar errores de JOIN
    const query = `
        SELECT
            c.*,
            p.full_name as patient_name,
            p.email as patient_email,
            p.phone as patient_phone
        FROM consultations c
                 JOIN patients p ON c.patient_id = p.id
        WHERE c.id = ?
    `;

    db.get(query, [id], (err, consultation) => {
        if (err) {
            console.error('Error SQL al obtener consulta:', err);
            return res.status(500).json({ error: 'Error interno de base de datos' });
        }

        if (!consultation) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }

        // Enviamos la respuesta limpia
        res.json(consultation);
    });
});

// ============================================
// 3. CREAR NUEVA CONSULTA (SOAP PROFESIONAL COMPLETO)
// ============================================
router.post('/', (req, res) => {
    const {
        patient_id,
        appointment_id,
        consultation_date,

        // ===== SUBJETIVO (S) =====
        subjective,
        symptoms,
        appetite,
        sleep_quality,
        stress_level,
        physical_activity,
        water_intake,
        bowel_habits,

        // ===== OBJETIVO (O) - Antropometría =====
        weight,
        height,
        waist,
        hip,
        body_fat,
        body_fat_percentage,
        muscle_mass,
        ideal_weight,

        // ===== OBJETIVO (O) - Signos Vitales =====
        blood_pressure,
        heart_rate,
        temperature,

        // ===== OBJETIVO (O) - Bioquímicos =====
        glucose,
        hba1c,
        cholesterol,
        triglycerides,
        hdl,
        ldl,
        hemoglobin,
        albumin,
        objective_notes,

        // ===== ANÁLISIS (A) =====
        pes_problem,
        pes_etiology,
        pes_signs,
        diagnosis,
        assessment_notes,
        nutritional_status,
        risk_level,
        priority,

        // ===== PLAN (P) =====
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

        // ===== OTROS =====
        notes,
        created_by,
        measurements
    } = req.body;

    // Validaciones
    if (!patient_id || !consultation_date) {
        return res.status(400).json({
            error: 'ID del paciente y fecha de consulta son obligatorios'
        });
    }

    // Calcular IMC si hay peso y altura
    let bmi = null;
    if (weight && height) {
        const heightInMeters = height / 100;
        bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    // Calcular ICC si hay cintura y cadera
    let waist_hip_ratio = null;
    if (waist && hip) {
        waist_hip_ratio = (waist / hip).toFixed(2);
    }

    // Verificar que el paciente existe
    db.get('SELECT id FROM patients WHERE id = ?', [patient_id], (err, patient) => {
        if (err) {
            console.error('Error al verificar paciente:', err);
            return res.status(500).json({ error: 'Error al verificar paciente' });
        }

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // Insertar consulta COMPLETA
        const query = `
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
                ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, datetime('now'), datetime('now')
            )
        `;

        const params = [
            patient_id,
            appointment_id || null,
            consultation_date,

            // Subjetivo
            subjective || null,
            symptoms || null,
            appetite || null,
            sleep_quality || null,
            stress_level || null,
            physical_activity || null,
            water_intake || null,
            bowel_habits || null,

            // Objetivo Antropometría
            weight || null,
            height || null,
            bmi,
            waist || null,
            hip || null,
            waist_hip_ratio,
            body_fat || null,
            body_fat_percentage || null,
            muscle_mass || null,
            ideal_weight || null,

            // Objetivo Signos Vitales
            blood_pressure || null,
            heart_rate || null,
            temperature || null,

            // Objetivo Bioquímicos
            glucose || null,
            hba1c || null,
            cholesterol || null,
            triglycerides || null,
            hdl || null,
            ldl || null,
            hemoglobin || null,
            albumin || null,
            objective_notes || null,

            // Análisis
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
            calories_prescribed || null,
            protein_prescribed || null,
            carbs_prescribed || null,
            fats_prescribed || null,
            diet_type || null,
            supplements_recommended || null,
            education_provided || null,
            referrals || null,
            next_appointment || null,

            // Metadatos
            notes || null,
            created_by || null
        ];

        db.run(query, params, function(err) {
            if (err) {
                console.error('Error al crear consulta:', err);
                return res.status(500).json({ error: 'Error al crear consulta: ' + err.message });
            }

            const consultationId = this.lastID;

            // --- LÓGICA DE ACTUALIZACIÓN AUTOMÁTICA ---

            // 1. Actualizar perfil del paciente con los nuevos datos
            if (weight) {
                const updatePatientQuery = `
                    UPDATE patients 
                    SET current_weight = ?, current_bmi = ?, last_consultation_date = ? 
                    WHERE id = ?
                `;
                db.run(updatePatientQuery, [weight, bmi, consultation_date, patient_id], (err) => {
                    if (err) console.error('Error actualizando datos del paciente:', err);
                    else console.log('✅ Datos del paciente actualizados correctamente.');
                });
            }

            // 2. Marcar cita como "Realizada" (si existe appointment_id)
            if (appointment_id) {
                const updateApptQuery = `UPDATE appointments SET status = 'Realizada', patient_id = ? WHERE id = ?`;
                db.run(updateApptQuery, [patient_id, appointment_id], (err) => {
                    if (err) console.error('Error actualizando estado de la cita:', err);
                    else console.log(`✅ Cita ${appointment_id} marcada como Realizada.`);
                });
            }

            // 3. Guardar mediciones adicionales
            if (measurements && Object.keys(measurements).length > 0) {
                const measurementQuery = `
                    INSERT INTO measurements (
                        patient_id, consultation_id, measurement_date,
                        chest, arm_left, arm_right, forearm_left, forearm_right,
                        thigh_left, thigh_right, calf_left, calf_right, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const measurementParams = [
                    patient_id, consultationId, consultation_date,
                    measurements.chest || null, measurements.arm_left || null, measurements.arm_right || null,
                    measurements.forearm_left || null, measurements.forearm_right || null,
                    measurements.thigh_left || null, measurements.thigh_right || null,
                    measurements.calf_left || null, measurements.calf_right || null,
                    measurements.notes || null
                ];

                db.run(measurementQuery, measurementParams, (err) => {
                    if (err) console.error('Error al guardar mediciones:', err);
                });
            }

            // Respuesta final
            db.get('SELECT * FROM consultations WHERE id = ?', [consultationId], (err, consultation) => {
                if (err) {
                    return res.status(500).json({ error: 'Consulta creada pero error al obtenerla' });
                }
                res.status(201).json({
                    message: '✅ Consulta SOAP creada exitosamente',
                    consultation
                });
            });
        });
    });
});

// ============================================
// 4. ACTUALIZAR CONSULTA (SOAP PROFESIONAL COMPLETO)
// ============================================
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
        consultation_date,

        // Subjetivo
        subjective, symptoms, appetite, sleep_quality,
        stress_level, physical_activity, water_intake, bowel_habits,

        // Objetivo Antropometría
        weight, height, waist, hip, body_fat, body_fat_percentage, muscle_mass, ideal_weight,

        // Objetivo Signos Vitales
        blood_pressure, heart_rate, temperature,

        // Objetivo Bioquímicos
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

        notes
    } = req.body;

    // Calcular IMC si hay peso y altura
    let bmi = null;
    if (weight && height) {
        const heightInMeters = height / 100;
        bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    // Calcular ICC si hay cintura y cadera
    let waist_hip_ratio = null;
    if (waist && hip) {
        waist_hip_ratio = (waist / hip).toFixed(2);
    }

    // Verificar que la consulta existe
    db.get('SELECT id FROM consultations WHERE id = ?', [id], (err, consultation) => {
        if (err || !consultation) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }

        const query = `
            UPDATE consultations SET
                consultation_date = COALESCE(?, consultation_date),
                
                -- Subjetivo
                subjective = ?, symptoms = ?, appetite = ?, sleep_quality = ?,
                stress_level = ?, physical_activity = ?, water_intake = ?, bowel_habits = ?,
                
                -- Objetivo Antropometría
                weight = ?, height = ?, bmi = ?, waist = ?, hip = ?, waist_hip_ratio = ?,
                body_fat = ?,body_fat_percentage = ?, muscle_mass = ?, ideal_weight = ?,
                
                -- Objetivo Signos Vitales
                blood_pressure = ?, heart_rate = ?, temperature = ?,
                
                -- Objetivo Bioquímicos
                glucose = ?, hba1c = ?, cholesterol = ?, triglycerides = ?,
                hdl = ?, ldl = ?, hemoglobin = ?, albumin = ?, objective_notes = ?,
                
                -- Análisis
                pes_problem = ?, pes_etiology = ?, pes_signs = ?, diagnosis = ?,
                assessment_notes = ?, nutritional_status = ?, risk_level = ?, priority = ?,
                
                -- Plan
                treatment_plan = ?, treatment_goals = ?, calories_prescribed = ?,
                protein_prescribed = ?, carbs_prescribed = ?, fats_prescribed = ?,
                diet_type = ?, supplements_recommended = ?, education_provided = ?,
                referrals = ?, next_appointment = ?,
                
                notes = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `;

        const params = [
            consultation_date || null,

            // Subjetivo
            subjective || null, symptoms || null, appetite || null, sleep_quality || null,
            stress_level || null, physical_activity || null, water_intake || null, bowel_habits || null,

            // Objetivo Antropometría
            weight || null, height || null, bmi, waist || null, hip || null, waist_hip_ratio,
            body_fat || null, body_fat_percentage || null, muscle_mass || null, ideal_weight || null,

            // Objetivo Signos Vitales
            blood_pressure || null, heart_rate || null, temperature || null,

            // Objetivo Bioquímicos
            glucose || null, hba1c || null, cholesterol || null, triglycerides || null,
            hdl || null, ldl || null, hemoglobin || null, albumin || null, objective_notes || null,

            // Análisis
            pes_problem || null, pes_etiology || null, pes_signs || null, diagnosis || null,
            assessment_notes || null, nutritional_status || null, risk_level || null, priority || null,

            // Plan
            treatment_plan || null, treatment_goals || null, calories_prescribed || null,
            protein_prescribed || null, carbs_prescribed || null, fats_prescribed || null,
            diet_type || null, supplements_recommended || null, education_provided || null,
            referrals || null, next_appointment || null,

            notes || null,
            id
        ];

        db.run(query, params, function(err) {
            if (err) {
                console.error('Error al actualizar consulta:', err);
                return res.status(500).json({ error: 'Error al actualizar consulta' });
            }

            db.get('SELECT * FROM consultations WHERE id = ?', [id], (err, updatedConsultation) => {
                if (err) {
                    return res.status(500).json({ error: 'Consulta actualizada pero error al obtenerla' });
                }
                res.json({
                    message: '✅ Consulta actualizada exitosamente',
                    consultation: updatedConsultation
                });
            });
        });
    });
});

// ============================================
// 5. ELIMINAR CONSULTA
// ============================================
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT id FROM consultations WHERE id = ?', [id], (err, consultation) => {
        if (err || !consultation) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }

        db.run('DELETE FROM consultations WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar consulta' });
            }
            res.json({
                message: '✅ Consulta eliminada exitosamente',
                deletedId: id
            });
        });
    });
});

// ============================================
// 6. OBTENER EVOLUCIÓN COMPLETA (Peso, Grasa, Músculo)
// ============================================
router.get('/patient/:patientId/weight-history', (req, res) => {
    const { patientId } = req.params;
    const { limit = 20 } = req.query;

    const query = `
        SELECT
            consultation_date as date,
      weight,
      bmi,
      body_fat_percentage,  -- Nuevo campo
      muscle_mass           -- Nuevo campo
        FROM consultations
        WHERE patient_id = ? AND weight IS NOT NULL
        ORDER BY consultation_date ASC
            LIMIT ?
    `;

    db.all(query, [patientId, parseInt(limit)], (err, rows) => {
        if (err) {
            console.error('Error al obtener historial:', err);
            return res.status(500).json({ error: 'Error al obtener historial' });
        }
        res.json(rows);
    });
});

// ============================================
// 7. AGREGAR NOTA DE EVOLUCIÓN
// ============================================
router.post('/:consultationId/notes', (req, res) => {
    const { consultationId } = req.params;
    const { note, note_type = 'Seguimiento', is_important = false, created_by } = req.body;

    if (!note) return res.status(400).json({ error: 'La nota no puede estar vacía' });

    db.get('SELECT patient_id FROM consultations WHERE id = ?', [consultationId], (err, consultation) => {
        if (err || !consultation) return res.status(404).json({ error: 'Consulta no encontrada' });

        const query = `
            INSERT INTO evolution_notes (
                patient_id, consultation_id, note_date, note_type, note, is_important, created_by
            ) VALUES (?, ?, datetime('now'), ?, ?, ?, ?)
        `;

        db.run(query, [consultation.patient_id, consultationId, note_type, note, is_important, created_by], function(err) {
            if (err) return res.status(500).json({ error: 'Error al crear nota' });

            db.get('SELECT * FROM evolution_notes WHERE id = ?', [this.lastID], (err, evolutionNote) => {
                if (err) return res.status(500).json({ error: 'Error al obtener nota creada' });
                res.status(201).json({ message: '✅ Nota agregada exitosamente', note: evolutionNote });
            });
        });
    });
});

// ============================================
// 8. OBTENER ÚLTIMAS CONSULTAS (dashboard)
// ============================================
router.get('/recent/all', (req, res) => {
    const { limit = 10 } = req.query;
    const query = `
        SELECT c.*, p.full_name as patient_name, p.phone as patient_phone
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        ORDER BY c.consultation_date DESC
        LIMIT ?
    `;

    db.all(query, [parseInt(limit)], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener consultas recientes' });
        res.json(rows);
    });
});

module.exports = router;