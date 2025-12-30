// frontend/src/pages/LandingPage.jsx
import React, {useEffect, useRef, useState} from "react";
import api from "../api";
import "./LandingPage.css";
import IMCLandingPage from "../components/IMCLandingPage";

// ============================================================
// ICONOS SVG PROFESIONALES - Reemplazan emojis
// ============================================================
const Icons = {
    // Logo de la app (manzana/nutrición)
    Logo: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lp-header__logo-icon">
            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/>
            <path d="M10 2c1 .5 2 2 2 5"/>
        </svg>
    ),

    // Icono del tag (rayo/energía)
    Bolt: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lp-tag__icon">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
    ),

    // Check/verificado
    Check: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    ),

    // Candado (seguridad)
    Lock: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    ),

    // Casa/Home
    Home: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    ),

    // Calendario
    Calendar: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),

    // Usuario
    User: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    ),

    // WhatsApp/Teléfono
    Phone: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
    ),

    // Email
    Mail: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
        </svg>
    ),

    // Ubicación
    MapPin: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
        </svg>
    ),

    // Reloj
    Clock: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    ),

    // Estrella
    Star: () => (
        <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
    ),

    // Quote (comillas)
    Quote: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="quote-icon">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
        </svg>
    ),

    // Check circle (verificado)
    CheckCircle: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="badge-icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    ),

    // Flecha derecha
    ArrowRight: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lp-btn__icon">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
        </svg>
    ),

    // Check para botón
    CheckBtn: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lp-btn__icon">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    )
};

