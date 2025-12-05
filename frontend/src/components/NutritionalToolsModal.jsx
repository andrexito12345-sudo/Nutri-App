import React, { useState, useEffect } from 'react';
import {
    calculateNutritionalPlan,
    validatePatientData,
    ACTIVITY_FACTORS,
    STRESS_FACTORS
} from '../utils/nutritionalCalculations';
import './NutritionalToolsModal.css';

const NutritionalToolsModal = ({
                                   isOpen,
                                   onClose,
                                   patient,
                                   consultation = {},
                                   onApplyToPlan
                               }) => {
    // Estados para los cálculos
    const [calculationData, setCalculationData] = useState({
        weight: consultation.weight || patient.weight || '',
        height: consultation.height || patient.height || '',
        age: patient.birth_date ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear() : '',
        gender: patient.gender || '',
        activityLevel: consultation.physical_activity || 'Sedentario',
        goal: 'Mantenimiento',
        condition: 'Normal',
        stressFactor: 'Normal',
        formula: 'Mifflin',
        numberOfMeals: 5
    });

    const [results, setResults] = useState(null);
    const [activeTab, setActiveTab] = useState('calculator'); // calculator | history
    const [validationErrors, setValidationErrors] = useState([]);

    // Calcular automáticamente cuando cambian los datos
    useEffect(() => {
        if (isOpen && calculationData.weight && calculationData.height && calculationData.age && calculationData.gender) {
            handleCalculate();
        }
    }, [isOpen]);

    const handleCalculate = () => {
        // Validar datos
        const validation = validatePatientData(calculationData);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }

        setValidationErrors([]);

        // Realizar cálculos
        const calculationResults = calculateNutritionalPlan(calculationData);
        setResults(calculationResults);
    };

    const handleInputChange = (field, value) => {
        setCalculationData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyResults = () => {
        if (results && onApplyToPlan) {
            const dataToApply = {
                calories_prescribed: results.calorieGoal.calories,
                protein_prescribed: results.macros.protein.grams,
                carbs_prescribed: results.macros.carbs.grams,
                fats_prescribed: results.macros.fats.grams,
                tmb_calculated: results.tmb,
                get_calculated: results.get,
                formula_used: calculationData.formula,
                activity_factor: calculationData.activityLevel,
                distribution_strategy: `${results.macros.protein.percentage}/${results.macros.carbs.percentage}/${results.macros.fats.percentage}`
            };
            onApplyToPlan(dataToApply);
            alert('✅ Valores aplicados al plan de tratamiento');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="nutritional-modal-overlay" onClick={onClose}>
            <div className="nutritional-modal-content" onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className="nutritional-modal-header">
                    <div className="header-title-group">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div>
                            <h2>Herramientas Nutricionales</h2>
                            <p>{patient.full_name}</p>
                        </div>
                    </div>
                    <button className="btn-close-nutritional" onClick={onClose}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* TABS */}
                <div className="nutritional-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
                        onClick={() => setActiveTab('calculator')}
                    >
                        Calculadora
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Historial
                    </button>
                </div>

                {/* BODY */}
                <div className="nutritional-modal-body">

                    {activeTab === 'calculator' && (
                        <>
                            {/* FORMULARIO DE ENTRADA */}
                            <div className="calculation-inputs">
                                <h3 className="section-subtitle">Datos del Paciente</h3>

                                <div className="input-grid">
                                    <div className="input-field">
                                        <label>Peso (kg)</label>
                                        <input
                                            type="number"
                                            value={calculationData.weight}
                                            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                                            step="0.1"
                                        />
                                    </div>

                                    <div className="input-field">
                                        <label>Talla (cm)</label>
                                        <input
                                            type="number"
                                            value={calculationData.height}
                                            onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                                            step="0.1"
                                        />
                                    </div>

                                    <div className="input-field">
                                        <label>Edad (años)</label>
                                        <input
                                            type="number"
                                            value={calculationData.age}
                                            readOnly
                                            className="readonly-input"
                                        />
                                    </div>

                                    <div className="input-field">
                                        <label>Género</label>
                                        <input
                                            type="text"
                                            value={calculationData.gender}
                                            readOnly
                                            className="readonly-input"
                                        />
                                    </div>
                                </div>

                                <h3 className="section-subtitle" style={{marginTop: '20px'}}>Parámetros de Cálculo</h3>

                                <div className="input-grid">
                                    <div className="input-field">
                                        <label>Fórmula TMB</label>
                                        <select
                                            value={calculationData.formula}
                                            onChange={(e) => handleInputChange('formula', e.target.value)}
                                        >
                                            <option value="Mifflin">Mifflin-St Jeor (Recomendada)</option>
                                            <option value="Harris-Benedict">Harris-Benedict</option>
                                            <option value="FAO">FAO/OMS</option>
                                            <option value="Quick">Rápida (25-30 kcal/kg)</option>
                                        </select>
                                    </div>

                                    <div className="input-field">
                                        <label>Actividad Física</label>
                                        <select
                                            value={calculationData.activityLevel}
                                            onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                                        >
                                            {Object.keys(ACTIVITY_FACTORS).map(level => (
                                                <option key={level} value={level}>
                                                    {level} ({ACTIVITY_FACTORS[level]}x)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-field">
                                        <label>Objetivo</label>
                                        <select
                                            value={calculationData.goal}
                                            onChange={(e) => handleInputChange('goal', e.target.value)}
                                        >
                                            <option value="Pérdida de peso">Pérdida de peso (-20%)</option>
                                            <option value="Pérdida de peso agresiva">Pérdida agresiva (-30%)</option>
                                            <option value="Mantenimiento">Mantenimiento</option>
                                            <option value="Ganancia de peso">Ganancia de peso (+15%)</option>
                                            <option value="Ganancia muscular">Ganancia muscular (+20%)</option>
                                        </select>
                                    </div>

                                    <div className="input-field">
                                        <label>Factor de Estrés</label>
                                        <select
                                            value={calculationData.stressFactor}
                                            onChange={(e) => handleInputChange('stressFactor', e.target.value)}
                                        >
                                            {Object.keys(STRESS_FACTORS).map(factor => (
                                                <option key={factor} value={factor}>
                                                    {factor} ({STRESS_FACTORS[factor]}x)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-field">
                                        <label>Condición Especial</label>
                                        <select
                                            value={calculationData.condition}
                                            onChange={(e) => handleInputChange('condition', e.target.value)}
                                        >
                                            <option value="Normal">Normal</option>
                                            <option value="Diabetes">Diabetes</option>
                                            <option value="Hipertensión">Hipertensión</option>
                                            <option value="Enfermedad renal">Enfermedad renal</option>
                                        </select>
                                    </div>

                                    <div className="input-field">
                                        <label>Comidas por día</label>
                                        <select
                                            value={calculationData.numberOfMeals}
                                            onChange={(e) => handleInputChange('numberOfMeals', parseInt(e.target.value))}
                                        >
                                            <option value="3">3 comidas</option>
                                            <option value="4">4 comidas</option>
                                            <option value="5">5 comidas (Recomendado)</option>
                                            <option value="6">6 comidas</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Errores de validación */}
                                {validationErrors.length > 0 && (
                                    <div className="validation-errors">
                                        {validationErrors.map((error, index) => (
                                            <div key={index} className="error-message">{error}</div>
                                        ))}
                                    </div>
                                )}

                                <button className="btn-calculate" onClick={handleCalculate}>
                                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                                    </svg>
                                    Calcular Requerimientos
                                </button>
                            </div>

                            {/* RESULTADOS */}
                            {results && (
                                <div className="calculation-results">
                                    <h3 className="section-subtitle">Resultados</h3>

                                    {/* TMB y GET */}
                                    <div className="results-grid">
                                        <div className="result-card tmb-card">
                                            <div className="result-label">TMB</div>
                                            <div className="result-value">{results.tmb.toLocaleString('es-EC')}</div>
                                            <div className="result-unit">kcal/día</div>
                                            <div className="result-description">Tasa Metabólica Basal</div>
                                        </div>

                                        <div className="result-card get-card">
                                            <div className="result-label">GET</div>
                                            <div className="result-value">{results.get.toLocaleString('es-EC')}</div>
                                            <div className="result-unit">kcal/día</div>
                                            <div className="result-description">Gasto Energético Total</div>
                                        </div>

                                        <div className="result-card prescription-card">
                                            <div className="result-label">Prescripción</div>
                                            <div className="result-value">{results.calorieGoal.calories.toLocaleString('es-EC')}</div>
                                            <div className="result-unit">kcal/día</div>
                                            <div className="result-description">
                                                Rango: {results.calorieGoal.min} - {results.calorieGoal.max} kcal
                                            </div>
                                        </div>
                                    </div>

                                    {/* MACRONUTRIENTES */}
                                    <div className="macros-section">
                                        <h4 className="macros-title">Distribución de Macronutrientes</h4>
                                        <div className="macros-grid">
                                            <div className="macro-card protein-card">
                                                <div className="macro-icon">🍗</div>
                                                <div className="macro-label">Proteína</div>
                                                <div className="macro-value">{results.macros.protein.grams}g</div>
                                                <div className="macro-percentage">{results.macros.protein.percentage}%</div>
                                                <div className="macro-calories">{results.macros.protein.calories.toLocaleString('es-EC')} kcal</div>
                                            </div>

                                            <div className="macro-card carbs-card">
                                                <div className="macro-icon">🍚</div>
                                                <div className="macro-label">Carbohidratos</div>
                                                <div className="macro-value">{results.macros.carbs.grams}g</div>
                                                <div className="macro-percentage">{results.macros.carbs.percentage}%</div>
                                                <div className="macro-calories">{results.macros.carbs.calories.toLocaleString('es-EC')} kcal</div>
                                            </div>

                                            <div className="macro-card fats-card">
                                                <div className="macro-icon">🥑</div>
                                                <div className="macro-label">Grasas</div>
                                                <div className="macro-value">{results.macros.fats.grams}g</div>
                                                <div className="macro-percentage">{results.macros.fats.percentage}%</div>
                                                <div className="macro-calories">{results.macros.fats.calories.toLocaleString('es-EC')} kcal</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DISTRIBUCIÓN DE COMIDAS */}
                                    <div className="meals-section">
                                        <h4 className="meals-title">Distribución por Tiempo de Comida</h4>
                                        <div className="meals-list">
                                            {Object.entries(results.mealDistribution).map(([meal, calories]) => (
                                                <div key={meal} className="meal-item">
                                                    <span className="meal-name">{meal}</span>
                                                    <span className="meal-calories">{calories.toLocaleString('es-EC')} kcal</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* BOTONES DE ACCIÓN */}
                                    <div className="results-actions">
                                        <button className="btn-apply" onClick={handleApplyResults}>
                                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                            Aplicar al Plan de Tratamiento
                                        </button>
                                        <button className="btn-save">
                                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                                            </svg>
                                            Guardar Cálculo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'history' && (
                        <div className="history-section">
                            <p className="coming-soon">Historial de cálculos próximamente...</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default NutritionalToolsModal;