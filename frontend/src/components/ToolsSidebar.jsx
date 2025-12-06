import React from 'react';
import './ToolsSidebar.css';

const ToolsSidebar = ({ isOpen, onClose, onOpenStats, onOpenIMC, onOpenFoods, onOpenDiet, onOpenHerramientasAvanzadas }) => {
    return (
        <>
            {/* Fondo oscurecido */}
            <div
                className={`tools-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            {/* Panel lateral */}
            <aside
                className={`tools-sidebar ${isOpen ? 'open' : ''}`}
                aria-label="Menú principal de herramientas"
            >
                {/* HEADER */}
                <header className="tools-header">
                    <div className="tools-header-main">
                        <div className="tools-header-pill">
                            {/* Icono de hoja/nutrición */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                            </svg>
                        </div>
                        <div className="tools-header-text">
                            <h2>Menú Principal</h2>
                            <p>Herramientas clínicas y gestión</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Cerrar menú"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* CONTENIDO */}
                <div className="tools-content">

                    {/* Sección: Gestión y análisis */}
                    <section className="tools-section">
                        <p className="tools-section-label">Gestión y análisis</p>

                        <button
                            type="button"
                            className="nav-tool-btn"
                            onClick={() => {
                                onOpenStats();
                                onClose();
                            }}
                        >
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3v18h18" />
                                    <path d="M7 16v-4" />
                                    <path d="M11 16v-8" />
                                    <path d="M15 16v-6" />
                                    <path d="M19 16v-10" />
                                </svg>
                            </div>
                            <div className="text">
                                <strong>Panel de Estadísticas</strong>
                                <p>Métricas de citas y pacientes</p>
                            </div>
                            <span className="arrow" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </span>
                        </button>
                    </section>

                    {/* Sección: Herramientas clínicas */}
                    <section className="tools-section">
                        <p className="tools-section-label">Herramientas clínicas</p>

                        <button
                            type="button"
                            className="nav-tool-btn"
                            onClick={() => {
                                onOpenIMC();
                                onClose();
                            }}
                        >
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="5" />
                                    <path d="M12 8v3" />
                                    <path d="M12 8l2-2" />
                                    <path d="M3 21h18" />
                                    <path d="M5 21v-2a2 2 0 012-2h10a2 2 0 012 2v2" />
                                </svg>
                            </div>
                            <div className="text">
                                <strong>Calculadora IMC</strong>
                                <p>Evaluación de peso y talla</p>
                            </div>
                            <span className="arrow" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="nav-tool-btn"
                            onClick={() => {
                                onOpenFoods();
                                onClose();
                            }}
                        >
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 6h16" />
                                    <path d="M4 10h16" />
                                    <path d="M4 14h16" />
                                    <path d="M4 18h16" />
                                    <circle cx="8" cy="6" r="1" fill="currentColor" />
                                    <circle cx="8" cy="10" r="1" fill="currentColor" />
                                    <circle cx="8" cy="14" r="1" fill="currentColor" />
                                    <circle cx="8" cy="18" r="1" fill="currentColor" />
                                </svg>
                            </div>
                            <div className="text">
                                <strong>Tabla Nutricional</strong>
                                <p>Consulta de macros y calorías</p>
                            </div>
                            <span className="arrow" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="nav-tool-btn"
                            onClick={() => {
                                if (onOpenDiet) onOpenDiet();
                                onClose();
                            }}
                        >
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <path d="M14 2v6h6" />
                                    <path d="M8 13h8" />
                                    <path d="M8 17h8" />
                                    <path d="M8 9h2" />
                                </svg>
                            </div>
                            <div className="text">
                                <strong>Generador de Dietas</strong>
                                <p>Creación de planes automáticos</p>
                            </div>
                            <span className="arrow" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </span>
                        </button>

                        {/* AQUÍ VA EL NUEVO BOTÓN - HERRAMIENTAS AVANZADAS */}
                        <button
                            type="button"
                            className="nav-tool-btn premium-tool"
                            onClick={() => {
                                onOpenHerramientasAvanzadas();
                            }}
                        >
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a10 10 0 0 1 10 10a10 10 0 0 1 -10 10a10 10 0 0 1 -10 -10a10 10 0 0 1 10 -10z" />
                                    <path d="M12 8v4l3 3" />
                                    <circle cx="12" cy="12" r="8" fill="none" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <div className="text">
                                <strong style={{ color: '#9333ea' }}>Herramientas Avanzadas PRO</strong>
                                <p style={{ color: '#a855f7' }}>TMB • FFMI • % Grasa • PDF • Reverse • Macros</p>
                            </div>
                            <span className="arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
        </svg>
    </span>
                        </button>

                    </section>
                </div>

                {/* FOOTER */}
                <footer className="tools-footer">
                    <span>NutriVida Pro</span>
                </footer>
            </aside>
        </>
    );
};

export default ToolsSidebar;