function LandingPage() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        reason: "",
        datetime: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Registrar visita al cargar la página
    const visitRegistered = useRef(false);

    useEffect(() => {
        if (visitRegistered.current) return;
        visitRegistered.current = true;

        api.post("/visits")
            .then(() => console.log("✅ Visita registrada"))
            .catch((err) => console.error("❌ Error:", err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = {
                patient_name: formData.name,
                patient_email: formData.email || null,
                patient_phone: formData.phone,
                reason: formData.reason,
                appointment_datetime: formData.datetime,
            };

            const res = await api.post("/appointments", payload);

            if (res.data && res.data.ok) {
                try {
                    await api.post("/landing/form", {
                        ...formData,
                        appointmentPayload: payload,
                        source: "landing-page",
                    });
                } catch (err) {
                    console.error("❌ Error guardando en landing_leads (Postgres):", err);
                }
                setShowSuccessModal(true);
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    reason: "",
                    datetime: "",
                });
            } else {
                setMessage({
                    type: "error",
                    text: res.data?.message || "No se pudo registrar la cita. Intenta nuevamente.",
                });
            }
        } catch (err) {
            console.error(err);
            setMessage({
                type: "error",
                text: "Ocurrió un error al enviar la solicitud. Revisa tu conexión e intenta de nuevo.",
            });
        } finally {
            setLoading(false);
        }
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const scrollToForm = () => {
        const el = document.getElementById("booking-form");
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleIMCResult = (mensaje) => {
        setFormData((prev) => ({
            ...prev,
            reason: mensaje
        }));
        scrollToForm();
    };

    // ANIMACIÓN DE CONTADORES AL HACER SCROLL (500+, 95%, 3+)
    useEffect(() => {
        const counters = document.querySelectorAll('.lp-hero__stat-number');
        const triggerPoint = window.innerHeight * 0.85; // Activar cuando esté al 85% visible

        const startCounter = (entry) => {
            if (entry.isIntersecting) {
                counters.forEach(counter => {
                    counter.classList.add('animate-counter');

                    const target = counter.textContent.trim();
                    const isPercent = target.includes('%');
                    const finalNumber = parseInt(target.replace(/[^\d]/g, ''));

                    let current = 0;
                    const increment = finalNumber / 60; // 60 frames aprox

                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= finalNumber) {
                            clearInterval(timer);
                            counter.textContent = target; // Asegura el valor final exacto
                        } else {
                            counter.textContent = isPercent
                                ? Math.floor(current) + '%'
                                : (target.includes('+') ? Math.floor(current) + '+' : Math.floor(current));
                        }
                    }, 35);
                });
            }
        };

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                startCounter(entry);
                observer.unobserve(entry.target); // Solo una vez
            }
        }, { threshold: 0.3 });

        const statsSection = document.querySelector('.lp-hero__stats');
        if (statsSection) observer.observe(statsSection);

        return () => {
            if (statsSection) observer.unobserve(statsSection);
        };
    }, []);

    return (
        <div className="lp">
            <main className="lp-main">

                {/* ==================== HERO SECTION ==================== */}
                <section className="lp-hero">
                    <div className="lp-container">
                        <div className="lp-hero__grid">

                            {/* CONTENIDO IZQUIERDO */}
                            <div className="lp-hero__content">
                                <div className="lp-tag">
                                    <Icons.Bolt />
                                    <span>Transformación Nutricional Personalizada</span>
                                </div>

                                <h1 className="lp-hero__title">
                                    <span className="lp-hero__title-gradient">Cambia tu vida</span>
                                    <br />
                                    <span>con nutrición inteligente</span>
                                </h1>

                                <p className="lp-hero__subtitle">
                                    Alcanza tus objetivos de salud con planes personalizados, tecnología avanzada
                                    y el acompañamiento de una profesional certificada.
                                </p>

                                <div className="lp-hero__buttons">
                                    <button
                                        type="button"
                                        className="lp-btn lp-btn--primary lp-btn--large"
                                        onClick={scrollToForm}
                                    >
                                        Comenzar Ahora
                                        <Icons.ArrowRight />
                                    </button>
                                    <button type="button" className="lp-btn lp-btn--outline lp-btn--large">
                                        Ver Planes
                                    </button>
                                </div>

                                {/* STATS */}
                                <div className="lp-hero__stats">
                                    <div className="lp-hero__stat">
                                        <span className="lp-hero__stat-number">500+</span>
                                        <span className="lp-hero__stat-label">Pacientes Felices</span>
                                    </div>
                                    <div className="lp-hero__stat">
                                        <span className="lp-hero__stat-number">95%</span>
                                        <span className="lp-hero__stat-label">Éxito en Metas</span>
                                    </div>
                                    <div className="lp-hero__stat">
                                        <span className="lp-hero__stat-number">3+</span>
                                        <span className="lp-hero__stat-label">Años Experiencia</span>
                                    </div>
                                </div>
                            </div>

                            {/* FORMULARIO */}
                            <div className="lp-hero__form-wrapper" id="booking-form">
                                <div className="lp-hero__form-card">
                                    <div className="lp-hero__form-header">
                                        <div className="lp-avatar">
                                            <span className="lp-avatar__initials">DV</span>
                                        </div>
                                        <div>
                                            <h3 className="lp-hero__form-title">Agenda tu Consulta</h3>
                                            <p className="lp-hero__form-subtitle">
                                                Completamente personalizada para ti
                                            </p>
                                        </div>
                                    </div>

                                    <form className="lp-form" onSubmit={handleSubmit}>
                                        <div className="lp-form__group">
                                            <label className="lp-form__label" htmlFor="name">
                                                Nombre completo
                                            </label>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                className="lp-input"
                                                placeholder="Ej. Ana Martínez"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="lp-form__group">
                                            <label className="lp-form__label" htmlFor="email">
                                                Correo electrónico (opcional)
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                className="lp-input"
                                                placeholder="tu@email.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="lp-form__group">
                                            <label className="lp-form__label" htmlFor="phone">
                                                Teléfono / WhatsApp
                                            </label>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                className="lp-input"
                                                placeholder="09xx xxx xxx"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="lp-form__group">
                                            <label className="lp-form__label" htmlFor="reason">
                                                Motivo de la consulta
                                            </label>
                                            <textarea
                                                id="reason"
                                                name="reason"
                                                className="lp-textarea"
                                                placeholder="Ej. Bajar de peso, control de diabetes..."
                                                rows={3}
                                                value={formData.reason}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="lp-form__group">
                                            <label className="lp-form__label" htmlFor="datetime">
                                                Fecha y hora preferida
                                            </label>
                                            <input
                                                id="datetime"
                                                name="datetime"
                                                type="datetime-local"
                                                className="lp-input"
                                                value={formData.datetime}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="lp-btn lp-btn--primary lp-btn--full"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="lp-spinner"></span>
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    Confirmar Cita
                                                    <Icons.CheckBtn />
                                                </>
                                            )}
                                        </button>

                                        {message.text && (
                                            <div className={`lp-form__message lp-form__message--${message.type}`}>
                                                {message.text}
                                            </div>
                                        )}

                                        <p className="lp-hero__form-note">
                                            <Icons.Lock />
                                            Tus datos están protegidos y son completamente confidenciales
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== SOBRE MÍ / CREDIBILIDAD ==================== */}
                <section className="lp-section lp-section--soft">
                    <div className="lp-container">
                        <div className="lp-section__header">
                            <h2 className="lp-section__title">
                                Tu Nutricionista: <span className="lp-hero__title-gradient">Daniela Vaca</span>
                            </h2>
                            <p className="lp-section__text">
                                Más de 7 años transformando vidas con nutrición clínica y deportiva
                            </p>
                        </div>

                        <div className="lp-about-grid">
                            <img
                                src="/assets/daniela-pro.jpg"
                                alt="Nutricionista Daniela Vaca"
                                className="lp-about__image"
                            />

                            <div className="lp-about__content">
                                <h3 className="lp-about__title">
                                    Licenciada en Nutrición Humana • Magíster en Nutrición Clínica
                                </h3>
                                <ul className="lp-about__list">
                                    <li>
                                        <Icons.Check />
                                        Certificada en Nutrición Deportiva ISSN-SNS (USA)
                                    </li>
                                    <li>
                                        <Icons.Check />
                                        Miembro activo del Colegio de Nutricionistas del Ecuador
                                    </li>
                                    <li>
                                        <Icons.Check />
                                        +500 pacientes atendidos con 95% de éxito en metas
                                    </li>
                                    <li>
                                        <Icons.Check />
                                        Ponente en Congreso Latinoamericano de Obesidad 2024
                                    </li>
                                    <li>
                                        <Icons.Check />
                                        Especialista en diabetes, SOP, tiroides y recomposición corporal
                                    </li>
                                </ul>

                                <div className="lp-about__certs">
                                    <img src="/assets/cert1.png" alt="Certificado" />
                                    <img src="/assets/cert2.png" alt="Certificado" />
                                    <img src="/assets/colegio-nutri.png" alt="Colegio" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== CALCULADORA IMC ==================== */}
                <section className="lp-calculator-section">
                    <div className="lp-calculator-container">
                        <div className="lp-calculator-header">
                            <h2 className="lp-calculator-title">
                                Conoce tu estado de <span className="text-gradient">Salud Real</span>
                            </h2>
                            <p className="lp-calculator-desc">
                                No adivines. Utiliza nuestra herramienta clínica para obtener un
                                pre-diagnóstico instantáneo y tomar decisiones informadas.
                            </p>
                        </div>

                        <IMCLandingPage onAgendar={handleIMCResult} />
                    </div>
                </section>

                {/* ==================== HERRAMIENTAS NUTRICIONALES ==================== */}
                <section className="lp-section lp-section--white">
                    <div className="lp-container">
                        <div className="lp-section__header">
                            <h2 className="lp-section__title">Herramientas Nutricionales Avanzadas</h2>
                            <p className="lp-section__text">
                                Tecnología de vanguardia para tu transformación
                            </p>
                        </div>

                        <div className="lp-tools-grid">
                            <div className="lp-tool-card lp-tool-card--blue">
                                <div className="lp-tool-card__icon">
                                    <video
                                        src="/assets/lottie/doctor-online.webm"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                </div>
                                <h3 className="lp-tool-card__title">Análisis Corporal</h3>
                                <p className="lp-tool-card__desc">
                                    Evaluación completa de composición con bioimpedancia profesional
                                </p>
                            </div>

                            <div className="lp-tool-card lp-tool-card--green">
                                <div className="lp-tool-card__icon">
                                    <video
                                        src="/assets/lottie/doctorwoman.webm"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                </div>
                                <h3 className="lp-tool-card__title">Seguimiento Digital</h3>
                                <p className="lp-tool-card__desc">
                                    App exclusiva para monitorear tu progreso en tiempo real
                                </p>
                            </div>

                            <div className="lp-tool-card lp-tool-card--purple">
                                <div className="lp-tool-card__icon">
                                    <video
                                        src="/assets/lottie/Glass%20of%20Water.webm"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                </div>
                                <h3 className="lp-tool-card__title">Plan de Hidratación</h3>
                                <p className="lp-tool-card__desc">
                                    Calculadora inteligente adaptada a tu metabolismo
                                </p>
                            </div>

                            <div className="lp-tool-card lp-tool-card--rose">
                                <div className="lp-tool-card__icon">
                                    <video
                                        src="/assets/lottie/recetas-3.webm"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                </div>
                                <h3 className="lp-tool-card__title">Recetas Personalizadas</h3>
                                <p className="lp-tool-card__desc">
                                    Base de datos con más de 500 recetas saludables
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== PARA QUIÉN ES ==================== */}
                <section className="lp-section lp-section--soft">
                    <div className="lp-container">
                        <div className="lp-section__header">
                            <h2 className="lp-section__title">¿Para quién es este programa?</h2>
                        </div>

                        <div className="lp-cards-grid">
                            <div className="lp-card lp-card--hover">
                                <h3 className="lp-card__title">Control de Peso</h3>
                                <ul className="lp-card__list">
                                    <li><Icons.Check /> Pérdida de peso sostenible sin rebote</li>
                                    <li><Icons.Check /> Aumento de masa muscular saludable</li>
                                    <li><Icons.Check /> Mejora de composición corporal</li>
                                    <li><Icons.Check /> Planes flexibles y realistas</li>
                                </ul>
                            </div>

                            <div className="lp-card lp-card--hover">
                                <h3 className="lp-card__title">Condiciones de Salud</h3>
                                <ul className="lp-card__list">
                                    <li><Icons.Check /> Diabetes y prediabetes</li>
                                    <li><Icons.Check /> Colesterol y triglicéridos altos</li>
                                    <li><Icons.Check /> Hipertensión arterial</li>
                                    <li><Icons.Check /> Síndrome metabólico</li>
                                </ul>
                            </div>

                            <div className="lp-card lp-card--hover">
                                <h3 className="lp-card__title">Salud Hormonal</h3>
                                <ul className="lp-card__list">
                                    <li><Icons.Check /> Síndrome de ovario poliquístico</li>
                                    <li><Icons.Check /> Hipotiroidismo e hipertiroidismo</li>
                                    <li><Icons.Check /> Menopausia y andropausia</li>
                                    <li><Icons.Check /> Resistencia a la insulina</li>
                                </ul>
                            </div>

                            <div className="lp-card lp-card--hover">
                                <h3 className="lp-card__title">Rendimiento Deportivo</h3>
                                <ul className="lp-card__list">
                                    <li><Icons.Check /> Nutrición para competiciones</li>
                                    <li><Icons.Check /> Ganancia de masa muscular</li>
                                    <li><Icons.Check /> Optimización de energía</li>
                                    <li><Icons.Check /> Recuperación post-entrenamiento</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== TESTIMONIOS ==================== */}
                <section className="lp-section lp-section--testimonials">
                    <div className="lp-container">
                        <div className="lp-section__header">
                            <h2 className="lp-section__title">Lo que dicen nuestros pacientes</h2>
                            <p className="lp-section__text">
                                Historias reales de transformación y bienestar
                            </p>
                        </div>

                        <div className="lp-testimonials-grid">
                            {/* Testimonio 1 */}
                            <article className="lp-testimonial-card">
                                <div className="lp-testimonial-card__quote">
                                    <Icons.Quote />
                                </div>
                                <div className="lp-testimonial-card__content">
                                    <div className="lp-testimonial-card__stars">
                                        <Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star />
                                    </div>
                                    <p className="lp-testimonial-card__text">
                                        Perdí 12 kilos en 4 meses sin pasar hambre. Daniela me enseñó a comer bien y ahora lo hago de forma natural.
                                    </p>
                                    <div className="lp-testimonial-card__author">
                                        <div className="lp-testimonial-card__avatar"><span>MP</span></div>
                                        <div className="lp-testimonial-card__info">
                                            <p className="author-name">María Paz</p>
                                            <p className="author-role">Empresaria, 35 años</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="lp-testimonial-card__badge">
                                    <Icons.CheckCircle />
                                    <span>Verificado</span>
                                </div>
                            </article>

                            {/* Testimonio 2 */}
                            <article className="lp-testimonial-card">
                                <div className="lp-testimonial-card__quote">
                                    <Icons.Quote />
                                </div>
                                <div className="lp-testimonial-card__content">
                                    <div className="lp-testimonial-card__stars">
                                        <Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star />
                                    </div>
                                    <p className="lp-testimonial-card__text">
                                        Mis triglicéridos bajaron de 300 a 120 en solo 3 meses. Mi médico está impresionado con los resultados.
                                    </p>
                                    <div className="lp-testimonial-card__author">
                                        <div className="lp-testimonial-card__avatar"><span>CR</span></div>
                                        <div className="lp-testimonial-card__info">
                                            <p className="author-name">Carlos Ruiz</p>
                                            <p className="author-role">Ingeniero, 42 años</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="lp-testimonial-card__badge">
                                    <Icons.CheckCircle />
                                    <span>Verificado</span>
                                </div>
                            </article>

                            {/* Testimonio 3 */}
                            <article className="lp-testimonial-card">
                                <div className="lp-testimonial-card__quote">
                                    <Icons.Quote />
                                </div>
                                <div className="lp-testimonial-card__content">
                                    <div className="lp-testimonial-card__stars">
                                        <Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star />
                                    </div>
                                    <p className="lp-testimonial-card__text">
                                        Aprendí a organizar las comidas de toda la familia. Mis hijos ahora comen mejor y sin peleas en la mesa.
                                    </p>
                                    <div className="lp-testimonial-card__author">
                                        <div className="lp-testimonial-card__avatar"><span>AM</span></div>
                                        <div className="lp-testimonial-card__info">
                                            <p className="author-name">Ana Morales</p>
                                            <p className="author-role">Madre de 2, 38 años</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="lp-testimonial-card__badge">
                                    <Icons.CheckCircle />
                                    <span>Verificado</span>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ==================== PLANES / PRICING ==================== */}
                <section className="lp-pricing lp-section">
                    <div className="lp-container">
                        <div className="lp-pricing__header">
                            <h2 className="lp-pricing__title">
                                Planes <span>Transparentes</span> Sin Letras Pequeñas
                            </h2>
                            <p className="lp-pricing__subtitle">
                                Elige el plan que mejor se adapte a tu objetivo.
                                <strong> Todos incluyen garantía de resultados o te devolvemos tu dinero</strong>
                            </p>
                        </div>

                        <div className="lp-pricing__grid">
                            {/* Plan Essential */}
                            <div className="lp-price-card">
                                <h3>Plan Essential</h3>
                                <div className="lp-price">$69<small>/mes</small></div>
                                <ul className="lp-features">
                                    <li><strong>1 consulta inicial</strong> + 2 seguimientos</li>
                                    <li>Plan nutricional 100% personalizado</li>
                                    <li>Acceso a app de seguimiento</li>
                                    <li>Soporte por WhatsApp</li>
                                </ul>
                                <button className="lp-btn lp-btn--outline" onClick={scrollToForm}>
                                    Elegir Plan
                                </button>
                            </div>

                            {/* Plan Transformación */}
                            <div className="lp-price-card lp-price-card--featured">
                                <div className="lp-badge-popular">MÁS VENDIDO</div>
                                <h3>Plan Transformación Total</h3>
                                <div className="lp-price">$119<small>/mes</small></div>
                                <ul className="lp-features">
                                    <li><strong>Consulta inicial</strong> + seguimientos semanales</li>
                                    <li>Análisis corporal con bioimpedancia</li>
                                    <li>Plan + <strong>recetario semanal</strong> + lista de compras</li>
                                    <li>Grupo VIP de WhatsApp + ajustes ilimitados</li>
                                    <li>Bonus: <strong>Plan de ejercicio en casa 8 semanas</strong></li>
                                </ul>
                                <button className="lp-btn lp-btn--primary" onClick={scrollToForm}>
                                    Quiero Este Plan
                                </button>
                            </div>

                            {/* Plan Élite */}
                            <div className="lp-price-card">
                                <h3>Plan Élite 1:1</h3>
                                <div className="lp-price">$199<small>/mes</small></div>
                                <ul className="lp-features">
                                    <li><strong>Todo lo del plan anterior</strong></li>
                                    <li>Llamadas 1:1 ilimitadas</li>
                                    <li>Análisis genético nutricional (opcional)</li>
                                    <li>Sesiones presenciales en Milagro</li>
                                </ul>
                                <button className="lp-btn lp-btn--outline" onClick={scrollToForm}>
                                    Contactarme
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== CTA FINAL ==================== */}
                <section className="lp-cta">
                    <div className="lp-container">
                        <div className="lp-cta__content">
                            <h2 className="lp-cta__title">¿Lista para transformar tu salud?</h2>
                            <p className="lp-cta__text">
                                Da el primer paso hoy. Tu mejor versión te espera.
                            </p>
                            <button
                                type="button"
                                className="lp-btn lp-btn--white lp-btn--large"
                                onClick={scrollToForm}
                            >
                                Agendar mi Primera Consulta
                            </button>
                        </div>
                    </div>
                </section>

                {/* ==================== FOOTER ==================== */}
                <footer className="lp-footer">
                    <div className="lp-container">
                        <div className="lp-footer__grid">
                            <div className="lp-footer__col">
                                <div className="lp-footer__brand">
                                    <div className="lp-footer__logo">
                                        <Icons.Logo />
                                    </div>
                                    <span className="lp-footer__name">NutriVida Pro</span>
                                </div>
                                <p className="lp-footer__text">
                                    Transformando vidas a través de la nutrición inteligente y personalizada.
                                </p>
                            </div>

                            <div className="lp-footer__col">
                                <h4 className="lp-footer__title">Servicios</h4>
                                <ul className="lp-footer__list">
                                    <li>Consulta Nutricional</li>
                                    <li>Planes Personalizados</li>
                                    <li>Seguimiento Digital</li>
                                    <li>Análisis Corporal</li>
                                </ul>
                            </div>

                            <div className="lp-footer__col">
                                <h4 className="lp-footer__title">Contacto</h4>
                                <ul className="lp-footer__list">
                                    <li><Icons.Phone /> +593 9xx xxx xxx</li>
                                    <li><Icons.Mail /> info@nutrivida.com</li>
                                    <li><Icons.MapPin /> Milagro, Guayas, Ecuador</li>
                                </ul>
                            </div>

                            <div className="lp-footer__col">
                                <h4 className="lp-footer__title">Horarios</h4>
                                <ul className="lp-footer__list">
                                    <li><Icons.Clock /> Lunes a Viernes</li>
                                    <li>09:00 - 18:00</li>
                                    <li>Sábados (con cita previa)</li>
                                    <li>09:00 - 13:00</li>
                                </ul>
                            </div>
                        </div>

                        <div className="lp-footer__bottom">
                            <p>© 2025 NutriVida Pro. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </footer>

                {/* ==================== MODAL DE ÉXITO ==================== */}
                {showSuccessModal && (
                    <div className="lp-modal-overlay">
                        <div className="lp-modal-card">
                            <div className="lp-success-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>

                            <h3 className="lp-modal-title">¡Solicitud Enviada!</h3>

                            <p className="lp-modal-text">
                                Gracias por dar el primer paso hacia tu bienestar.
                                <br/><br/>
                                Hemos recibido tus datos correctamente. Te contactaremos vía <strong>WhatsApp</strong> en breve para confirmar tu horario.
                            </p>

                            <button className="lp-modal-btn" onClick={closeSuccessModal}>
                                Entendido, gracias
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default LandingPage;