// frontend/src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

function Header({ onOpenTools }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // 1. DETECTAR RUTAS
    const isLandingPage = location.pathname === "/";
    const isLoginPage = location.pathname === "/doctora/login";
    const isDashboard = location.pathname === "/doctora/dashboard";
    const isDoctorArea = location.pathname.startsWith("/doctora");
    const isConsultation = location.pathname.startsWith("/consulta");

    // 2. VERIFICAR SI ESTÁ LOGUEADO
    const checkIfLoggedIn = () => {
        const token = localStorage.getItem("nutri_token");
        if (isDashboard || (isDoctorArea && !isLoginPage) || isConsultation) {
            return true;
        }
        return Boolean(token);
    };

    const isLoggedIn = checkIfLoggedIn();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("nutri_token");
        navigate("/");
        setTimeout(() => window.location.reload(), 100);
    };

    const scrollToForm = () => {
        if (isLandingPage) {
            const el = document.getElementById("booking-form");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleLogoClick = () => {
        if (isLoggedIn) {
            navigate("/doctora/dashboard");
        } else {
            navigate("/");
        }
    };

    return (
        <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
            <div className="header__container">
                {/* Logo + Nombre */}
                <div
                    className="header__brand"
                    onClick={handleLogoClick}
                    style={{ cursor: "pointer" }}
                    title={isLoggedIn ? "Ir al Dashboard" : "Ir al Inicio"}
                >
                    <div className="header__logo">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="header__logo-svg"
                        >
                            <path
                                d="M12 2C13.5 2 14.5 3 14.5 3C14.5 3 15.5 2.5 16.5 3C17.5 3.5 17 5 17 5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M12 5C8 5 5 8.5 5 12.5C5 17 8 21 12 21C16 21 19 17 19 12.5C19 8.5 16 5 12 5Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12 5V8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M14.5 3C16 3.5 17.5 3 18.5 2C18 4 16 5.5 14 5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <span className="header__name">NutriVida Pro</span>
                </div>

                {/* Navegación derecha */}
                <nav className="header__nav">

                    {/* CASO 1: VISTA DE CONSULTA (SOAP) */}
                    {isConsultation && (
                        <>
                            <button
                                type="button"
                                className="header-btn header-btn--ghost"
                                onClick={() => navigate("/doctora/dashboard")}
                                title="Volver al Dashboard"
                            >
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                                </svg>
                                <span className="header-btn__text">Volver</span>
                            </button>
                            <button
                                type="button"
                                className="header-btn header-btn--logout"
                                onClick={handleLogout}
                                title="Cerrar sesión"
                            >
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                                <span className="header-btn__text">Salir</span>
                            </button>
                        </>
                    )}

                    {/* CASO 2: LANDING PAGE - No logueado */}
                    {isLandingPage && !isLoggedIn && (
                        <>
                            <button
                                type="button"
                                className="header-btn header-btn--ghost"
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                title="Inicio"
                            >
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                                <span className="header-btn__text">Inicio</span>
                            </button>
                            <button
                                type="button"
                                className="header-btn header-btn--outline"
                                onClick={scrollToForm}
                                title="Agendar Cita"
                            >
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <span className="header-btn__text">Agendar</span>
                            </button>
                            <button
                                type="button"
                                className="header-btn header-btn--primary"
                                onClick={() => navigate("/doctora/login")}
                                title="Acceso Doctora"
                            >
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                <span className="header-btn__text">Acceso</span>
                            </button>
                        </>
                    )}

                    {/* CASO 3: LANDING PAGE - Logueado */}
                    {isLandingPage && isLoggedIn && (
                        <>
                            <button
                                type="button"
                                className="header-btn header-btn--primary"
                                onClick={() => navigate("/doctora/dashboard")}
                                title="Ir al Dashboard"
                            >
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7"/>
                                    <rect x="14" y="3" width="7" height="7"/>
                                    <rect x="14" y="14" width="7" height="7"/>
                                    <rect x="3" y="14" width="7" height="7"/>
                                </svg>
                                <span className="header-btn__text">Dashboard</span>
                            </button>
                            <button
                                type="button"
                                className="header-btn header-btn--logout"
                                onClick={handleLogout}
                                title="Cerrar sesión"
                            >
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                                <span className="header-btn__text">Salir</span>
                            </button>
                        </>
                    )}

                    {/* CASO 4: LOGIN PAGE */}
                    {isLoginPage && (
                        <button
                            type="button"
                            className="header-btn header-btn--ghost"
                            onClick={() => navigate("/")}
                            title="Volver al inicio"
                        >
                            <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                            <span className="header-btn__text">Volver</span>
                        </button>
                    )}

                    {/* CASO 5: DASHBOARD */}
                    {isDashboard && (
                        <>
                            <button
                                type="button"
                                className="header-btn header-btn--ghost"
                                onClick={() => navigate("/")}
                                title="Ir al Inicio"
                            >
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                                <span className="header-btn__text">Inicio</span>
                            </button>
                            <button
                                type="button"
                                className="header-btn header-btn--logout"
                                onClick={handleLogout}
                                title="Cerrar sesión"
                            >
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                                <span className="header-btn__text">Salir</span>
                            </button>

                            {/* Botón Menú */}
                            <button
                                type="button"
                                className="menu-hamburger-btn"
                                onClick={onOpenTools}
                                title="Menú de Herramientas"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;