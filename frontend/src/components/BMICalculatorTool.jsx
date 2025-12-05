import React, { useState, useEffect } from 'react';
import './BMICalculatorTool.css';
import whoBmiTable from '../data/who_bmi_for_age_percentiles.json';


const calculateExactAge = (birthDate) => {
    if (!birthDate) return { years: 0, months: 0 };
    const today = new Date();
    const birth = new Date(birthDate);

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
        years--;
        months += 12;
    }
    return { years, months };
};

const getAdultDiagnosis = (bmi) => {
    const value = typeof bmi === 'number' ? bmi : parseFloat(bmi || '0');

    if (value < 18.5) return { status: 'Bajo peso', color: '#3b82f6', width: '15%' };
    if (value < 24.9) return { status: 'Peso normal', color: '#10b981', width: '40%' };
    if (value < 29.9) return { status: 'Sobrepeso', color: '#f59e0b', width: '65%' };
    if (value < 34.9) return { status: 'Obesidad I', color: '#f97316', width: '85%' };
    return { status: 'Obesidad II/III', color: '#ef4444', width: '100%' };
};

// Estima el percentil comparando contra p1, p3, p5, ..., p99
const estimatePercentile = (bmi, row) => {
    if (!row) return null;
    const points = [
        ['p1', 1],
        ['p3', 3],
        ['p5', 5],
        ['p10', 10],
        ['p15', 15],
        ['p25', 25],
        ['p50', 50],
        ['p75', 75],
        ['p85', 85],
        ['p90', 90],
        ['p95', 95],
        ['p97', 97],
        ['p99', 99],
    ]
        .map(([key, p]) =>
            row[key] != null && !Number.isNaN(row[key])
                ? { p, v: Number(row[key]) }
                : null
        )
        .filter(Boolean);

    if (!points.length) return null;

    const value = typeof bmi === 'number' ? bmi : parseFloat(bmi || '0');

    if (value <= points[0].v) return points[0].p;
    if (value >= points[points.length - 1].v) return points[points.length - 1].p;

    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        if (value >= a.v && value <= b.v) {
            const ratio = (value - a.v) / (b.v - a.v);
            return a.p + (b.p - a.p) * ratio;
        }
    }

    return null;
};

// Lógica pediátrica basada en OMS (percentiles IMC/edad)
const getPediatricDiagnosis = (bmi, birthDate, gender) => {
    if (!birthDate) {
        return {
            status: 'Ingrese fecha de nacimiento para estimar el percentil.',
            color: '#8b5cf6',
            width: '0%',
            ageYears: 0,
            ageMonths: 0,
            ageTotalMonths: 0,
            percentile: null,
            pediatricCategory: '',
        };
    }

    const age = calculateExactAge(birthDate);
    const ageMonths = age.years * 12 + age.months;
    const sexKey = gender === 'female' ? 'female' : 'male';

    const sexTable = whoBmiTable?.data?.[sexKey] || {};
    const row = sexTable[String(ageMonths)];

    if (!row) {
        return {
            status: 'Sin datos OMS para esta edad (IMC/edad).',
            color: '#8b5cf6',
            width: '0%',
            ageYears: age.years,
            ageMonths: age.months,
            percentile: null,
            pediatricCategory: '',
        };
    }

    const percentile = estimatePercentile(bmi, row);

    let category = '';
    let color = '#8b5cf6';

    if (percentile == null) {
        category = 'No se pudo estimar el percentil.';
    } else if (percentile < 5) {
        category = 'Bajo peso';
        color = '#3b82f6';
    } else if (percentile < 85) {
        category = 'Normopeso';
        color = '#10b981';
    } else if (percentile < 95) {
        category = 'Sobrepeso';
        color = '#f59e0b';
    } else {
        category = 'Obesidad';
        color = '#ef4444';
    }

    return {
        status: category,
        color,
        width: '0%',
        ageYears: age.years,
        ageMonths: age.months,      // <-- igual aquí
        percentile,
        pediatricCategory: category,
    };
};

