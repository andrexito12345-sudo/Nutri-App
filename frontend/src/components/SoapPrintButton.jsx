// frontend/src/components/SoapPrintButton.jsx
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { SoapPrintDocument } from './SoapPrintDocument';

const SoapPrintButton = ({ consultation, patient }) => {
    // Referencia exclusiva para este botón
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Consulta_${patient?.full_name || 'Paciente'}_${consultation.id}`,
        onPrintError: (error) => console.error("Error impresión:", error),
    });

    return (
        <>
            {/* 1. DOCUMENTO OCULTO (Pero siempre presente en el DOM) */}
            {/* Usamos un div contenedor para asegurar que la 'ref' siempre funcione */}
            <div style={{ display: "none" }}>
                <div ref={componentRef}>
                    <SoapPrintDocument
                        consultation={consultation}
                        patient={patient}
                    />
                </div>
            </div>

            {/* 2. BOTÓN VISIBLE */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Evita que se cierre el modal al hacer clic
                    handlePrint();
                }}
                className="action-btn"
                title="Imprimir / Guardar PDF"
                style={{
                    marginLeft: 'auto',
                    cursor: 'pointer',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '4px 8px',
                    borderRadius: '6px'
                }}
            >
                🖨️
            </button>
        </>
    );
};

export default SoapPrintButton;