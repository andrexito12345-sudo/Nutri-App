import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './PatientFileModal.css';
import NutritionalTools from './NutritionalTools';

const PatientFileModal = ({ isOpen, onClose, patient, consultations = [], weightHistory = [] }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ficha');
    const [tabsMenuOpen, setTabsMenuOpen] = useState(false);
    const [calculationHistory, setCalculationHistory] = useState([]);


    useEffect(() => {
        if (activeTab === 'herramientas' && patient?.id) {
            try {
                const saved = localStorage.getItem(`calc_history_${patient.id}`);
                if (saved) {
                    setCalculationHistory(JSON.parse(saved));
                } else {
                    setCalculationHistory([]);
                }
            } catch (error) {
                console.error("Error cargando historial:", error);
                setCalculationHistory([]);
            }
        }
    }, [activeTab, patient]);

    const handleSaveCalculation = (calculationData) => {
        const newCalculation = {
            id: Date.now(),
            patientId: patient.id,
            date: calculationData.date,
            bmr: calculationData.bmr,
            tdee: calculationData.tdee,
            targetCalories: calculationData.targetCalories,
            macros: calculationData.macros,
            config: calculationData.config,
            patientWeight: calculationData.patientWeight,
            patientHeight: calculationData.patientHeight,
            patientAge: calculationData.patientAge
        };

        const updatedHistory = [newCalculation, ...calculationHistory];
        setCalculationHistory(updatedHistory);
        localStorage.setItem(`calc_history_${patient.id}`, JSON.stringify(updatedHistory));
        alert("✅ Cálculo guardado en el historial del paciente");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return "—";
        return `${new Date().getFullYear() - new Date(birthDate).getFullYear()} años`;
    };

    const getLatestMetrics = () => {
        if (!consultations || consultations.length === 0) return { weight: '', height: '' };
        const latestWithData = consultations.find(c => c.weight > 0 && c.height > 0);
        if (latestWithData) {
            return { weight: latestWithData.weight, height: latestWithData.height };
        }
        return { weight: '', height: '' };
    };

    const latestMetrics = getLatestMetrics();
    const toolData = {
        ...patient,
        weight: latestMetrics.weight,
        height: latestMetrics.height
    };

    const DataItem = ({ label, value, suffix = '' }) => {
        if (!value) return null;
        return (
            <div className="data-item-inline">
                <span className="data-label-inline">{label}</span>
                <span className="data-value-inline">{value}{suffix}</span>
            </div>
        );
    };

    const ConsultationCard = ({ consultation, formatDate, navigate }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        return (
            <article className="consultation-card" style={{
                background: 'white',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '16px',
                overflow: 'hidden',
                transition: 'all 0.2s'
            }}>
                {/* HEADER CLICKEABLE */}
                <div
                    className="consultation-header"
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: isExpanded ? '#f8fafc' : 'white',
                        borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        {/* ICONO COLLAPSE */}
                        <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                                color: '#64748b'
                            }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>

                        {/* FECHA */}
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span style={{fontWeight:'600', color:'#334155', fontSize:'0.95rem'}}>
                            {formatDate(consultation.consultation_date)}
                        </span>
                        </div>

                        {/* PESO Y IMC QUICK INFO */}
                        {consultation.weight && (
                            <span style={{
                                padding: '4px 10px',
                                background: '#f1f5f9',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                color: '#64748b',
                                fontWeight: '500'
                            }}>
                            {consultation.weight} kg {consultation.bmi && `• IMC ${consultation.bmi}`}
                        </span>
                        )}
                    </div>

                    {/* BOTÓN EDITAR */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/consulta/editar/${consultation.id}`);
                        }}
                        style={{
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#d97706'}
                        onMouseOut={(e) => e.target.style.background = '#f59e0b'}
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                    </button>
                </div>

                {/* CONTENIDO COLAPSABLE */}
                {isExpanded && (
                    <div className="soap-sections" style={{padding: '20px'}}>

                        {/* S: SUBJETIVO */}
                        <div className="soap-section soap-subjective">
                            <div className="soap-indicator indicator-subjective"></div>
                            <div className="soap-content">
                                <h4 className="soap-section-title">Subjetivo</h4>
                                {consultation.subjective && (
                                    <div className="soap-field">
                                        <span className="field-label">Motivo/Historia:</span>
                                        <p className="field-text">{consultation.subjective}</p>
                                    </div>
                                )}
                                {consultation.symptoms && (
                                    <div className="soap-field">
                                        <span className="field-label" style={{color:'#ef4444'}}>Síntomas:</span>
                                        <p className="field-text">{consultation.symptoms}</p>
                                    </div>
                                )}
                                {(consultation.appetite || consultation.sleep_quality || consultation.stress_level || consultation.physical_activity || consultation.water_intake || consultation.bowel_habits) && (
                                    <div className="measurement-group">
                                        <span className="group-label">Estilo de Vida</span>
                                        <div className="measurements-grid">
                                            {consultation.appetite && <div className="measurement-item"><span>Apetito</span><strong>{consultation.appetite}</strong></div>}
                                            {consultation.sleep_quality && <div className="measurement-item"><span>Sueño</span><strong>{consultation.sleep_quality}</strong></div>}
                                            {consultation.stress_level && <div className="measurement-item"><span>Estrés</span><strong>{consultation.stress_level}</strong></div>}
                                            {consultation.physical_activity && <div className="measurement-item"><span>Actividad</span><strong>{consultation.physical_activity}</strong></div>}
                                            {consultation.water_intake && <div className="measurement-item"><span>Agua</span><strong>{consultation.water_intake}</strong></div>}
                                            {consultation.bowel_habits && <div className="measurement-item"><span>Intestino</span><strong>{consultation.bowel_habits}</strong></div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* O: OBJETIVO */}
                        <div className="soap-section soap-objective">
                            <div className="soap-indicator indicator-objective"></div>
                            <div className="soap-content">
                                <h4 className="soap-section-title">Objetivo</h4>
                                {(consultation.weight || consultation.height || consultation.bmi) && (
                                    <div className="measurement-group">
                                        <span className="group-label">Antropometría</span>
                                        <div className="measurements-grid">
                                            {consultation.weight && <div className="measurement-item"><span>Peso</span><strong>{consultation.weight} kg</strong></div>}
                                            {consultation.height && <div className="measurement-item"><span>Talla</span><strong>{consultation.height} cm</strong></div>}
                                            {consultation.bmi && <div className="measurement-item"><span>IMC</span><strong>{consultation.bmi}</strong></div>}
                                            {consultation.waist && <div className="measurement-item"><span>Cintura</span><strong>{consultation.waist} cm</strong></div>}
                                            {consultation.hip && <div className="measurement-item"><span>Cadera</span><strong>{consultation.hip} cm</strong></div>}
                                            {consultation.body_fat && <div className="measurement-item"><span>Grasa</span><strong>{consultation.body_fat}%</strong></div>}
                                            {consultation.muscle_mass && <div className="measurement-item"><span>Músculo</span><strong>{consultation.muscle_mass} kg</strong></div>}
                                        </div>
                                    </div>
                                )}
                                {(consultation.blood_pressure || consultation.glucose || consultation.cholesterol) && (
                                    <div className="measurement-group">
                                        <span className="group-label">Clínico / Laboratorio</span>
                                        <div className="measurements-grid">
                                            {consultation.blood_pressure && <div className="measurement-item"><span>PA</span><strong>{consultation.blood_pressure}</strong></div>}
                                            {consultation.heart_rate && <div className="measurement-item"><span>FC</span><strong>{consultation.heart_rate} lpm</strong></div>}
                                            {consultation.temperature && <div className="measurement-item"><span>Temp</span><strong>{consultation.temperature}°C</strong></div>}
                                            {consultation.glucose && <div className="measurement-item"><span>Glucosa</span><strong>{consultation.glucose} mg/dL</strong></div>}
                                            {consultation.hba1c && <div className="measurement-item"><span>HbA1c</span><strong>{consultation.hba1c}%</strong></div>}
                                            {consultation.cholesterol && <div className="measurement-item"><span>Colest.</span><strong>{consultation.cholesterol}</strong></div>}
                                            {consultation.triglycerides && <div className="measurement-item"><span>Triglic.</span><strong>{consultation.triglycerides}</strong></div>}
                                        </div>
                                    </div>
                                )}
                                {consultation.objective_notes && <p className="field-notes">"{consultation.objective_notes}"</p>}
                            </div>
                        </div>

                        {/* A: ANÁLISIS */}
                        <div className="soap-section soap-assessment">
                            <div className="soap-indicator indicator-assessment"></div>
                            <div className="soap-content">
                                <h4 className="soap-section-title">Análisis</h4>
                                {consultation.pes_problem && (
                                    <div className="pes-diagnosis">
                                        <div className="pes-item"><strong>P:</strong> {consultation.pes_problem}</div>
                                        {consultation.pes_etiology && <div className="pes-item"><strong>E:</strong> {consultation.pes_etiology}</div>}
                                        {consultation.pes_signs && <div className="pes-item"><strong>S:</strong> {consultation.pes_signs}</div>}
                                    </div>
                                )}
                                <div className="clinical-data-row">
                                    {consultation.nutritional_status && <div className="data-item-inline"><span className="data-label-inline">Estado</span><span className="data-value-inline">{consultation.nutritional_status}</span></div>}
                                    {consultation.risk_level && <div className="data-item-inline"><span className="data-label-inline">Riesgo</span><span className="data-value-inline">{consultation.risk_level}</span></div>}
                                    {consultation.priority && <div className="data-item-inline"><span className="data-label-inline">Prioridad</span><span className="data-value-inline">{consultation.priority}</span></div>}
                                </div>
                                {consultation.assessment_notes && <p className="field-notes">{consultation.assessment_notes}</p>}
                            </div>
                        </div>

                        {/* P: PLAN */}
                        <div className="soap-section soap-plan">
                            <div className="soap-indicator indicator-plan"></div>
                            <div className="soap-content">
                                <h4 className="soap-section-title">Plan</h4>
                                {consultation.treatment_goals && (
                                    <div className="soap-field">
                                        <span className="field-label">Metas:</span>
                                        <p className="field-text">{consultation.treatment_goals}</p>
                                    </div>
                                )}
                                {consultation.calories_prescribed && (
                                    <div className="prescription-box">
                                        <span className="prescription-label">Prescripción</span>
                                        <div className="prescription-grid">
                                            <div className="prescription-item"><span>Calorías</span><strong>{consultation.calories_prescribed} kcal</strong></div>
                                            {consultation.protein_prescribed && <div className="prescription-item"><span>Proteína</span><strong>{consultation.protein_prescribed}g</strong></div>}
                                            {consultation.carbs_prescribed && <div className="prescription-item"><span>Carbos</span><strong>{consultation.carbs_prescribed}g</strong></div>}
                                            {consultation.fats_prescribed && <div className="prescription-item"><span>Grasas</span><strong>{consultation.fats_prescribed}g</strong></div>}
                                        </div>
                                    </div>
                                )}
                                {consultation.diet_type && (
                                    <div className="soap-field">
                                        <span className="field-label">Dieta:</span>
                                        <p className="field-text">{consultation.diet_type}</p>
                                    </div>
                                )}
                                {consultation.supplements_recommended && (
                                    <div className="soap-field">
                                        <span className="field-label">Suplementos:</span>
                                        <p className="field-text">{consultation.supplements_recommended}</p>
                                    </div>
                                )}
                                {consultation.next_appointment && (
                                    <div className="next-appointment">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Próxima Cita: <strong>{formatDate(consultation.next_appointment)}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </article>
        );
    };

    const tabStyle = {
        padding: '12px 20px',
        background: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        color: '#64748b',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const activeTabStyle = {
        ...tabStyle,
        color: '#0284c7',
        borderBottom: '3px solid #0284c7'
    };

    if (!isOpen || !patient) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>


                <div className="modal-header" style={{borderBottom:'none', paddingBottom:0}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', marginBottom:'20px', paddingRight:'20px'}}>
                        <div className="modal-patient-info">
                            <div className="patient-avatar patient-avatar--large">
                                {patient.full_name ? patient.full_name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <div className="patient-header-text">
                                <h2 className="patient-name">{patient.full_name}</h2>
                                <p className="patient-contact">{patient.phone} {patient.email && `• ${patient.email}`}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="patient-modal-close"
                            onClick={onClose}
                            aria-label="Cerrar"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                    </div>
                    <div className="patient-tabs-wrapper">
                        {/* --- VISTA ESCRITORIO: tabs horizontales --- */}
                        <div className="patient-tabs-bar">
                            <button
                                className={
                                    "patient-tab" + (activeTab === "ficha" ? " is-active" : "")
                                }
                                onClick={() => {
                                    setActiveTab("ficha");
                                    setTabsMenuOpen(false);
                                }}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Ficha
                            </button>

                            <button
                                className={
                                    "patient-tab" + (activeTab === "evolucion" ? " is-active" : "")
                                }
                                onClick={() => {
                                    setActiveTab("evolucion");
                                    setTabsMenuOpen(false);
                                }}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Evolución
                            </button>

                            <button
                                className={
                                    "patient-tab" + (activeTab === "historial" ? " is-active" : "")
                                }
                                onClick={() => {
                                    setActiveTab("historial");
                                    setTabsMenuOpen(false);
                                }}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Historial
                            </button>

                            <button
                                className={
                                    "patient-tab patient-tab--tools" +
                                    (activeTab === "herramientas" ? " is-active" : "")
                                }
                                onClick={() => {
                                    setActiveTab("herramientas");
                                    setTabsMenuOpen(false);
                                }}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Herramientas
                            </button>
                        </div>

                        {/* --- VISTA MÓVIL: botón + menú desplegable --- */}
                        <div className="patient-tabs-mobile">
                            <button
                                type="button"
                                className="patient-tabs-toggle"
                                onClick={() => setTabsMenuOpen((v) => !v)}
                            >
                                  <span>
                                    {activeTab === "ficha" && "Ficha"}
                                      {activeTab === "evolucion" && "Evolución"}
                                      {activeTab === "historial" && "Historial"}
                                      {activeTab === "herramientas" && "Herramientas"}
                                  </span>
                                <span className="patient-tabs-toggle-icon">
                                {tabsMenuOpen ? "▲" : "▼"}
                                </span>
                            </button>

                            {tabsMenuOpen && (
                                <div className="patient-tabs-dropdown">
                                    <button
                                        type="button"
                                        className={
                                            "patient-tabs-dropdown-item" +
                                            (activeTab === "ficha" ? " is-active" : "")
                                        }
                                        onClick={() => {
                                            setActiveTab("ficha");
                                            setTabsMenuOpen(false);
                                        }}
                                    >
                                        Ficha
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            "patient-tabs-dropdown-item" +
                                            (activeTab === "evolucion" ? " is-active" : "")
                                        }
                                        onClick={() => {
                                            setActiveTab("evolucion");
                                            setTabsMenuOpen(false);
                                        }}
                                    >
                                        Evolución
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            "patient-tabs-dropdown-item" +
                                            (activeTab === "historial" ? " is-active" : "")
                                        }
                                        onClick={() => {
                                            setActiveTab("historial");
                                            setTabsMenuOpen(false);
                                        }}
                                    >
                                        Historial
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            "patient-tabs-dropdown-item" +
                                            (activeTab === "herramientas" ? " is-active" : "")
                                        }
                                        onClick={() => {
                                            setActiveTab("herramientas");
                                            setTabsMenuOpen(false);
                                        }}
                                    >
                                        Herramientas
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>



                </div>

                <div className="modal-body" style={{paddingTop:'20px'}}>
                    {activeTab === 'ficha' && (
                        <section className="expediente-section">
                            <div className="professional-info-grid">
                                <div className="info-card">
                                    <div className="info-card-header">
                                        <svg className="info-card-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        <h4 className="info-card-title">Perfil</h4>
                                    </div>
                                    <div className="data-row">
                                        <DataItem label="Género" value={patient.gender} />
                                        <DataItem label="Edad" value={calculateAge(patient.birth_date)} />
                                        <DataItem label="Nacimiento" value={formatDate(patient.birth_date)} />
                                        <DataItem label="Ocupación" value={patient.occupation} />
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-card-header">
                                        <svg className="info-card-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                        <h4 className="info-card-title">Información Médica</h4>
                                    </div>
                                    <div className="data-row">
                                        <DataItem label="Tipo de Sangre" value={patient.blood_type} />
                                        <div className="data-item-inline">
                                            <span className="data-label-inline">Alergias</span>
                                            <span className={`data-value-inline ${patient.allergies ? 'alert-value' : ''}`}>{patient.allergies || "Ninguna registrada"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-card-header">
                                        <svg className="info-card-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        <h4 className="info-card-title">Contacto</h4>
                                    </div>
                                    <div className="data-row">
                                        <DataItem label="Dirección" value={patient.address} />
                                        <DataItem label="Contacto de Emergencia" value={patient.emergency_contact} />
                                        <DataItem label="Tel. Emergencia" value={patient.emergency_phone} />
                                    </div>
                                </div>
                                {patient.notes && (
                                    <div className="info-card full-width-card">
                                        <div className="info-card-header">
                                            <svg className="info-card-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            <h4 className="info-card-title">Notas Generales</h4>
                                        </div>
                                        <p className="notes-text">{patient.notes}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'evolucion' && (
                        <section className="expediente-section">
                            <h3 className="expediente-section-title">
                                <svg className="section-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Evolución del Peso y Composición
                            </h3>
                            {weightHistory && weightHistory.length > 0 ? (
                                <div className="chart-container" style={{height:'400px'}}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={weightHistory}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" stroke="#64748b" tickFormatter={(val) => formatDate(val).slice(0,6)} />
                                            <YAxis yAxisId="left" orientation="left" stroke="#4B0082" label={{ value: 'Kg', angle: -90, position: 'insideLeft' }} />
                                            <YAxis yAxisId="right" orientation="right" stroke="#e67e22" label={{ value: '% Grasa', angle: 90, position: 'insideRight' }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#4B0082" strokeWidth={3} dot={{ r: 4 }} />
                                            <Line yAxisId="left" type="monotone" dataKey="muscle_mass" name="Músculo (kg)" stroke="#10b981" strokeWidth={2} />
                                            <Line yAxisId="right" type="monotone" dataKey="body_fat_percentage" name="Grasa (%)" stroke="#e67e22" strokeWidth={2} strokeDasharray="5 5" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{textAlign:'center', padding:'40px', color:'#64748b'}}><p>No hay suficientes datos registrados para mostrar la gráfica.</p></div>
                            )}
                        </section>
                    )}

                    {activeTab === 'historial' && (
                        <section className="expediente-section">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                                <h3 className="expediente-section-title" style={{margin:0}}>
                                    <svg className="section-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Historial de Consultas SOAP ({consultations?.length || 0})
                                </h3>
                                <button
                                    className="btn-new-consultation"
                                    onClick={() => navigate(`/consulta/nueva/${patient.id}`)}
                                    style={{
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nueva Consulta
                                </button>
                            </div>

                            {consultations && consultations.length > 0 ? (
                                <div className="consultations-timeline">
                                    {consultations.map((consultation, idx) => (
                                        <ConsultationCard
                                            key={consultation.id || idx}
                                            consultation={consultation}
                                            formatDate={formatDate}
                                            navigate={navigate}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div style={{textAlign:'center', padding:'60px 20px', color:'#94a3b8', background:'white', borderRadius:'12px', border:'2px dashed #e2e8f0'}}>
                                    <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{margin:'0 auto 16px', opacity:0.3}}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p style={{fontSize:'1.1rem', fontWeight:'600', color:'#64748b', margin:'0 0 8px'}}>No hay consultas registradas</p>
                                    <p style={{fontSize:'0.9rem', color:'#cbd5e1', margin:0}}>Comienza el seguimiento clínico creando la primera consulta</p>
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'herramientas' && (
                        <div className="herramientas-content">
                            <NutritionalTools
                                patientData={toolData}
                                onCancel={() => setActiveTab('ficha')}
                                onSave={handleSaveCalculation}
                                actionLabel="Guardar en Historial"
                            />

                            <div className="calculation-history-section">
                                <div className="history-header">
                                    <h4 className="history-title">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Historial de Cálculos ({calculationHistory.length})
                                    </h4>
                                </div>

                                {calculationHistory.length === 0 ? (
                                    <div className="history-empty">
                                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p>No hay cálculos guardados aún</p>
                                        <span>Los cálculos que guardes aparecerán aquí</span>
                                    </div>
                                ) : (
                                    <div className="history-list">
                                        {calculationHistory.map((calc) => (
                                            <div key={calc.id} className="history-card">
                                                <div className="history-card-header">
                                                    <div className="history-date">
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatDateTime(calc.date)}
                                                    </div>
                                                    <div className={`history-badge ${
                                                        calc.config.goal === 'cut' ? 'badge-cut' :
                                                            calc.config.goal === 'bulk' ? 'badge-bulk' : 'badge-maint'
                                                    }`}>
                                                        {calc.config.goal === 'cut' ? 'PÉRDIDA' :
                                                            calc.config.goal === 'bulk' ? 'GANANCIA' : 'MANT.'}
                                                    </div>
                                                </div>

                                                <div className="history-card-body">
                                                    <div className="history-metrics">
                                                        <div className="history-metric">
                                                            <span className="metric-label">TMB</span>
                                                            <span className="metric-value">{calc.bmr.toLocaleString('es-EC')} kcal</span>
                                                        </div>
                                                        <div className="history-metric">
                                                            <span className="metric-label">GET</span>
                                                            <span className="metric-value">{calc.tdee.toLocaleString('es-EC')} kcal</span>
                                                        </div>
                                                        <div className="history-metric highlight">
                                                            <span className="metric-label">Meta</span>
                                                            <span className="metric-value">{calc.targetCalories.toLocaleString('es-EC')} kcal</span>
                                                        </div>
                                                    </div>

                                                    <div className="history-macros">
                                                        <span className="macro-protein">P: {calc.macros.protein.grams}g ({calc.macros.protein.percent}%)</span>
                                                        <span className="macro-carbs">C: {calc.macros.carbs.grams}g ({calc.macros.carbs.percent}%)</span>
                                                        <span className="macro-fats">G: {calc.macros.fats.grams}g ({calc.macros.fats.percent}%)</span>
                                                    </div>

                                                    <div className="history-config">
                                                        <span>{calc.config.formula === 'mifflin' ? 'Mifflin-St Jeor' : 'Harris-Benedict'}</span>
                                                        <span>•</span>
                                                        <span>{calc.patientWeight}kg / {calc.patientHeight}cm</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientFileModal;