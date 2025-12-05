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
            const res = await api.post('/api/auth/login', form);
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
                            <div className="badge">
                                <span>🔒</span> Panel Privado
                            </div>

                            <h1 className="hero-title">
                                <span className="hero-title-small">Acceso para</span>
                                <span className="hero-title-main">la Doctora</span>
                            </h1>

                            <p className="hero-text">
                                Gestiona tus citas, revisa el estado de pacientes y monitorea tu práctica desde un solo lugar.
                            </p>

                            <ul className="features-list">
                                <li>
                                    <div className="check-icon">✓</div>
                                    Resumen rápido de citas
                                </li>
                                <li>
                                    <div className="check-icon">✓</div>
                                    Historial clínico seguro
                                </li>
                                <li>
                                    <div className="check-icon">✓</div>
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
                                <h2>Iniciar sesión</h2>
                                <p>
                                    Usa tus credenciales asignadas para acceder al dashboard de NutriVida Pro.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
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
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Contraseña</label>
                                    <div className="input-field-wrapper">
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="••••••••••••"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <span className="input-icon">🔒</span>
                                    </div>
                                </div>

                                {error && <p className="login-error">{error}</p>}

                                <button
                                    type="submit"
                                    className="btn-login"
                                    disabled={loading}
                                >
                                    {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
                                </button>
                            </form>

                            <div className="form-footer">
                                <p>
                                    ¿Olvidaste tu contraseña?{' '}
                                    <a href="#">Contacta al administrador</a>
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