const BMICalculatorTool = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('adult');
    const [values, setValues] = useState({
        weight: '',
        height: '',
        birthDate: '',
        gender: 'male',
    });

    const [result, setResult] = useState({
        bmi: 0,
        status: 'Esperando datos...',
        color: '#cbd5e1',
        width: '0%',
        ageYears: 0,
        ageMonths: 0,
        ageTotalMonths: 0,
        percentile: null,
        pediatricCategory: '',
    });

    useEffect(() => {
        if (values.weight && values.height) {
            const w = parseFloat(values.weight);
            const h = parseFloat(values.height) / 100;

            if (w > 0 && h > 0) {
                const bmiValue = Number((w / (h * h)).toFixed(2));

                if (mode === 'adult') {
                    const diagnosis = getAdultDiagnosis(bmiValue);
                    setResult((prev) => ({
                        ...prev,
                        bmi: bmiValue,
                        ...diagnosis,
                    }));
                } else {
                    const diag = getPediatricDiagnosis(bmiValue, values.birthDate, values.gender);
                    setResult((prev) => ({
                        ...prev,
                        bmi: bmiValue,
                        status: diag.status,
                        color: diag.color,
                        width: diag.width,
                        ageYears: diag.ageYears,
                        ageMonths: diag.ageMonths,
                        ageTotalMonths: diag.ageTotalMonths,
                        percentile: diag.percentile,
                        pediatricCategory: diag.pediatricCategory,
                    }));
                }
            } else {
                setResult((prev) => ({
                    ...prev,
                    bmi: 0,
                    status: 'Esperando datos...',
                    color: '#cbd5e1',
                    width: '0%',
                }));
            }
        } else {
            setResult((prev) => ({
                ...prev,
                bmi: 0,
                status: 'Esperando datos...',
                color: '#cbd5e1',
                width: '0%',
            }));
        }
    }, [values, mode]);

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const percentilePosition =
        result.percentile != null
            ? Math.min(99, Math.max(1, result.percentile))
            : null;

    if (!isOpen) return null;

    return (
        <div className="bmi-overlay" onClick={onClose}>
            <div className="bmi-modal" onClick={(e) => e.stopPropagation()}>
                {/* HEADER */}
                <div className="bmi-header">
                    <div className="header-top">
                        <div className="header-title">
                            <div className="icon-box">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M3 6l3 1 3-1 3 1 3-1 3 1-3 9-3-1-3 1-3-1-3 1L3 6z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3>Calculadora IMC</h3>
                                <p>Evaluación nutricional rápida</p>
                            </div>
                        </div>
                        <button className="close-button" onClick={onClose}>
                            ×
                        </button>
                    </div>

                    <div className="bmi-tabs">
                        <button
                            type="button"
                            className={`bmi-tab ${mode === "adult" ? "active" : ""}`}
                            onClick={() => setMode("adult")}
                        >
    <span className="bmi-tab-icon" aria-hidden="true">
      {/* Icono adulto (silhouette) */}
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
        <circle cx="12" cy="6.5" r="3" />
        <path d="M8 21v-5.5a4 4 0 0 1 8 0V21" />
        <path d="M6 21h12" />
      </svg>
    </span>
                            <span className="bmi-tab-text">Adulto</span>
                        </button>

                        <button
                            type="button"
                            className={`bmi-tab ${mode === "pediatric" ? "active" : ""}`}
                            onClick={() => setMode("pediatric")}
                        >
    <span className="bmi-tab-icon" aria-hidden="true">
      {/* Icono pediátrico: adulto + niño */}
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
        {/* Adulto */}
            <circle cx="8" cy="6.5" r="2.7" />
        <path d="M4.5 21v-5a3.5 3.5 0 0 1 7 0v5" />

            {/* Niño */}
            <circle cx="17" cy="8.5" r="2" />
        <path d="M15.2 21v-3.5a2.3 2.3 0 0 1 4.6 0V21" />
      </svg>
    </span>
                            <span className="bmi-tab-text">Niño/Niña</span>
                        </button>
                    </div>

                </div>

                {/* CUERPO */}
                <div className="bmi-body">
                    <div className="bmi-columns">
                        {/* FORMULARIO */}
                        <div className="bmi-form-card">
                            <h4>Datos antropométricos</h4>
                            <div className="input-group">
                                <label>Peso (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="weight"
                                    value={values.weight}
                                    onChange={handleChange}
                                    placeholder="Ej. 70.5"
                                />
                            </div>
                            <div className="input-group">
                                <label>Talla (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="height"
                                    value={values.height}
                                    onChange={handleChange}
                                    placeholder="Ej. 165"
                                />
                            </div>

                            {mode === 'pediatric' && (
                                <>
                                    <div className="input-group">
                                        <label>Fecha de nacimiento</label>
                                        <input
                                            type="date"
                                            name="birthDate"
                                            value={values.birthDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Sexo</label>
                                        <select name="gender" value={values.gender} onChange={handleChange}>
                                            <option value="male">Niño</option>
                                            <option value="female">Niña</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* RESULTADO */}
                        <div className={`bmi-result-card ${mode}`}>
                            {mode === 'pediatric' ? (
                                <>
                                    <div className="bmi-result-header">
                                        <div className="pediatric-age-badge">
                                            Edad:{' '}
                                            <strong>
                                                {result.ageYears} años, {result.ageMonths} meses
                                            </strong>
                                        </div>

                                        {result.percentile != null && result.bmi > 0 && (
                                            <span className="bmi-percentile-chip">
            P{Math.round(result.percentile)} · {result.status}
          </span>
                                        )}
                                    </div>

                                    <div className="bmi-main-metric">
                                        <div>
                                            <span className="label">IMC calculado (kg/m²)</span>
                                            <span
                                                className="number"
                                                style={{ color: result.bmi > 0 ? result.color : '#94a3b8' }}
                                            >
            {result.bmi > 0 ? result.bmi.toFixed(2) : '--'}
          </span>
                                        </div>
                                        {result.bmi > 0 && (
                                            <div className="bmi-main-status">
            <span className="status-pill" style={{ backgroundColor: result.color }}>
              {result.status}
            </span>
                                            </div>
                                        )}
                                    </div>

                                    {result.percentile != null && result.bmi > 0 && percentilePosition != null && (
                                        <div className="bmi-percentile-bar">
                                            <div className="bmi-percentile-track">
                                                <div
                                                    className="bmi-percentile-marker"
                                                    style={{ left: `${percentilePosition}%` }}
                                                />
                                            </div>
                                            <div className="bmi-percentile-labels">
                                                <span>P1</span>
                                                <span>P50</span>
                                                <span>P99</span>
                                            </div>
                                        </div>
                                    )}

                                    <p className="pediatric-note">
                                        {result.percentile != null && result.bmi > 0 ? (
                                            <>
                                                Percentil IMC estimado:{' '}
                                                <strong>P{Math.round(result.percentile)}</strong> – {result.status}.<br />
                                                <small>Basado en referencia OMS IMC-para-la-edad. Interpretar siempre junto a la valoración clínica.</small>
                                            </>
                                        ) : (
                                            <>Complete peso, talla, fecha de nacimiento y sexo para estimar el percentil según OMS.</>
                                        )}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="result-value">
                                        <span className="label">IMC calculado (kg/m²)</span>
                                        <span
                                            className="number"
                                            style={{ color: result.bmi > 0 ? result.color : '#94a3b8' }}
                                        >
          {result.bmi > 0 ? result.bmi.toFixed(2) : '--'}
        </span>
                                        <span
                                            className="status"
                                            style={{
                                                backgroundColor: result.bmi > 0 ? result.color : '#f1f5f9',
                                                color: result.bmi > 0 ? '#ffffff' : '#64748b',
                                            }}
                                        >
          {result.status}
        </span>
                                    </div>

                                    <div className="bmi-meter">
                                        <div className="meter-track">
                                            <div
                                                className="meter-fill"
                                                style={{
                                                    width: result.bmi > 0 ? result.width : '0%',
                                                    backgroundColor: result.color,
                                                }}
                                            />
                                        </div>
                                        <div className="meter-labels">
                                            <span>Bajo</span>
                                            <span>Normal</span>
                                            <span>Sobrepeso</span>
                                            <span>Obesidad</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default BMICalculatorTool;
