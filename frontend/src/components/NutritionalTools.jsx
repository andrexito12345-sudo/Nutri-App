import React, { useState, useEffect } from 'react';
import './NutritionalTools.css';

const NutritionalTools = ({ patientData, onCancel, onSave, actionLabel = "Guardar Cálculo" }) => {
    const [config, setConfig] = useState({
        formula: 'mifflin',
        activityLevel: 'sedentary',
        goal: 'maintenance'
    });

    const [results, setResults] = useState(null);

    const calculateAge = (birthDate) => {
        if (!birthDate) return 30;
        return new Date().getFullYear() - new Date(birthDate).getFullYear();
    };

    const calculateBMR = () => {
        const { weight, height, birth_date, gender } = patientData;
        const age = calculateAge(birth_date);
        if (!weight || !height || !gender) return null;

        let bmr;
        if (config.formula === 'mifflin') {
            bmr = gender === 'Masculino'
                ? (10 * weight) + (6.25 * height) - (5 * age) + 5
                : (10 * weight) + (6.25 * height) - (5 * age) - 161;
        } else {
            bmr = gender === 'Masculino'
                ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
                : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
        return Math.round(bmr);
    };

    const activityFactors = {
        sedentary: { factor: 1.2, label: 'Sedentario' },
        light: { factor: 1.375, label: 'Ligero' },
        moderate: { factor: 1.55, label: 'Moderado' },
        active: { factor: 1.725, label: 'Activo' },
        veryActive: { factor: 1.9, label: 'Muy Activo' }
    };

    const calculateTDEE = (bmr) => {
        return Math.round(bmr * activityFactors[config.activityLevel].factor);
    };

    const adjustCalories = (tdee) => {
        const adjustments = { cut: 0.8, maintenance: 1.0, bulk: 1.15 };
        return Math.round(tdee * adjustments[config.goal]);
    };

    const calculateMacros = (targetCalories, weight) => {
        let proteinPerKg, fatPercent;
        if (config.goal === 'cut') {
            proteinPerKg = 2.0;
            fatPercent = 0.25;
        } else if (config.goal === 'bulk') {
            proteinPerKg = 1.6;
            fatPercent = 0.28;
        } else {
            proteinPerKg = 1.4;
            fatPercent = 0.27;
        }

        const proteinGrams = Math.round(weight * proteinPerKg);
        const proteinCals = proteinGrams * 4;
        const fatCals = Math.round(targetCalories * fatPercent);
        const fatGrams = Math.round(fatCals / 9);
        const carbCals = targetCalories - proteinCals - fatCals;
        const carbGrams = Math.round(carbCals / 4);
        const proteinPercent = Math.round((proteinCals / targetCalories) * 100);
        const carbPercent = Math.round((carbCals / targetCalories) * 100);
        const fatPercent_final = 100 - proteinPercent - carbPercent;

        return {
            protein: { grams: proteinGrams, calories: proteinCals, percent: proteinPercent },
            carbs: { grams: carbGrams > 0 ? carbGrams : 0, calories: carbCals > 0 ? carbCals : 0, percent: carbPercent > 0 ? carbPercent : 0 },
            fats: { grams: fatGrams, calories: fatCals, percent: fatPercent_final }
        };
    };

    const performCalculation = () => {
        const bmr = calculateBMR();
        if (!bmr) return;
        const tdee = calculateTDEE(bmr);
        const targetCalories = adjustCalories(tdee);
        const macros = calculateMacros(targetCalories, patientData.weight);

        setResults({
            bmr,
            tdee,
            targetCalories,
            macros,
            date: new Date().toISOString(),
            config: { ...config },
            // Metadata para el historial
            patientWeight: patientData.weight,
            patientHeight: patientData.height,
            patientAge: calculateAge(patientData.birth_date)
        });
    };

    useEffect(() => {
        if (patientData.weight && patientData.height) {
            performCalculation();
        }
    }, [config, patientData]);

    // Función para guardar el cálculo
    const handleSaveCalculation = () => {
        if (results && onSave) {
            onSave(results);
        }
    };

    return (
        <div className="tools-compact-container">

            {/* HEADER COMPACTO */}
            <div className="tools-compact-header">
                <div className="header-left">
                    <h3 className="tools-compact-title">Calculadora Metabólica</h3>
                    <div className="patient-metrics-compact">
                        <span>{patientData.full_name}</span>
                        <span className="metric-dot">•</span>
                        <span className="metric-highlight">{patientData.weight} kg</span>
                        <span className="metric-dot">•</span>
                        <span className="metric-highlight">{patientData.height} cm</span>
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL EN GRID HORIZONTAL */}
            <div className="tools-compact-grid">

                {/* COLUMNA 1: PARÁMETROS */}
                <div className="compact-section">
                    <h4 className="compact-section-title">1. PARÁMETROS</h4>

                    <div className="compact-field">
                        <label>Fórmula TMB</label>
                        <select value={config.formula} onChange={(e) => setConfig({...config, formula: e.target.value})}>
                            <option value="mifflin">Mifflin-St Jeor</option>
                            <option value="harris">Harris-Benedict</option>
                        </select>
                    </div>

                    <div className="compact-field">
                        <label>Actividad Física</label>
                        <select value={config.activityLevel} onChange={(e) => setConfig({...config, activityLevel: e.target.value})}>
                            {Object.entries(activityFactors).map(([key, {factor, label}]) => (
                                <option key={key} value={key}>{label} ({factor}x)</option>
                            ))}
                        </select>
                    </div>

                    <div className="compact-field">
                        <label>Objetivo</label>
                        <div className="goal-compact-buttons">
                            <button
                                className={`goal-compact-btn ${config.goal === 'cut' ? 'active cut' : ''}`}
                                onClick={() => setConfig({...config, goal: 'cut'})}
                            >
                                Pérdida
                            </button>
                            <button
                                className={`goal-compact-btn ${config.goal === 'maintenance' ? 'active maint' : ''}`}
                                onClick={() => setConfig({...config, goal: 'maintenance'})}
                            >
                                Mant.
                            </button>
                            <button
                                className={`goal-compact-btn ${config.goal === 'bulk' ? 'active bulk' : ''}`}
                                onClick={() => setConfig({...config, goal: 'bulk'})}
                            >
                                Ganancia
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLUMNA 2: REQUERIMIENTOS */}
                <div className="compact-section">
                    <h4 className="compact-section-title">2. REQUERIMIENTOS</h4>
                    {results ? (
                        <div className="compact-results-grid">
                            <div className="compact-result-card bmr">
                                <div className="compact-result-label">Metabolismo Basal (TMB)</div>
                                <div className="compact-result-value">{results.bmr.toLocaleString('es-EC')}</div>
                                <div className="compact-result-unit">kcal</div>
                            </div>
                            <div className="compact-result-card tdee">
                                <div className="compact-result-label">Gasto Total (GET)</div>
                                <div className="compact-result-value">{results.tdee.toLocaleString('es-EC')}</div>
                                <div className="compact-result-unit">kcal</div>
                            </div>
                            <div className="compact-result-card target">
                                <div className="compact-result-label">Meta Prescrita</div>
                                <div className="compact-result-value">{results.targetCalories.toLocaleString('es-EC')}</div>
                                <div className="compact-result-unit">kcal</div>
                            </div>
                        </div>
                    ) : (
                        <div className="compact-no-results">Configura parámetros</div>
                    )}
                </div>

                {/* COLUMNA 3: MACROS */}
                <div className="compact-section">
                    <h4 className="compact-section-title">
                        3. DISTRIBUCIÓN MACROS
                        {results && <span className="total-compact-badge">Total: 100%</span>}
                    </h4>
                    {results && (
                        <div className="compact-macros-list">
                            <div className="compact-macro-row protein">
                                <div className="compact-macro-header">
                                    <span className="compact-macro-icon">🍗</span>
                                    <span className="compact-macro-name">Proteína</span>
                                    <span className="compact-macro-value">{results.macros.protein.grams}g</span>
                                    <span className="compact-macro-percent">{results.macros.protein.percent}%</span>
                                </div>
                                <div className="compact-macro-bar">
                                    <div className="compact-macro-fill protein-fill" style={{width: `${results.macros.protein.percent}%`}}></div>
                                </div>
                                <div className="compact-macro-kcal">{results.macros.protein.calories.toLocaleString('es-EC')} kcal</div>
                            </div>

                            <div className="compact-macro-row carbs">
                                <div className="compact-macro-header">
                                    <span className="compact-macro-icon">🍚</span>
                                    <span className="compact-macro-name">Carbos</span>
                                    <span className="compact-macro-value">{results.macros.carbs.grams}g</span>
                                    <span className="compact-macro-percent">{results.macros.carbs.percent}%</span>
                                </div>
                                <div className="compact-macro-bar">
                                    <div className="compact-macro-fill carbs-fill" style={{width: `${results.macros.carbs.percent}%`}}></div>
                                </div>
                                <div className="compact-macro-kcal">{results.macros.carbs.calories.toLocaleString('es-EC')} kcal</div>
                            </div>

                            <div className="compact-macro-row fats">
                                <div className="compact-macro-header">
                                    <span className="compact-macro-icon">🥑</span>
                                    <span className="compact-macro-name">Grasas</span>
                                    <span className="compact-macro-value">{results.macros.fats.grams}g</span>
                                    <span className="compact-macro-percent">{results.macros.fats.percent}%</span>
                                </div>
                                <div className="compact-macro-bar">
                                    <div className="compact-macro-fill fats-fill" style={{width: `${results.macros.fats.percent}%`}}></div>
                                </div>
                                <div className="compact-macro-kcal">{results.macros.fats.calories.toLocaleString('es-EC')} kcal</div>
                            </div>

                            {/* BOTÓN DE GUARDAR FLEXIBLE */}
                            {results && (
                                <div className="tools-compact-actions">
                                    <button className="btn-compact-save" onClick={handleSaveCalculation}>
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                                        </svg>
                                        {actionLabel}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

export default NutritionalTools;