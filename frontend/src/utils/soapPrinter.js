// frontend/src/utils/soapPrinter.js

/**
 * Función de impresión SOAP Profesional para Nutrición
 * Incluye: PES Statement, datos bioquímicos, metas SMART, y más
 */
export const printSoapReport = (consultation, patient) => {

    // 1. Abrir ventana
    const printWindow = window.open('', '_blank', 'width=950,height=900');
    if (!printWindow) {
        alert("⚠️ Error: El navegador bloqueó la ventana. Permite los pop-ups.");
        return;
    }

    // 2. Preparar datos visuales
    const fecha = new Date(consultation.consultation_date).toLocaleDateString("es-EC", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const edad = patient.birth_date
        ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear() + ' años'
        : '-';

    // Calcular clasificación IMC
    const getIMCClassification = (bmi) => {
        if (!bmi) return { text: '-', color: '#64748b' };
        const val = parseFloat(bmi);
        if (val < 18.5) return { text: 'Bajo peso', color: '#3b82f6' };
        if (val < 25) return { text: 'Normal', color: '#10b981' };
        if (val < 30) return { text: 'Sobrepeso', color: '#f59e0b' };
        if (val < 35) return { text: 'Obesidad I', color: '#ef4444' };
        if (val < 40) return { text: 'Obesidad II', color: '#dc2626' };
        return { text: 'Obesidad III', color: '#991b1b' };
    };

    const imcClass = getIMCClassification(consultation.bmi);

    // 3. El Diseño HTML Profesional Completo
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>SOAP Nutricional - ${patient.full_name}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body { 
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-size: 11px;
                    color: #1a1a2e;
                    padding: 20px;
                    background: #fff;
                    line-height: 1.4;
                }

                /* ========== HEADER ========== */
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 22px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                    margin-bottom: 15px;
                    color: white;
                }
                
                .logo-section h1 {
                    font-size: 20px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .logo-section p {
                    font-size: 10px;
                    opacity: 0.9;
                    margin-top: 2px;
                    font-weight: 300;
                }
                
                .doc-info {
                    text-align: right;
                    font-size: 10px;
                }
                
                .doc-info .folio {
                    background: rgba(255,255,255,0.2);
                    padding: 3px 10px;
                    border-radius: 15px;
                    font-weight: 600;
                    display: inline-block;
                    margin-bottom: 4px;
                }

                /* ========== GRID LAYOUT ========== */
                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                /* ========== CARDS ========== */
                .card {
                    background: #f8f9fc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px 14px;
                }
                
                .card-title {
                    color: #667eea;
                    font-size: 8px;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    margin-bottom: 8px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .card-title.green { color: #10b981; }
                .card-title.orange { color: #f59e0b; }
                .card-title.purple { color: #8b5cf6; }
                .card-title.red { color: #ef4444; }

                /* ========== PATIENT INFO ========== */
                .patient-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 6px;
                }
                
                .patient-field {
                    display: flex;
                    gap: 6px;
                    align-items: baseline;
                }
                
                .patient-field.full {
                    grid-column: span 2;
                }
                
                .field-label {
                    color: #64748b;
                    font-size: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    min-width: 55px;
                }
                
                .field-value {
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 11px;
                }

                /* ========== SOAP SECTIONS ========== */
                .soap-container {
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }
                
                .soap-row {
                    display: flex;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .soap-row:last-child {
                    border-bottom: none;
                }
                
                .soap-letter {
                    width: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 700;
                    color: white;
                    flex-shrink: 0;
                }
                
                .soap-s .soap-letter { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
                .soap-o .soap-letter { background: linear-gradient(135deg, #10b981, #059669); }
                .soap-a .soap-letter { background: linear-gradient(135deg, #f59e0b, #d97706); }
                .soap-p .soap-letter { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
                
                .soap-content {
                    flex: 1;
                    padding: 12px 14px;
                }
                
                .soap-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #f1f5f9;
                }
                
                .soap-title {
                    font-size: 9px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }
                
                .soap-s .soap-title { color: #3b82f6; }
                .soap-o .soap-title { color: #10b981; }
                .soap-a .soap-title { color: #f59e0b; }
                .soap-p .soap-title { color: #8b5cf6; }
                
                .soap-text {
                    color: #475569;
                    font-size: 11px;
                    line-height: 1.5;
                    white-space: pre-wrap;
                }

                /* ========== SUBSECTIONS ========== */
                .subsection {
                    margin-top: 10px;
                    padding-top: 8px;
                    border-top: 1px dashed #e2e8f0;
                }

                .subsection-title {
                    font-size: 8px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #64748b;
                    margin-bottom: 5px;
                }

                /* ========== METRICS TABLES ========== */
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin: 8px 0;
                }

                .metric-box {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 8px;
                    text-align: center;
                }

                .metric-label {
                    font-size: 7px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    margin-bottom: 3px;
                }

                .metric-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1e293b;
                }

                .metric-unit {
                    font-size: 9px;
                    color: #94a3b8;
                    font-weight: 400;
                }

                /* IMC Badge */
                .imc-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 8px;
                    font-weight: 600;
                    margin-left: 5px;
                }

                /* ========== BIOCHEMICAL TABLE ========== */
                .bio-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10px;
                    margin-top: 8px;
                }

                .bio-table th {
                    background: #f1f5f9;
                    padding: 6px 8px;
                    text-align: left;
                    font-weight: 600;
                    color: #475569;
                    font-size: 8px;
                    text-transform: uppercase;
                    border: 1px solid #e2e8f0;
                }

                .bio-table td {
                    padding: 6px 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                }

                .bio-table td:nth-child(2) {
                    font-weight: 600;
                    text-align: center;
                }

                /* ========== PES STATEMENT ========== */
                .pes-container {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border: 1px solid #f59e0b;
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 8px;
                }

                .pes-title {
                    font-size: 9px;
                    font-weight: 700;
                    color: #92400e;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .pes-row {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 4px;
                    align-items: baseline;
                }

                .pes-label {
                    background: #f59e0b;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 8px;
                    font-weight: 700;
                    min-width: 20px;
                    text-align: center;
                }

                .pes-text {
                    color: #78350f;
                    font-size: 10px;
                }

                /* ========== GOALS ========== */
                .goals-list {
                    list-style: none;
                    margin-top: 8px;
                }

                .goals-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 6px 0;
                    border-bottom: 1px dashed #e2e8f0;
                }

                .goals-list li:last-child {
                    border-bottom: none;
                }

                .goal-icon {
                    width: 18px;
                    height: 18px;
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 10px;
                    flex-shrink: 0;
                }

                .goal-text {
                    flex: 1;
                    font-size: 10px;
                    color: #475569;
                }

                /* ========== NEXT APPOINTMENT ========== */
                .next-apt {
                    background: linear-gradient(135deg, #ddd6fe, #c4b5fd);
                    border: 1px solid #8b5cf6;
                    border-radius: 8px;
                    padding: 10px 14px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                }

                .next-apt-label {
                    font-size: 9px;
                    color: #5b21b6;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .next-apt-date {
                    font-size: 12px;
                    color: #5b21b6;
                    font-weight: 700;
                }

                /* ========== SIGNATURE ========== */
                .signature-section {
                    margin-top: 30px;
                    display: flex;
                    justify-content: space-between;
                    padding: 0 40px;
                }
                
                .signature-box {
                    text-align: center;
                    width: 200px;
                }
                
                .signature-line {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #94a3b8, transparent);
                    margin-bottom: 5px;
                }
                
                .signature-text {
                    font-size: 8px;
                    color: #64748b;
                    font-weight: 500;
                }

                /* ========== FOOTER ========== */
                .footer {
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 8px;
                }
                
                .footer span {
                    color: #667eea;
                    font-weight: 600;
                }

                /* ========== PRINT ========== */
                @media print {
                    body { 
                        padding: 10px;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .header, .soap-letter, .pes-container, .next-apt, .metric-box {
                        -webkit-print-color-adjust: exact !important;
                    }
                }
            </style>
        </head>
        <body>
            <!-- HEADER -->
            <div class="header">
                <div class="logo-section">
                    <h1>🥗 NutriVida Pro</h1>
                    <p>Historia Clínica Nutricional - Nota SOAP</p>
                </div>
                <div class="doc-info">
                    <div class="folio">FOLIO #${consultation.id}</div>
                    <div>${fecha}</div>
                </div>
            </div>

            <!-- PATIENT + VITALS -->
            <div class="two-columns">
                <!-- Datos del Paciente -->
                <div class="card">
                    <div class="card-title">📋 Datos del Paciente</div>
                    <div class="patient-grid">
                        <div class="patient-field full">
                            <span class="field-label">Nombre:</span>
                            <span class="field-value">${patient.full_name}</span>
                        </div>
                        <div class="patient-field">
                            <span class="field-label">Edad:</span>
                            <span class="field-value">${edad}</span>
                        </div>
                        <div class="patient-field">
                            <span class="field-label">Sexo:</span>
                            <span class="field-value">${patient.gender || '-'}</span>
                        </div>
                        <div class="patient-field">
                            <span class="field-label">Teléfono:</span>
                            <span class="field-value">${patient.phone || '-'}</span>
                        </div>
                        <div class="patient-field">
                            <span class="field-label">Email:</span>
                            <span class="field-value">${patient.email || '-'}</span>
                        </div>
                        <div class="patient-field full">
                            <span class="field-label">Ocupación:</span>
                            <span class="field-value">${patient.occupation || '-'}</span>
                        </div>
                    </div>
                </div>

                <!-- Historial Médico -->
                <div class="card">
                    <div class="card-title red">🏥 Historial Médico</div>
                    <div class="patient-grid">
                        <div class="patient-field full">
                            <span class="field-label">Patologías:</span>
                            <span class="field-value">${patient.medical_conditions || consultation.medical_history || '-'}</span>
                        </div>
                        <div class="patient-field full">
                            <span class="field-label">Alergias:</span>
                            <span class="field-value">${patient.allergies || consultation.allergies || '-'}</span>
                        </div>
                        <div class="patient-field full">
                            <span class="field-label">Medicamentos:</span>
                            <span class="field-value">${consultation.medications || patient.medications || '-'}</span>
                        </div>
                        <div class="patient-field full">
                            <span class="field-label">Suplementos:</span>
                            <span class="field-value">${consultation.supplements || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SOAP SECTIONS -->
            <div class="soap-container">
                
                <!-- S: SUBJETIVO -->
                <div class="soap-row soap-s">
                    <div class="soap-letter">S</div>
                    <div class="soap-content">
                        <div class="soap-header">
                            <span class="soap-title">Subjetivo - Información Reportada por el Paciente</span>
                        </div>
                        
                        <div class="subsection-title">Motivo de Consulta</div>
                        <div class="soap-text">${consultation.subjective || consultation.chief_complaint || 'Sin datos registrados.'}</div>
                        
                        <div class="subsection">
                            <div class="subsection-title">Síntomas Reportados</div>
                            <div class="soap-text">${consultation.symptoms || '-'}</div>
                        </div>

                        <div class="subsection">
                            <div class="patient-grid" style="margin-top: 5px;">
                                <div class="patient-field">
                                    <span class="field-label">Apetito:</span>
                                    <span class="field-value">${consultation.appetite || '-'}</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">Sueño:</span>
                                    <span class="field-value">${consultation.sleep_quality || '-'}</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">Estrés:</span>
                                    <span class="field-value">${consultation.stress_level || '-'}</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">Actividad:</span>
                                    <span class="field-value">${consultation.physical_activity || '-'}</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">Agua/día:</span>
                                    <span class="field-value">${consultation.water_intake || '-'}</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">Evacuación:</span>
                                    <span class="field-value">${consultation.bowel_habits || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- O: OBJETIVO -->
                <div class="soap-row soap-o">
                    <div class="soap-letter">O</div>
                    <div class="soap-content">
                        <div class="soap-header">
                            <span class="soap-title">Objetivo - Datos Medibles y Observables</span>
                        </div>

                        <!-- Antropometría -->
                        <div class="subsection-title">📏 Antropometría</div>
                        <div class="metrics-grid">
                            <div class="metric-box">
                                <div class="metric-label">Peso</div>
                                <div class="metric-value">${consultation.weight || '-'}<span class="metric-unit"> kg</span></div>
                            </div>
                            <div class="metric-box">
                                <div class="metric-label">Talla</div>
                                <div class="metric-value">${consultation.height || '-'}<span class="metric-unit"> cm</span></div>
                            </div>
                            <div class="metric-box">
                                <div class="metric-label">IMC</div>
                                <div class="metric-value">
                                    ${consultation.bmi || '-'}
                                    <span class="imc-badge" style="background: ${imcClass.color}; color: white;">${imcClass.text}</span>
                                </div>
                            </div>
                            <div class="metric-box">
                                <div class="metric-label">Cintura</div>
                                <div class="metric-value">${consultation.waist || '-'}<span class="metric-unit"> cm</span></div>
                            </div>
                        </div>

                        <div class="metrics-grid" style="grid-template-columns: repeat(5, 1fr);">
                            <div class="metric-box">
                                <div class="metric-label">Cadera</div>
                                <div class="metric-value">${consultation.hip || '-'}<span class="metric-unit"> cm</span></div>
                            </div>
                            <div class="metric-box">
                                <div class="metric-label">% Grasa</div>
                                <div class="metric-value">${consultation.body_fat || '-'}<span class="metric-unit"> %</span></div>
                            </div>
                            <div class="metric-box">
                                <div class="metric-label">Masa Muscular</div>
                                <div class="metric-value">${consultation.muscle_mass || '-'}<span class="metric-unit"> kg</span></div>
                            </div>
                            <div class="metric-box">
                                <div class="metric-label">Peso Ideal</div>
                                <div class="metric-value">${consultation.ideal_weight || '-'}<span class="metric-unit"> kg</span></div>
                            </div>
                            <div class="metric-box">
                                <div class="metric-label">ICC</div>
                                <div class="metric-value">${consultation.waist_hip_ratio || '-'}</div>
                            </div>
                        </div>

                        <!-- Signos Vitales -->
                        <div class="subsection">
                            <div class="subsection-title">❤️ Signos Vitales</div>
                            <div class="patient-grid" style="grid-template-columns: repeat(3, 1fr);">
                                <div class="patient-field">
                                    <span class="field-label">P. Arterial:</span>
                                    <span class="field-value">${consultation.blood_pressure || '-'} mmHg</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">F. Cardíaca:</span>
                                    <span class="field-value">${consultation.heart_rate || '-'} lpm</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">Temperatura:</span>
                                    <span class="field-value">${consultation.temperature || '-'} °C</span>
                                </div>
                            </div>
                        </div>

                        <!-- Datos Bioquímicos -->
                        <div class="subsection">
                            <div class="subsection-title">🧪 Datos Bioquímicos (Laboratorios)</div>
                            <table class="bio-table">
                                <tr>
                                    <th>Parámetro</th>
                                    <th>Valor</th>
                                    <th>Parámetro</th>
                                    <th>Valor</th>
                                </tr>
                                <tr>
                                    <td>Glucosa ayunas</td>
                                    <td>${consultation.glucose || '-'} mg/dL</td>
                                    <td>HbA1c</td>
                                    <td>${consultation.hba1c || '-'} %</td>
                                </tr>
                                <tr>
                                    <td>Colesterol Total</td>
                                    <td>${consultation.cholesterol || '-'} mg/dL</td>
                                    <td>Triglicéridos</td>
                                    <td>${consultation.triglycerides || '-'} mg/dL</td>
                                </tr>
                                <tr>
                                    <td>HDL</td>
                                    <td>${consultation.hdl || '-'} mg/dL</td>
                                    <td>LDL</td>
                                    <td>${consultation.ldl || '-'} mg/dL</td>
                                </tr>
                                <tr>
                                    <td>Hemoglobina</td>
                                    <td>${consultation.hemoglobin || '-'} g/dL</td>
                                    <td>Albúmina</td>
                                    <td>${consultation.albumin || '-'} g/dL</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Otros hallazgos -->
                        <div class="subsection">
                            <div class="subsection-title">📝 Otros Hallazgos Clínicos</div>
                            <div class="soap-text">${consultation.objective_notes || consultation.clinical_findings || '-'}</div>
                        </div>
                    </div>
                </div>
                
                <!-- A: ANÁLISIS -->
                <div class="soap-row soap-a">
                    <div class="soap-letter">A</div>
                    <div class="soap-content">
                        <div class="soap-header">
                            <span class="soap-title">Análisis - Diagnóstico Nutricional</span>
                        </div>

                        <!-- PES Statement -->
                        <div class="pes-container">
                            <div class="pes-title">📌 Diagnóstico PES (Problema - Etiología - Signos/Síntomas)</div>
                            <div class="pes-row">
                                <span class="pes-label">P</span>
                                <span class="pes-text"><strong>Problema:</strong> ${consultation.pes_problem || consultation.diagnosis || 'Pendiente de evaluación'}</span>
                            </div>
                            <div class="pes-row">
                                <span class="pes-label">E</span>
                                <span class="pes-text"><strong>Etiología:</strong> ${consultation.pes_etiology || 'relacionado con...'}</span>
                            </div>
                            <div class="pes-row">
                                <span class="pes-label">S</span>
                                <span class="pes-text"><strong>Evidenciado por:</strong> ${consultation.pes_signs || 'signos y síntomas identificados en evaluación'}</span>
                            </div>
                        </div>

                        <div class="subsection">
                            <div class="subsection-title">Interpretación General</div>
                            <div class="soap-text">${consultation.assessment_notes || consultation.interpretation || '-'}</div>
                        </div>

                        <div class="subsection">
                            <div class="patient-grid" style="grid-template-columns: repeat(3, 1fr);">
                                <div class="patient-field">
                                    <span class="field-label">Estado Nutricional:</span>
                                    <span class="field-value">${consultation.nutritional_status || '-'}</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">Riesgo:</span>
                                    <span class="field-value">${consultation.risk_level || '-'}</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">Prioridad:</span>
                                    <span class="field-value">${consultation.priority || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- P: PLAN -->
                <div class="soap-row soap-p">
                    <div class="soap-letter">P</div>
                    <div class="soap-content">
                        <div class="soap-header">
                            <span class="soap-title">Plan - Intervención y Tratamiento</span>
                        </div>

                        <div class="subsection-title">🎯 Metas del Tratamiento (SMART)</div>
                        <div class="soap-text">${consultation.treatment_goals || consultation.treatment_plan || 'Ver dieta adjunta.'}</div>

                        <div class="subsection">
                            <div class="subsection-title">🍽️ Prescripción Dietética</div>
                            <div class="patient-grid" style="grid-template-columns: repeat(4, 1fr); margin-top: 5px;">
                                <div class="patient-field">
                                    <span class="field-label">Kcal/día:</span>
                                    <span class="field-value">${consultation.calories_prescribed || '-'}</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">Proteína:</span>
                                    <span class="field-value">${consultation.protein_prescribed || '-'}g</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">CHO:</span>
                                    <span class="field-value">${consultation.carbs_prescribed || '-'}g</span>
                                </div>
                                <div class="patient-field">
                                    <span class="field-label">Grasas:</span>
                                    <span class="field-value">${consultation.fats_prescribed || '-'}g</span>
                                </div>
                            </div>
                            <div class="soap-text" style="margin-top: 8px;">${consultation.diet_type || '-'}</div>
                        </div>

                        <div class="subsection">
                            <div class="subsection-title">💊 Suplementación Recomendada</div>
                            <div class="soap-text">${consultation.supplements_recommended || '-'}</div>
                        </div>

                        <div class="subsection">
                            <div class="subsection-title">📚 Educación Nutricional</div>
                            <div class="soap-text">${consultation.education_provided || '-'}</div>
                        </div>

                        <div class="subsection">
                            <div class="subsection-title">↗️ Referidos</div>
                            <div class="soap-text">${consultation.referrals || 'Ninguno'}</div>
                        </div>

                        <!-- Próxima Cita -->
                        <div class="next-apt">
                            <span class="next-apt-label">📅 Próxima Cita / Seguimiento</span>
                            <span class="next-apt-date">${consultation.next_appointment ? new Date(consultation.next_appointment).toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Por programar'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SIGNATURES -->
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-text">Firma del Paciente</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-text">Firma y Sello del Nutricionista</div>
                </div>
            </div>

            <!-- FOOTER -->
            <div class="footer">
                Documento generado el ${new Date().toLocaleString('es-EC')} por <span>NutriVida Pro</span> • Sistema de Gestión Nutricional<br>
                Este documento es confidencial y forma parte del expediente clínico del paciente.
            </div>
        </body>
        </html>
    `;

    // 4. Escribir y mostrar
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 500);
};