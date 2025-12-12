// frontend/src/api.js
// ============================================
// Cliente Axios configurado para JWT
// Maneja automáticamente el token en cada petición
// ============================================

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Crear instancia de Axios
const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================
// INTERCEPTOR DE REQUEST
// Agrega el token JWT a cada petición automáticamente
// ============================================
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================
// INTERCEPTOR DE RESPONSE
// Maneja errores de autenticación globalmente
// ============================================
api.interceptors.response.use(
    (response) => {
        // Respuesta exitosa, retornar normalmente
        return response;
    },
    (error) => {
        // Manejar errores de autenticación
        if (error.response) {
            const { status, data } = error.response;

            // Si el token expiró o es inválido
            if (status === 401) {
                console.warn('⚠️ Token inválido o expirado');

                // Limpiar token del localStorage
                localStorage.removeItem('authToken');
                localStorage.removeItem('doctor');

                // Si el token expiró, redirigir al login
                // (Solo si NO estamos ya en la página de login)
                if (data?.expired && !window.location.pathname.includes('/login')) {
                    console.log('🔄 Redirigiendo al login por token expirado...');
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

// ============================================
// FUNCIONES HELPER DE AUTENTICACIÓN
// ============================================

/**
 * Guarda el token y datos del doctor después del login
 */
export function saveAuthData(token, doctor) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('doctor', JSON.stringify(doctor));
}

/**
 * Elimina los datos de autenticación (logout)
 */
export function clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('doctor');
}

/**
 * Obtiene el token actual
 */
export function getToken() {
    return localStorage.getItem('authToken');
}

/**
 * Obtiene los datos del doctor guardados
 */
export function getDoctor() {
    const doctorStr = localStorage.getItem('doctor');
    if (!doctorStr) return null;

    try {
        return JSON.parse(doctorStr);
    } catch {
        return null;
    }
}

/**
 * Verifica si hay un usuario autenticado
 */
export function isAuthenticated() {
    const token = getToken();
    return !!token;
}

/**
 * Verifica el token con el backend
 */
export async function verifyAuth() {
    try {
        const response = await api.get('/auth/verify');
        return response.data.valid === true;
    } catch {
        return false;
    }
}

export default api;