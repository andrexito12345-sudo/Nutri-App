// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './LoginPage.css';

function LoginPage() {
    const [form, setForm] = useState({
        email: 'nutri@example.com',
        password: 'ClaveSegura123',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', form);
            const data = res.data || {};
            const token = data.token;

            if (data.ok !== false) {
                if (token) localStorage.setItem('nutri_token', token);
                navigate('/doctora/dashboard');
            } else {
                setError(data.message || 'Credenciales incorrectas.');
            }
        } catch (err) {
            setError('No se pudo iniciar sesión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-grid">
                    {/* LADO IZQUIERDO: HERO */}
                    <div className="login-hero">
                        <div className="hero-content">
                            {/* BADGE CON CANDADO ANIMADO SVG */}
                            <div className="badge">
                                <svg className="lock-anim-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Panel Privado</span>
                            </div>

                            <div className="hero-title">
                                <span className="hero-title-small">Acceso para</span>
                                <span className="hero-title-main">la Doctora</span>
                            </div>

                            <p className="hero-text">
                                Gestiona citas, revisa el estado de pacientes y monitorea tu práctica desde un solo lugar.
                            </p>

                            <ul className="features-list">
                                <li>
                                    <div className="check-icon">
                                        {/* CHECK SVG */}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    Resumen rápido de citas
                                </li>
                                <li>
                                    <div className="check-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    Historial clínico seguro
                                </li>
                                <li>
                                    <div className="check-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    Estadísticas de visitas
                                </li>
                            </ul>
                        </div>

                        <div className="hero-footer">
                            <div className="avatar-circle">DN</div>
                            <div className="doctor-info">
                                <h4>Dra. Daniela Vaca</h4>
                                <p>Licenciada en Nutrición</p>
                            </div>
                        </div>
                    </div>

                    {/* LADO DERECHO: FORMULARIO */}
                    <div className="login-form-container">
                        <div className="form-wrapper">
                            <div className="form-header">
                                <h2>Bienvenida</h2>
                                <p>Ingresa tus credenciales para acceder.</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* EMAIL */}
                                <div className="input-group">
                                    <label>Correo electrónico</label>
                                    <div className="input-field-wrapper">
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="nutri@example.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="input-icon-left">
                                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* PASSWORD */}
                                <div className="input-group">
                                    <label>Contraseña</label>
                                    <div className="input-field-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="••••••••••••"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="input-icon-left">
                                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        </div>
                                        <button
                                            type="button"
                                            className="toggle-password-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 012.122-.383c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18"></path></svg>
                                            ) : (
                                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {error && <div className="login-error">⚠️ {error}</div>}

                                <button
                                    type="submit"
                                    className="btn-login"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="btn-content-loading">
                                            <span className="spinner"></span>
                                            <span>Ingresando...</span>
                                        </div>
                                    ) : 'Ingresar al Sistema'}
                                </button>
                            </form>

                            <div className="form-footer">
                                <p>
                                    ¿Olvidaste tu contraseña? <a href="#">Contacta al administrador</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;