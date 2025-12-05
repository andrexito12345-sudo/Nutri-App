// frontend/src/api.js
import axios from "axios";


const api = axios.create({
    // Si tienes VITE_API_URL en .env se usa eso, si no, usa el localhost por defecto
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
    withCredentials: true, // para que mande cookies de sesión
});

export default api;
