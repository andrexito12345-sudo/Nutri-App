// src/components/IMCLandingPage.jsx
import React, { useState } from "react";
import "./IMCLandingPage.css";

// ==========================================
// ÍCONOS SVG CLÍNICOS PROFESIONALES
// ==========================================
const IconPulse = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);
const IconHeartCheck = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="m9 11 3 3 7-7"/></svg>
);
const IconWeightScale = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
);
const IconMedicalWarning = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l10 10 10-10V2Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
);

// AHORA RECIBIMOS LA PROP "onAgendar" DEL PADRE
const IMCLandingPage = ({ onAgendar }) => {
    const [peso, setPeso] = useState("");
    const [altura, setAltura] = useState("");
    const [resultado, setResultado] = useState(null);

    const calcularIMC = () => {
        if (!peso || !altura || peso <= 0 || altura <= 0) return;

        const alturaMetros = altura / 100;
        const imcValor = (peso / (alturaMetros * alturaMetros)).toFixed(1);

        let data = {};

        if (imcValor < 18.5) {
            data = {
                categoria: "Bajo Peso",
                color: "#3b82f6",
                bgBadge: "#dbeafe",
                mensaje: "Es importante fortalecer tu nutrición para ganar masa muscular y energía.",
                icon: IconPulse,
                position: 10
            };
        } else if (imcValor < 25) {
            data = {
                categoria: "Peso Saludable",
                color: "#10b981",
                bgBadge: "#d1fae5",
                mensaje: "¡Excelente trabajo! Mantén tus hábitos actuales para conservar tu bienestar.",
                icon: IconHeartCheck,
                position: 35
            };
        } else if (imcValor < 30) {
            data = {
                categoria: "Sobrepeso",
                color: "#f59e0b",
                bgBadge: "#fef3c7",
                mensaje: "Estás ligeramente por encima del rango. Pequeños ajustes hoy evitan problemas mañana.",
                icon: IconWeightScale,
                position: 60
            };
        } else {
            data = {
                categoria: "Obesidad",
                color: "#ef4444",
                bgBadge: "#fee2e2",
                mensaje: "Tu salud cardiovascular requiere atención prioritaria. Un plan médico es vital.",
                icon: IconMedicalWarning,
                position: 85
            };
        }

        let visualPos = ((imcValor - 15) / (40 - 15)) * 100;
        if (visualPos < 5) visualPos = 5;
        if (visualPos > 95) visualPos = 95;

        setResultado({ imc: imcValor, ...data, visualPos: visualPos });
    };

    // FUNCIÓN PARA ENVIAR EL MENSAJE AL PADRE
    const handleAgendarClick = (e) => {
        e.preventDefault(); // Evita el salto brusco del link
        if (onAgendar && resultado) {
            // Creamos un mensaje personalizado
            const mensajeAutomatico = `Hola, acabo de realizar mi cálculo de IMC en la web. Mi resultado fue ${resultado.imc} (${resultado.categoria}). Me gustaría agendar una evaluación para mejorar mi salud.`;

            // Ejecutamos la función del padre
            onAgendar(mensajeAutomatico);
        }
    };

    return (
        <div className="imc-wrapper">
            <div className="imc-card">
                {/* COLUMNA IZQUIERDA */}
                <div className="imc-col-inputs">
                    <h3 className="imc-title">Calculadora de Salud</h3>
                    <p className="imc-subtitle">Ingresa tus datos para un pre-diagnóstico.</p>
                    <div className="imc-inputs-grid">
                        <div className="imc-input-group">
                            <label>Peso Actual</label>
                            <div className="imc-input-wrapper">
                                <input type="number" className="imc-input" placeholder="00" value={peso} onChange={(e) => setPeso(e.target.value)} />
                                <span className="imc-unit">kg</span>
                            </div>
                        </div>
                        <div className="imc-input-group">
                            <label>Estatura</label>
                            <div className="imc-input-wrapper">
                                <input type="number" className="imc-input" placeholder="000" value={altura} onChange={(e) => setAltura(e.target.value)} />
                                <span className="imc-unit">cm</span>
                            </div>
                        </div>
                    </div>
                    <button className="imc-calc-btn" onClick={calcularIMC}>
                        ANALIZAR MI ESTADO
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* COLUMNA DERECHA */}
                <div className="imc-col-results">
                    {resultado ? (
                        <div className="imc-result-card">
                            <div className="imc-score-header">
                                <div>
                                    <div className="imc-score-label">Tu Índice (IMC)</div>
                                    <div className="imc-score-number">{resultado.imc}</div>
                                </div>
                                <div className="imc-badge" style={{ backgroundColor: resultado.bgBadge, color: resultado.color }}>
                                    {resultado.categoria}
                                </div>
                            </div>
                            <div className="imc-bar-container">
                                <div className="imc-bar-background"></div>
                                <div className="imc-marker" style={{ left: `${resultado.visualPos}%`, borderColor: resultado.color }}></div>
                            </div>
                            <div className="imc-bar-labels">
                                <span>Bajo</span><span style={{marginLeft: '10%'}}>Normal</span><span style={{marginRight: '10%'}}>Sobre</span><span>Obesidad</span>
                            </div>

                            <div className="imc-insight" style={{ borderColor: resultado.color + '20' }}>
                                <div className="imc-insight-icon" style={{ color: resultado.color }}>
                                    {resultado.icon}
                                </div>
                                <div className="imc-insight-content">
                                    <h4>Diagnóstico Preliminar</h4>
                                    <p>{resultado.mensaje}</p>

                                    {/* BOTÓN INTELIGENTE CONECTADO AL FORMULARIO */}
                                    {resultado.categoria !== "Peso Saludable" && (
                                        <a
                                            href="#booking-form"
                                            className="imc-cta-small"
                                            style={{ color: resultado.color, cursor: 'pointer' }}
                                            onClick={handleAgendarClick}
                                        >
                                            Agendar revisión gratuita
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="imc-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-15a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v15a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                            <p>Completa tus datos y presiona "Analizar" para ver tu diagnóstico aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IMCLandingPage;