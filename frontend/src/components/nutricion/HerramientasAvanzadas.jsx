// src/components/nutricion/HerramientasAvanzadas.jsx
import React, { useState, useMemo } from "react";
import "./HerramientasAvanzadas.css";

const HerramientasAvanzadas = ({ patientId, onClose }) => {
    const [form, setForm] = useState({
        peso: 75,
        talla: 170,
        edad: 30,
        sexo: "H", // H = hombre, M = mujer
        cintura: 85,
        cuello: 38,
        cadera: 95,
        actividad: "moderado",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (["peso", "talla", "edad", "cintura", "cuello", "cadera"].includes(name)) {
            const num = Number(value);
            setForm((prev) => ({
                ...prev,
                [name]: isNaN(num) ? 0 : num,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const calculos = useMemo(() => {
        const { peso, talla, edad, sexo, cintura, cuello, cadera, actividad } = form;

        if (!peso || !talla || !edad) {
            return {
                tmb: 0,
                get: 0,
                grasaNavy: 0,
                ffmi: 0,
                proteinas: 0,
                grasas: 0,
                carbs: 0,
            };
        }

        // TMB Mifflin-St Jeor
        const tmbBase =
            sexo === "H"
                ? 10 * peso + 6.25 * talla - 5 * edad + 5
                : 10 * peso + 6.25 * talla - 5 * edad - 161;

        // GET según actividad
        const factores = {
            sedentario: 1.2,
            ligero: 1.375,
            moderado: 1.55,
            muyActivo: 1.7,
        };
        const get = Math.round(tmbBase * (factores[actividad] || 1.55));

        // % Grasa Navy
        let grasaNavy = 0;
        try {
            if (sexo === "H") {
                if (cintura > 0 && cuello > 0 && talla > 0 && cintura > cuello) {
                    grasaNavy =
                        86.01 * Math.log10(cintura - cuello) -
                        70.041 * Math.log10(talla) +
                        36.76;
                }
            } else {
                if (
                    cintura > 0 &&
                    cuello > 0 &&
                    cadera > 0 &&
                    talla > 0 &&
                    cintura + cadera > cuello
                ) {
                    grasaNavy =
                        163.205 * Math.log10(cintura + cadera - cuello) -
                        97.684 * Math.log10(talla) -
                        78.387;
                }
            }
        } catch {
            grasaNavy = 0;
        }

        if (!isFinite(grasaNavy)) grasaNavy = 0;
        if (grasaNavy < 0) grasaNavy = 0;
        const grasaNavyRedondeada = Number(grasaNavy.toFixed(1));

        // FFMI
        const masaMagra = peso * (1 - grasaNavyRedondeada / 100);
        const tallaM = talla / 100;
        const ffmi =
            tallaM > 0 ? Number((masaMagra / (tallaM * tallaM)).toFixed(1)) : 0;

        // Macros
        const proteinas = Math.round(peso * 1.8);
        const grasas = Math.round(peso * 0.9);
        const kcalProte = proteinas * 4;
        const kcalGrasa = grasas * 9;
        const kcalRestantes = Math.max(get - (kcalProte + kcalGrasa), 0);
        const carbs = Math.round(kcalRestantes / 4);

        return {
            tmb: Math.round(tmbBase),
            get,
            grasaNavy: grasaNavyRedondeada,
            ffmi,
            proteinas,
            grasas,
            carbs,
        };
    }, [form]);

    return (
        <div className="ha-overlay" onClick={onClose}>
            <div className="ha-modal" onClick={(e) => e.stopPropagation()}>
                {/* HEADER */}
                <div className="ha-header">
                    <button
                        type="button"
                        className="ha-close-btn"
                        onClick={onClose}
                        aria-label="Cerrar herramientas avanzadas"
                    >
                        ×
                    </button>

                    <div className="ha-header-tag">HERRAMIENTAS AVANZADAS</div>
                    <h2 className="ha-header-title">Analizador Nutricional PRO</h2>
                    <div className="ha-header-subtitle">
                        Paciente ID:{" "}
                        <strong>{patientId || "Ninguno seleccionado"}</strong>
                    </div>
                </div>

                {/* BODY */}
                <div className="ha-body">
                    <div className="ha-grid">
                        {/* FORMULARIO */}
                        <div className="ha-card ha-card-form">
                            <h3 className="ha-card-title">Datos del paciente</h3>

                            <div className="ha-form-grid">
                                {/* Peso */}
                                <div className="ha-field">
                                    <label className="ha-label">Peso (kg)</label>
                                    <input
                                        type="number"
                                        name="peso"
                                        className="ha-input"
                                        value={form.peso}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>

                                {/* Talla */}
                                <div className="ha-field">
                                    <label className="ha-label">Talla (cm)</label>
                                    <input
                                        type="number"
                                        name="talla"
                                        className="ha-input"
                                        value={form.talla}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>

                                {/* Edad */}
                                <div className="ha-field">
                                    <label className="ha-label">Edad (años)</label>
                                    <input
                                        type="number"
                                        name="edad"
                                        className="ha-input"
                                        value={form.edad}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>

                                {/* Sexo */}
                                <div className="ha-field">
                                    <label className="ha-label">Sexo</label>
                                    <select
                                        name="sexo"
                                        className="ha-input"
                                        value={form.sexo}
                                        onChange={handleChange}
                                    >
                                        <option value="H">Hombre</option>
                                        <option value="M">Mujer</option>
                                    </select>
                                </div>

                                {/* Cintura */}
                                <div className="ha-field">
                                    <label className="ha-label">Cintura (cm)</label>
                                    <input
                                        type="number"
                                        name="cintura"
                                        className="ha-input"
                                        value={form.cintura}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>

                                {/* Cuello */}
                                <div className="ha-field">
                                    <label className="ha-label">Cuello (cm)</label>
                                    <input
                                        type="number"
                                        name="cuello"
                                        className="ha-input"
                                        value={form.cuello}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>

                                {/* Cadera */}
                                <div className="ha-field ha-field-wide">
                                    <label className="ha-label">Cadera (cm)</label>
                                    <input
                                        type="number"
                                        name="cadera"
                                        className="ha-input"
                                        value={form.cadera}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                    <div className="ha-helper-text">
                                        Usada en el cálculo Navy (mujer).
                                    </div>
                                </div>

                                {/* Actividad */}
                                <div className="ha-field ha-field-full">
                                    <label className="ha-label">Nivel de actividad</label>
                                    <select
                                        name="actividad"
                                        className="ha-input"
                                        value={form.actividad}
                                        onChange={handleChange}
                                    >
                                        <option value="sedentario">Sedentario / oficina</option>
                                        <option value="ligero">Ligero (1–3 días/sem)</option>
                                        <option value="moderado">Moderado (3–5 días/sem)</option>
                                        <option value="muyActivo">Muy activo (+6 días/sem)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* RESULTADOS */}
                        <div className="ha-results-column">
                            <div className="ha-results-grid">
                                {/* TMB */}
                                <div className="ha-card ha-card-result">
                                    <div className="ha-label">TMB</div>
                                    <div className="ha-result-value">{calculos.tmb}</div>
                                    <div className="ha-result-sub">kcal / día</div>
                                </div>

                                {/* GET */}
                                <div className="ha-card ha-card-result ha-card-result--green">
                                    <div className="ha-label">GET</div>
                                    <div className="ha-result-value">{calculos.get}</div>
                                    <div className="ha-result-sub">kcal totales / día</div>
                                </div>

                                {/* % Grasa */}
                                <div className="ha-card ha-card-result ha-card-result--yellow">
                                    <div className="ha-label">% Grasa (Navy)</div>
                                    <div className="ha-result-value">
                                        {calculos.grasaNavy}%
                                    </div>
                                </div>

                                {/* FFMI */}
                                <div className="ha-card ha-card-result ha-card-result--cyan">
                                    <div className="ha-label">FFMI</div>
                                    <div className="ha-result-value">{calculos.ffmi}</div>
                                </div>
                            </div>

                            {/* MACROS */}
                            <div className="ha-card ha-card-macros">
                                <h3 className="ha-card-title">Distribución de macronutrientes</h3>

                                <div className="ha-macros-grid">
                                    <div className="ha-macro-item">
                                        <div className="ha-label">Proteínas</div>
                                        <div className="ha-macro-value">
                                            {calculos.proteinas} g
                                        </div>
                                    </div>
                                    <div className="ha-macro-item">
                                        <div className="ha-label">Grasas</div>
                                        <div className="ha-macro-value">
                                            {calculos.grasas} g
                                        </div>
                                    </div>
                                    <div className="ha-macro-item">
                                        <div className="ha-label">Carbohidratos</div>
                                        <div className="ha-macro-value">
                                            {calculos.carbs} g
                                        </div>
                                    </div>
                                </div>

                                <div className="ha-print-wrapper">
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="ha-print-btn"
                                    >
                                        Exportar informe en PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HerramientasAvanzadas;
