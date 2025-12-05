import React from 'react';
import './SoapPrintDocument.css';

// Usamos forwardRef para permitir que el botón de imprimir encuentre este componente
export const SoapPrintDocument = React.forwardRef((props, ref) => {
    const { consultation, patient } = props;

    // VALIDACIÓN DE SEGURIDAD:
    // Si por alguna razón los datos no llegan, mostramos un div vacío pero CON REF
    // Esto evita el error "There is nothing to print"
    if (!consultation || !patient) {
        return <div ref={ref} className={"print-document"}>Datos insuficientes para imprimir</div>;
    }

    const formatDate = (isoString) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleDateString("es-EC", {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // EL DOCUMENTO REAL
    return (
        <div ref={ref} className="print-document">
            {/* ENCABEZADO */}
            <header className="print-header">
                <div className="header-logo">
                    <span style={{fontSize: '2.5rem'}}>🍎</span>
                    <div>
                        <h1>NutriVida Pro</h1>
                        <p>Dra. Nutricionista</p>
                        <p>Reg. Prof. 123-456</p>
                    </div>
                </div>
                <div className="header-meta">
                    <p><strong>Fecha:</strong> {formatDate(consultation.consultation_date)}</p>
                    <p><strong>Folio:</strong> #{consultation.id}</p>
                </div>
            </header>

            <hr className="divider"/>

            {/* DATOS DEL PACIENTE */}
            <section className="print-patient-info">
                <div className="info-row">
                    <div className="info-col">
                        <strong>Paciente:</strong> {patient.full_name}
                    </div>
                    <div className="info-col">
                        <strong>Edad:</strong> {patient.birth_date ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear() : "-"} años
                    </div>
                </div>
                <div className="info-row">
                    <div className="info-col">
                        <strong>Email:</strong> {patient.email || "No registrado"}
                    </div>
                    <div className="info-col">
                        <strong>Teléfono:</strong> {patient.phone}
                    </div>
                </div>
            </section>

            {/* TABLA SOAP */}
            <main className="soap-print-grid">

                {/* S - SUBJETIVO */}
                <div className="print-section section-s">
                    <div className="section-title">S - SUBJETIVO</div>
                    <div className="section-content">
                        {consultation.subjective || "Sin datos registrados."}
                    </div>
                </div>

                {/* O - OBJETIVO */}
                <div className="print-section section-o">
                    <div className="section-title">O - OBJETIVO</div>
                    <div className="section-content">
                        <div className="metrics-print-row">
                            <span><strong>Peso:</strong> {consultation.weight} kg</span>
                            <span><strong>Talla:</strong> {consultation.height} cm</span>
                            <span><strong>IMC:</strong> {consultation.bmi}</span>
                        </div>
                        <p style={{marginTop:'10px'}}><strong>Notas:</strong> {consultation.objective_notes || "-"}</p>
                    </div>
                </div>

                {/* A - ANÁLISIS */}
                <div className="print-section section-a">
                    <div className="section-title">A - ANÁLISIS</div>
                    <div className="section-content">
                        {consultation.diagnosis || "Sin diagnóstico."}
                    </div>
                </div>

                {/* P - PLAN */}
                <div className="print-section section-p">
                    <div className="section-title">P - PLAN</div>
                    <div className="section-content">
                        {consultation.treatment_plan || "Sin plan."}
                    </div>
                </div>

            </main>

            <footer className="print-footer">
                <div className="signature-box">
                    <div className="signature-line"></div>
                    <p>Firma del Profesional</p>
                </div>
                <p className="footer-note">Generado por NutriVida Pro</p>
            </footer>
        </div>
    );
});