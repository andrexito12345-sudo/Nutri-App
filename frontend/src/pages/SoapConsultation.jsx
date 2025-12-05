import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SoapConsultation.css';
import api from '../api';
import { toast } from 'react-toastify';
// 1. IMPORTAMOS EL COMPONENTE DE HERRAMIENTAS
import NutritionalTools from '../components/NutritionalTools';

const SoapConsultation = () => {
    const { appointmentId, patientId, consultationId } = useParams();
    const isEditing = !!consultationId; // Variable mágica: true si editamos, false si creamos
    const navigate = useNavigate();

    // Estado para mostrar el modal de herramientas
    const [showTools, setShowTools] = useState(false);
    // Estado para guardar los datos básicos del paciente (necesario para las fórmulas: edad, sexo)
    const [patient, setPatient] = useState(null);

    // Estado del formulario completo
    const [formData, setFormData] = useState({
        // ===== SUBJETIVO =====
        subjective: '',
        symptoms: '',
        appetite: '',
        sleep_quality: '',
        stress_level: '',
        physical_activity: '',
        water_intake: '',
        bowel_habits: '',

        // ===== OBJETIVO - Antropometría =====
        weight: '',
        height: '',
        bmi: '',
        waist: '',
        hip: '',
        waist_hip_ratio: '',
        body_fat: '',
        muscle_mass: '',
        ideal_weight: '',

        // ===== OBJETIVO - Signos Vitales =====
        blood_pressure: '',
        heart_rate: '',
        temperature: '',

        // ===== OBJETIVO - Bioquímicos =====
        glucose: '',
        hba1c: '',
        cholesterol: '',
        triglycerides: '',
        hdl: '',
        ldl: '',
        hemoglobin: '',
        albumin: '',
        objective_notes: '',

        // ===== ANÁLISIS - PES =====
        pes_problem: '',
        pes_etiology: '',
        pes_signs: '',
        assessment_notes: '',
        nutritional_status: '',
        risk_level: '',
        priority: '',

        // ===== PLAN =====
        treatment_goals: '',
        calories_prescribed: '',
        protein_prescribed: '',
        carbs_prescribed: '',
        fats_prescribed: '',
        diet_type: '',
        supplements_recommended: '',
        education_provided: '',
        referrals: '',
        next_appointment: ''
    });

    // --- NUEVO: Cargar datos del paciente para la calculadora ---
    useEffect(() => {
        const fetchPatientData = async () => {
            if (patientId) {
                try {
                    const response = await api.get(`/api/patients/${patientId}`);
                    setPatient(response.data);
                } catch (error) {
                    console.error("Error al cargar datos del paciente:", error);
                }
            }
        };
        fetchPatientData();
    }, [patientId]);

    // Cálculo automático de IMC
    useEffect(() => {
        const { weight, height } = formData;
        if (weight && height) {
            const heightInMeters = height / 100;
            const calculatedBmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
            setFormData(prev => ({ ...prev, bmi: calculatedBmi }));
        }
    }, [formData.weight, formData.height]);

    // Cálculo automático de ICC (Índice Cintura-Cadera)
    useEffect(() => {
        const { waist, hip } = formData;
        if (waist && hip) {
            const icc = (waist / hip).toFixed(2);
            setFormData(prev => ({ ...prev, waist_hip_ratio: icc }));
        }
    }, [formData.waist, formData.hip]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // --- NUEVO: CARGAR DATOS SI ESTAMOS EDITANDO ---
    useEffect(() => {
        if (isEditing) {
            const fetchConsultation = async () => {
                try {
                    const response = await api.get(`/api/consultations/${consultationId}`);
                    const data = response.data;

                    // Ajuste para fechas (los inputs date necesitan formato YYYY-MM-DD)
                    if (data.next_appointment) {
                        data.next_appointment = data.next_appointment.split('T')[0];
                    }

                    // Rellenamos el formulario con lo que vino de la base de datos
                    setFormData(prev => ({ ...prev, ...data }));
                } catch (error) {
                    console.error("Error al cargar:", error);
                    alert("Error al cargar la consulta para editar.");
                }
            };
            fetchConsultation();
        }
    }, [isEditing, consultationId]);

    // --- NUEVO: Función para recibir datos de la Calculadora ---
    const handleApplyCalculations = (data) => {
        // data contiene: { bmr, tdee, targetCalories, macros: {protein, carbs, fats}, config }

        setFormData(prev => ({
            ...prev,
            // 1. Llenamos la Prescripción Dietética en la sección PLAN
            calories_prescribed: data.targetCalories,
            protein_prescribed: data.macros.protein.grams,
            carbs_prescribed: data.macros.carbs.grams,
            fats_prescribed: data.macros.fats.grams,

            // 2. Agregamos una nota automática al ANÁLISIS con el resumen del cálculo
            assessment_notes: (prev.assessment_notes ? prev.assessment_notes + '\n' : '') +
                `[Cálculo Auto]: TMB ${data.bmr} | GET ${data.tdee} | Meta ${data.targetCalories}kcal (${data.config.goal}).`
        }));

        setShowTools(false);
        toast.success("✅ Cálculos aplicados al Plan de Alimentación");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Lógica inteligente: Editar o Crear
            if (isEditing) {
                // MODO EDICIÓN (PUT)
                await api.put(`/api/consultations/${consultationId}`, formData);
                alert('¡Consulta actualizada correctamente!');
            } else {
                // MODO CREACIÓN (POST)
                const payload = {
                    patient_id: patientId,
                    appointment_id: appointmentId,
                    consultation_date: new Date().toISOString(),
                    ...formData
                };
                await api.post('/api/consultations', payload);
                alert('¡Consulta creada correctamente!');
            }

            // Volver al dashboard
            navigate('/doctora/dashboard');

        } catch (error) {
            console.error("Error al guardar:", error);
            const mensaje = error.response?.data?.error || "Error al guardar";
            alert(mensaje);
        }
    };

    return (
        <div className="soap-container">
            {/* ENCABEZADO CLÍNICO PROFESIONAL */}
            <div className="clinical-header-container">
                <div className="clinical-accent-bar"></div>
                <div className="clinical-text-content">
                    <h2 className="clinical-main-title">
                        {isEditing ? 'ACTUALIZACIÓN DE EXPEDIENTE' : 'NOTA DE EVOLUCIÓN NUTRICIONAL'}
                    </h2>
                    <div className="clinical-meta-info">
                        <span className="meta-tag">DEPARTAMENTO DE NUTRICIÓN</span>
                        <span className="meta-separator">•</span>
                        <span className="meta-tag">HISTORIA CLÍNICA (S.O.A.P.)</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="soap-form">

                {/* ==================== S - SUBJETIVO ==================== */}
                <div className="soap-section soap-s">
                    <div className="section-header">
                        <span className="section-letter">S</span>
                        <span className="section-title">Subjetivo - Información del Paciente</span>
                    </div>

                    <div className="form-group">
                        <label>Motivo de Consulta / Historia Dietética</label>
                        <textarea
                            name="subjective"
                            placeholder="Motivo de consulta, recordatorio 24h, historial alimentario..."
                            value={formData.subjective}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Síntomas Reportados</label>
                        <textarea
                            name="symptoms"
                            placeholder="Fatiga, dolores de cabeza, problemas digestivos, antojos..."
                            value={formData.symptoms}
                            onChange={handleChange}
                            rows="2"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Apetito</label>
                            <select name="appetite" value={formData.appetite} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Normal">Normal</option>
                                <option value="Aumentado">Aumentado</option>
                                <option value="Disminuido">Disminuido</option>
                                <option value="Variable">Variable</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Calidad del Sueño</label>
                            <select name="sleep_quality" value={formData.sleep_quality} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Buena (7-9h)">Buena (7-9h)</option>
                                <option value="Regular (5-6h)">Regular (5-6h)</option>
                                <option value="Mala (<5h)">Mala (&lt;5h)</option>
                                <option value="Insomnio">Insomnio</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nivel de Estrés</label>
                            <select name="stress_level" value={formData.stress_level} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Bajo">Bajo</option>
                                <option value="Moderado">Moderado</option>
                                <option value="Alto">Alto</option>
                                <option value="Muy alto">Muy alto</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Actividad Física</label>
                            <select name="physical_activity" value={formData.physical_activity} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Sedentario">Sedentario</option>
                                <option value="Ligera (1-2x/sem)">Ligera (1-2x/sem)</option>
                                <option value="Moderada (3-4x/sem)">Moderada (3-4x/sem)</option>
                                <option value="Intensa (5+/sem)">Intensa (5+/sem)</option>
                                <option value="Atleta">Atleta</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Consumo de Agua</label>
                            <select name="water_intake" value={formData.water_intake} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="<1 litro/día">&lt;1 litro/día</option>
                                <option value="1-2 litros/día">1-2 litros/día</option>
                                <option value="2-3 litros/día">2-3 litros/día</option>
                                <option value=">3 litros/día">&gt;3 litros/día</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Hábitos Intestinales</label>
                            <select name="bowel_habits" value={formData.bowel_habits} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Regular (1-2/día)">Regular (1-2/día)</option>
                                <option value="Estreñimiento">Estreñimiento</option>
                                <option value="Diarrea">Diarrea</option>
                                <option value="Alternante">Alternante</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ==================== O - OBJETIVO ==================== */}
                <div className="soap-section soap-o">
                    <div className="section-header">
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <span className="section-letter">O</span>
                            <span className="section-title">Objetivo - Datos Medibles</span>
                        </div>

                        {/* --- BOTÓN DE HERRAMIENTAS NUTRICIONALES --- */}
                        <button
                            type="button"
                            className="btn-tool"
                            onClick={() => setShowTools(true)}
                            title="Abrir Calculadora Metabólica"
                            style={{
                                marginLeft:'auto',
                                background:'#e0f2fe',
                                color:'#0284c7',
                                border:'1px solid #bae6fd',
                                padding:'6px 12px',
                                borderRadius:'6px',
                                cursor:'pointer',
                                display:'flex',
                                alignItems:'center',
                                gap:'6px',
                                fontSize:'0.85rem',
                                fontWeight:'600',
                                transition: 'all 0.2s'
                            }}
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Calcular Requerimientos
                        </button>
                    </div>

                    {/* Antropometría */}
                    <div className="subsection">
                        <h4>📏 Antropometría</h4>
                        <div className="metrics-grid">
                            <div className="input-group">
                                <label>Peso (kg)</label>
                                <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Talla (cm)</label>
                                <input type="number" step="0.1" name="height" value={formData.height} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>IMC (kg/m²)</label>
                                <input type="number" name="bmi" value={formData.bmi} readOnly className="read-only" />
                            </div>
                            <div className="input-group">
                                <label>Peso Ideal (kg)</label>
                                <input type="number" step="0.1" name="ideal_weight" value={formData.ideal_weight} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="metrics-grid">
                            <div className="input-group">
                                <label>Cintura (cm)</label>
                                <input type="number" step="0.1" name="waist" value={formData.waist} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Cadera (cm)</label>
                                <input type="number" step="0.1" name="hip" value={formData.hip} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>ICC</label>
                                <input type="number" name="waist_hip_ratio" value={formData.waist_hip_ratio} readOnly className="read-only" />
                            </div>
                            <div className="input-group">
                                <label>% Grasa Corporal</label>
                                <input type="number" step="0.1" name="body_fat" value={formData.body_fat} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Masa Muscular (kg)</label>
                                <input type="number" step="0.1" name="muscle_mass" value={formData.muscle_mass} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Signos Vitales */}
                    <div className="subsection">
                        <h4>❤️ Signos Vitales</h4>
                        <div className="metrics-grid three-cols">
                            <div className="input-group">
                                <label>Presión Arterial (mmHg)</label>
                                <input type="text" name="blood_pressure" placeholder="120/80" value={formData.blood_pressure} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Frecuencia Cardíaca (lpm)</label>
                                <input type="number" name="heart_rate" value={formData.heart_rate} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Temperatura (°C)</label>
                                <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Datos Bioquímicos */}
                    <div className="subsection">
                        <h4>🧪 Datos Bioquímicos (Laboratorios)</h4>
                        <div className="metrics-grid">
                            <div className="input-group">
                                <label>Glucosa (mg/dL)</label>
                                <input type="number" step="0.1" name="glucose" value={formData.glucose} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>HbA1c (%)</label>
                                <input type="number" step="0.1" name="hba1c" value={formData.hba1c} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Colesterol Total (mg/dL)</label>
                                <input type="number" step="0.1" name="cholesterol" value={formData.cholesterol} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Triglicéridos (mg/dL)</label>
                                <input type="number" step="0.1" name="triglycerides" value={formData.triglycerides} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="metrics-grid">
                            <div className="input-group">
                                <label>HDL (mg/dL)</label>
                                <input type="number" step="0.1" name="hdl" value={formData.hdl} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>LDL (mg/dL)</label>
                                <input type="number" step="0.1" name="ldl" value={formData.ldl} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Hemoglobina (g/dL)</label>
                                <input type="number" step="0.1" name="hemoglobin" value={formData.hemoglobin} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Albúmina (g/dL)</label>
                                <input type="number" step="0.1" name="albumin" value={formData.albumin} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Otros Hallazgos Clínicos</label>
                        <textarea
                            name="objective_notes"
                            placeholder="Examen físico, signos clínicos observados, otros laboratorios..."
                            value={formData.objective_notes}
                            onChange={handleChange}
                            rows="2"
                        />
                    </div>
                </div>

                {/* ==================== A - ANÁLISIS ==================== */}
                <div className="soap-section soap-a">
                    <div className="section-header">
                        <span className="section-letter">A</span>
                        <span className="section-title">Análisis - Diagnóstico Nutricional</span>
                    </div>

                    {/* PES Statement */}
                    <div className="pes-box">
                        <h4>📌 Diagnóstico PES (Problema - Etiología - Signos/Síntomas)</h4>
                        <div className="pes-field">
                            <span className="pes-label">P</span>
                            <input
                                type="text"
                                name="pes_problem"
                                placeholder="Problema: ej. Ingesta excesiva de sodio, Bajo peso..."
                                value={formData.pes_problem}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="pes-field">
                            <span className="pes-label">E</span>
                            <input
                                type="text"
                                name="pes_etiology"
                                placeholder="Etiología: relacionado con... ej. consumo frecuente de alimentos procesados"
                                value={formData.pes_etiology}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="pes-field">
                            <span className="pes-label">S</span>
                            <input
                                type="text"
                                name="pes_signs"
                                placeholder="Signos/Síntomas: evidenciado por... ej. PA 150/95, sodio 4000mg/día"
                                value={formData.pes_signs}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Interpretación / Notas del Análisis</label>
                        <textarea
                            name="assessment_notes"
                            placeholder="Interpretación general de los datos, conclusiones del análisis..."
                            value={formData.assessment_notes}
                            onChange={handleChange}
                            rows="2"
                        />
                    </div>

                    <div className="form-row three-cols">
                        <div className="form-group">
                            <label>Estado Nutricional</label>
                            <select name="nutritional_status" value={formData.nutritional_status} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Normal">Normal</option>
                                <option value="Desnutrición leve">Desnutrición leve</option>
                                <option value="Desnutrición moderada">Desnutrición moderada</option>
                                <option value="Desnutrición severa">Desnutrición severa</option>
                                <option value="Sobrepeso">Sobrepeso</option>
                                <option value="Obesidad I">Obesidad I</option>
                                <option value="Obesidad II">Obesidad II</option>
                                <option value="Obesidad III">Obesidad III</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nivel de Riesgo</label>
                            <select name="risk_level" value={formData.risk_level} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Bajo">Bajo</option>
                                <option value="Moderado">Moderado</option>
                                <option value="Alto">Alto</option>
                                <option value="Muy alto">Muy alto</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Prioridad de Atención</label>
                            <select name="priority" value={formData.priority} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Rutina">Rutina</option>
                                <option value="Prioridad">Prioridad</option>
                                <option value="Urgente">Urgente</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ==================== P - PLAN ==================== */}
                <div className="soap-section soap-p">
                    <div className="section-header">
                        <span className="section-letter">P</span>
                        <span className="section-title">Plan - Intervención y Tratamiento</span>
                    </div>

                    <div className="form-group">
                        <label>🎯 Metas del Tratamiento (SMART)</label>
                        <textarea
                            name="treatment_goals"
                            placeholder="Metas específicas, medibles, alcanzables, relevantes y con tiempo definido..."
                            value={formData.treatment_goals}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    {/* Prescripción Dietética */}
                    <div className="subsection">
                        <h4>🍽️ Prescripción Dietética</h4>
                        <div className="metrics-grid">
                            <div className="input-group">
                                <label>Kcal/día</label>
                                <input type="number" name="calories_prescribed" value={formData.calories_prescribed} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Proteína (g)</label>
                                <input type="number" name="protein_prescribed" value={formData.protein_prescribed} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Carbohidratos (g)</label>
                                <input type="number" name="carbs_prescribed" value={formData.carbs_prescribed} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Grasas (g)</label>
                                <input type="number" name="fats_prescribed" value={formData.fats_prescribed} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Tipo de Dieta / Descripción</label>
                            <input
                                type="text"
                                name="diet_type"
                                placeholder="Ej: Dieta hipocalórica, mediterránea, DASH, cetogénica..."
                                value={formData.diet_type}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>💊 Suplementación Recomendada</label>
                        <textarea
                            name="supplements_recommended"
                            placeholder="Vitaminas, minerales, proteína en polvo, omega-3..."
                            value={formData.supplements_recommended}
                            onChange={handleChange}
                            rows="2"
                        />
                    </div>

                    <div className="form-group">
                        <label>📚 Educación Nutricional Brindada</label>
                        <textarea
                            name="education_provided"
                            placeholder="Temas cubiertos, materiales entregados, técnicas enseñadas..."
                            value={formData.education_provided}
                            onChange={handleChange}
                            rows="2"
                        />
                    </div>

                    <div className="form-group">
                        <label>↗️ Referencias / Derivaciones</label>
                        <input
                            type="text"
                            name="referrals"
                            placeholder="Médico, psicólogo, endocrinólogo, etc."
                            value={formData.referrals}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group next-apt-group">
                        <label>📅 Próxima Cita</label>
                        <input
                            type="date"
                            name="next_appointment"
                            value={formData.next_appointment}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <button type="submit" className="save-btn">
                    {isEditing ? '💾 Guardar Cambios' : '✅ Finalizar Consulta'}
                </button>
            </form>

            {/* --- MODAL DE HERRAMIENTAS NUTRICIONALES --- */}
            {showTools && (
                <div className="modal-overlay" style={{zIndex: 2000}}>
                    <div className="modal-content" style={{maxWidth:'900px', width:'95%', padding:0, height:'auto', maxHeight:'90vh'}}>
                        <NutritionalTools
                            patientData={{
                                full_name: patient?.full_name || "Paciente",
                                weight: formData.weight, // Usamos el peso que está escribiendo actualmente
                                height: formData.height,
                                age: null, // Dejamos que lo calcule con birth_date
                                birth_date: patient?.birth_date,
                                gender: patient?.gender || 'Masculino'
                            }}
                            onSave={handleApplyCalculations}
                            onCancel={() => setShowTools(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SoapConsultation;