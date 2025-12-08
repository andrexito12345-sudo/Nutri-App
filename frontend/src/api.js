// frontend/src/api.js
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:4000"; // fallback local

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true, // si usas sesiones/cookies
});

export default api;
