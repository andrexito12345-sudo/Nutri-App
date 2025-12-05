// frontend/src/pages/LandingPage.jsx
import React, {useEffect, useRef, useState} from "react";
import api from "../api";
import "./LandingPage.css";
import IMCLandingPage from "../components/IMCLandingPage";

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

    // ✅ REGISTRAR VISITA AL CARGAR LA PÁGINA
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
                setMessage({
                    type: "success",
                    text: "¡Excelente! Tu solicitud fue enviada. Te contactaremos pronto para confirmar tu cita.",
                });
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

    const scrollToForm = () => {
        const el = document.getElementById("booking-form");
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // FUNCION NUEVA: Recibe el resultado del IMC y rellena el formulario
    const handleIMCResult = (mensaje) => {
        setFormData((prev) => ({
            ...prev,
            reason: mensaje // Rellena el motivo automáticamente
        }));
        scrollToForm(); // Baja suavemente al formulario
    };

    return (
        <div className="lp">

            <main className="lp-main">
                {/* HERO SECTION */}
                <section className="lp-hero">
                    <div className="lp-container">
                        <div className="lp-hero__grid">
                            {/* CONTENIDO IZQUIERDO */}
                            <div className="lp-hero__content">
                                <div className="lp-tag">
                                    <span className="lp-tag__icon">⚡</span>
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
                                    </button>
                                    <button type="button" className="lp-btn lp-btn--outline lp-btn--large">
                                        Ver Planes
                                    </button>
                                </div>

                                {/* STATS */}
                                <div className="lp-hero__stats">
                                    <div className="lp-hero__stat">
                                        <div className="lp-hero__stat-number">500+</div>
                                        <div className="lp-hero__stat-label">Pacientes Felices</div>
                                    </div>
                                    <div className="lp-hero__stat">
                                        <div className="lp-hero__stat-number">95%</div>
                                        <div className="lp-hero__stat-label">Éxito en Metas</div>
                                    </div>
                                    <div className="lp-hero__stat">
                                        <div className="lp-hero__stat-number">3+</div>
                                        <div className="lp-hero__stat-label">Años Experiencia</div>
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
                                                    <span className="lp-btn__icon">✓</span>

                                                </>
                                            )}
                                        </button>

                                        {message.text && (
                                            <div className={`lp-form__message lp-form__message--${message.type}`}>
                                                {message.text}
                                            </div>
                                        )}

                                        <p className="lp-hero__form-note">
                                            🔒 Tus datos están protegidos y son completamente confidenciales
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* ====================== SOBRE MÍ / CREDIBILIDAD ====================== */}
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

                        <div className="lp-hero__grid" style={{alignItems: 'center'}}>
                            <div>
                                <img
                                    src="/assets/daniela-pro.jpg"
                                    alt="Nutricionista Daniela Vargas"
                                    style={{borderRadius: '1.5rem', width: '100%', boxShadow: '0 20px 40px rgba(75,0,130,0.2)'}}
                                />
                            </div>

                            <div>
                                <h3 style={{fontSize: '1.8rem', marginBottom: '1.5rem'}}>
                                    Licenciada en Nutrición Humana • Magíster en Nutrición Clínica
                                </h3>
                                <ul style={{listStyle: 'none', fontSize: '1.1rem', lineHeight: '2'}} className="lp-card__list">
                                    <li>✔ Certificada en Nutrición Deportiva ISSN-SNS (USA)</li>
                                    <li>✔ Miembro activo del Colegio de Nutricionistas del Ecuador</li>
                                    <li>✔ +500 pacientes atendidos con 95% de éxito en metas</li>
                                    <li>✔ Ponente en Congreso Latinoamericano de Obesidad 2024</li>
                                    <li>✔ Especialista en diabetes, SOP, tiroides y recomposición corporal</li>
                                </ul>

                                <div style={{marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                                    <img src="/assets/cert1.png" alt="Certificado" style={{height: '70px', borderRadius: '8px'}} />
                                    <img src="/assets/cert2.png" alt="Certificado" style={{height: '70px', borderRadius: '8px'}} />
                                    <img src="/assets/colegio-nutri.png" alt="Colegio" style={{height: '70px', borderRadius: '8px'}} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECCION DE LA CALCULADORA IMC - VERSIÓN MEJORADA */}
                <section className="lp-calculator-section">
                    <div className="lp-calculator-container">

                        {/* Encabezado de la sección */}
                        <div className="lp-calculator-header">
                            <h2 className="lp-calculator-title">
                                Conoce tu estado de <span className="text-gradient">Salud Real</span>
                            </h2>
                            <p className="lp-calculator-desc">
                                No adivines. Utiliza nuestra herramienta clínica para obtener un
                                pre-diagnóstico instantáneo y tomar decisiones informadas.
                            </p>
                        </div>

                        {/* COMPONENTE CALCULADORA IMPORTADO */}
                        <IMCLandingPage onAgendar={handleIMCResult} />

                    </div>
                </section>


                {/* HERRAMIENTAS NUTRICIONALES */}
                <section className="lp-section lp-section--white">
                    <div className="lp-container">
                        <div className="lp-section__header">
                            <h2 className="lp-section__title">Herramientas Nutricionales Avanzadas</h2>
                            <p className="lp-section__text">
                                Tecnología de vanguardia para tu transformación
                            </p>
                        </div>

                        <div className="lp-tools-grid">
                            {/* Análisis Corporal */}
                            <div className="lp-tool-card lp-tool-card--blue">
                                <div className="lp-tool-card__icon">
                                    <video
                                        src="/assets/lottie/doctor-online.webm"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        style={{
                                            width: '140px',      /* ← AQUÍ LO HACEMOS MÁS GRANDE */
                                            height: '140px',     /* ← mismo alto que ancho */
                                            maxWidth: 'none',    /* ← importante para que no se limite */
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </div>
                                <h3 className="lp-tool-card__title">Análisis Corporal</h3>
                                <p className="lp-tool-card__desc">
                                    Evaluación completa de composición con bioimpedancia profesional
                                </p>
                            </div>

                            {/* Seguimiento Digital */}
                            <div className="lp-tool-card lp-tool-card--green">
                                <div className="lp-tool-card__icon">
                                    <video
                                        src="/assets/lottie/doctorwoman.webm"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        style={{
                                            width: '140px',      /* ← AQUÍ LO HACEMOS MÁS GRANDE */
                                            height: '140px',     /* ← mismo alto que ancho */
                                            maxWidth: 'none',    /* ← importante para que no se limite */
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </div>
                                <h3 className="lp-tool-card__title">Seguimiento Digital</h3>
                                <p className="lp-tool-card__desc">
                                    App exclusiva para monitorear tu progreso en tiempo real
                                </p>
                            </div>

                            {/* Plan de Hidratación */}
                            <div className="lp-tool-card lp-tool-card--purple">
                                <div className="lp-tool-card__icon">
                                    <video
                                        src="/assets/lottie/Glass%20of%20Water.webm"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        style={{
                                            width: '140px',      /* ← AQUÍ LO HACEMOS MÁS GRANDE */
                                            height: '140px',     /* ← mismo alto que ancho */
                                            maxWidth: 'none',    /* ← importante para que no se limite */
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </div>
                                <h3 className="lp-tool-card__title">Plan de Hidratación</h3>
                                <p className="lp-tool-card__desc">
                                    Calculadora inteligente adaptada a tu metabolismo
                                </p>
                            </div>

                            {/* Recetas Personalizadas */}
                            <div className="lp-tool-card lp-tool-card--rose">
                                <div className="lp-tool-card__icon">
                                    <video
                                        src="/assets/lottie/recetas-3.webm"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        style={{
                                            width: '140px',      /* ← AQUÍ LO HACEMOS MÁS GRANDE */
                                            height: '140px',     /* ← mismo alto que ancho */
                                            maxWidth: 'none',    /* ← importante para que no se limite */
                                            pointerEvents: 'none'
                                        }}
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

                {/* PARA QUIÉN ES – VERSIÓN PREMIUM CON HOVER */}
                <section className="lp-section lp-section--soft">
                    <div className="lp-container">
                        <div className="lp-section__header">
                            <h2 className="lp-section__title">¿Para quién es este programa?</h2>
                        </div>

                        <div className="lp-cards-grid lp-cards-grid--hover">
                            {/* CARD 1 */}
                            <div className="lp-card lp-card--hover lp-card--purple">
                                <h3 className="lp-card__title">Control de Peso</h3>
                                <ul className="lp-card__list">
                                    <li>✓ Pérdida de peso sostenible sin rebote</li>
                                    <li>✓ Aumento de masa muscular saludable</li>
                                    <li>✓ Mejora de composición corporal</li>
                                    <li>✓ Planes flexibles y realistas</li>
                                </ul>
                            </div>

                            {/* CARD 2 */}
                            <div className="lp-card lp-card--hover lp-card--blue">
                                <h3 className="lp-card__title">Condiciones de Salud</h3>
                                <ul className="lp-card__list">
                                    <li>✓ Diabetes y prediabetes</li>
                                    <li>✓ Colesterol y triglicéridos altos</li>
                                    <li>✓ Hipertensión arterial</li>
                                    <li>✓ Síndrome metabólico</li>
                                </ul>
                            </div>

                            {/* CARD 3 */}
                            <div className="lp-card lp-card--hover lp-card--green">
                                <h3 className="lp-card__title">Bienestar Integral</h3>
                                <ul className="lp-card__list">
                                    <li>✓ Más energía y vitalidad diaria</li>
                                    <li>✓ Mejor digestión y sueño</li>
                                    <li>✓ Relación saludable con la comida</li>
                                    <li>✓ Hábitos sostenibles a largo plazo</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PROCESO */}
                <section className="lp-section lp-section--white">
                    <div className="lp-container">
                        <div className="lp-section__header">
                            <h2 className="lp-section__title">Tu camino hacia el bienestar</h2>
                            <p className="lp-section__text">
                                Un proceso simple y efectivo en 3 pasos
                            </p>
                        </div>

                        <div className="lp-steps-grid">
                            <div className="lp-step">
                                <div className="lp-step__number">1</div>
                                <h3 className="lp-step__title">Agenda tu Cita</h3>
                                <p className="lp-step__text">
                                    Completa el formulario y coordinaremos el mejor horario para ti,
                                    presencial u online.
                                </p>
                            </div>

                            <div className="lp-step">
                                <div className="lp-step__number">2</div>
                                <h3 className="lp-step__title">Evaluación Completa</h3>
                                <p className="lp-step__text">
                                    Análisis detallado de tu historia clínica, hábitos, objetivos y
                                    estilo de vida.
                                </p>
                            </div>

                            <div className="lp-step">
                                <div className="lp-step__number">3</div>
                                <h3 className="lp-step__title">Plan Personalizado</h3>
                                <p className="lp-step__text">
                                    Recibe tu plan nutricional único con seguimiento continuo y
                                    ajustes mensuales.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIOS */}
                <section className="lp-section lp-section--testimonials">
                    <div className="lp-container">
                        <div className="lp-section__header">
                            <h2 className="lp-section__title">Historias de Éxito</h2>
                            <p className="lp-section__text">
                                Personas reales, resultados reales
                            </p>
                        </div>

                        <div className="lp-testimonials-grid">
                            {/* TESTIMONIO 1 */}
                            <article className="lp-testimonial-card">
                                <div className="lp-testimonial-card__quote">
                                    <svg className="quote-icon" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                </div>

                                <div className="lp-testimonial-card__content">
                                    <div className="lp-testimonial-card__stars">
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>

                                    <p className="lp-testimonial-card__text">
                                        Bajé 15 kg en 4 meses sin pasar hambre. El plan se adaptó perfectamente a mi vida laboral y ahora tengo muchísima más energía.
                                    </p>

                                    <div className="lp-testimonial-card__author">
                                        <div className="lp-testimonial-card__avatar">
                                            <span>MG</span>
                                        </div>
                                        <div className="lp-testimonial-card__info">
                                            <p className="author-name">María González</p>
                                            <p className="author-role">Ejecutiva, 34 años</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lp-testimonial-card__badge">
                                    <svg className="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Verificado</span>
                                </div>
                            </article>

                            {/* TESTIMONIO 2 */}
                            <article className="lp-testimonial-card">
                                <div className="lp-testimonial-card__quote">
                                    <svg className="quote-icon" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                </div>

                                <div className="lp-testimonial-card__content">
                                    <div className="lp-testimonial-card__stars">
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>

                                    <p className="lp-testimonial-card__text">
                                        Mis triglicéridos bajaron de 300 a 120 en solo 3 meses. Mi médico está impresionado con los resultados del plan nutricional.
                                    </p>

                                    <div className="lp-testimonial-card__author">
                                        <div className="lp-testimonial-card__avatar">
                                            <span>CR</span>
                                        </div>
                                        <div className="lp-testimonial-card__info">
                                            <p className="author-name">Carlos Ruiz</p>
                                            <p className="author-role">Ingeniero, 42 años</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lp-testimonial-card__badge">
                                    <svg className="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Verificado</span>
                                </div>
                            </article>

                            {/* TESTIMONIO 3 */}
                            <article className="lp-testimonial-card">
                                <div className="lp-testimonial-card__quote">
                                    <svg className="quote-icon" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                </div>

                                <div className="lp-testimonial-card__content">
                                    <div className="lp-testimonial-card__stars">
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>

                                    <p className="lp-testimonial-card__text">
                                        Aprendí a organizar las comidas de toda la familia. Mis hijos ahora comen mejor y sin peleas en la mesa. ¡Gracias totales!
                                    </p>

                                    <div className="lp-testimonial-card__author">
                                        <div className="lp-testimonial-card__avatar">
                                            <span>AM</span>
                                        </div>
                                        <div className="lp-testimonial-card__info">
                                            <p className="author-name">Ana Morales</p>
                                            <p className="author-role">Madre de 2, 38 años</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lp-testimonial-card__badge">
                                    <svg className="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Verificado</span>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* PLANES */}
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
                            {/* PLAN ESSENTIAL */}
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

                            {/* PLAN MÁS VENDIDO */}
                            <div className="lp-price-card lp-price-card--featured">
                                <div className="lp-badge-popular">MÁS VENDIDO</div>
                                <h3>Plan Transformación Total</h3>
                                <div className="lp-price">$119<small>/mes</small></div>
                                <ul className="lp-features">
                                    <li><strong>Consulta inicial</strong> + seguimientos semanales</li>
                                    <li>Análisis corporal con bioimpedancia</li>
                                    <li>Plan + <strong>recetario semanal</strong> + lista de compras</li>
                                    <li>Grupo VIP de WhatsApp + ajustes ilimitados</li>
                                    <li>Bonus: <strong> Plan de ejercicio en casa 8 semanas</strong></li>
                                </ul>
                                <button className="lp-btn lp-btn--primary" onClick={scrollToForm}>
                                    Quiero Este Plan
                                </button>
                            </div>

                            {/* PLAN ÉLITE */}
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


                {/* CTA FINAL */}
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

                {/* FOOTER */}
                <footer className="lp-footer">
                    <div className="lp-container">
                        <div className="lp-footer__grid">
                            <div className="lp-footer__col">
                                <div className="lp-footer__brand">
                                    <div className="lp-footer__logo">
                                        <span className="lp-footer__logo-icon">🍎</span>
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
                                    <li>📱 WhatsApp: +593 9xx xxx xxx</li>
                                    <li>✉️ info@nutrivida.com</li>
                                    <li>📍 Milagro, Guayas, Ecuador</li>
                                </ul>
                            </div>

                            <div className="lp-footer__col">
                                <h4 className="lp-footer__title">Horarios</h4>
                                <ul className="lp-footer__list">
                                    <li>Lunes a Viernes</li>
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
            </main>
        </div>
    );
}

export default LandingPage;