import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Header from "./components/Header";
import SoapConsultation from './pages/SoapConsultation';
import { useState } from 'react';

// 1. IMPORTAR TOASTIFY Y SU CSS
import 'react-toastify/dist/ReactToastify.css';

function App() {
    // 2. CREAR EL ESTADO DEL MENÚ LATERAL
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    return (
        <div className="app">
            {/* 2. CONFIGURACIÓN GLOBAL DE ALERTAS */}
            {/* 3. PASAR LA FUNCIÓN PARA ABRIR AL HEADER */}
            <Header onOpenTools={() => setIsToolsOpen(true)} />

            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/doctora/login" element={<LoginPage />} />
                <Route
                    path="/doctora/dashboard"
                    element={
                        <DashboardPage
                            isToolsOpen={isToolsOpen}
                            closeTools={() => setIsToolsOpen(false)}
                        />
                    }
                />

                {/* --- RUTAS DE CONSULTA SOAP (Deben ir ANTES del comodín *) --- */}

                {/* Caso 1: Consulta desde Cita Agendada (con appointmentId) */}
                <Route path="/consulta/nueva/:appointmentId/:patientId" element={<SoapConsultation />} />

                {/* Caso 2: Consulta Directa (solo con patientId) <- ESTA ES LA QUE NECESITABAS ARREGLAR */}
                <Route path="/consulta/nueva/:patientId" element={<SoapConsultation />} />

                {/* Caso 3: Editar Consulta existente */}
                <Route path="/consulta/editar/:consultationId" element={<SoapConsultation />} />


                {/* --- COMODÍN (SIEMPRE AL FINAL) --- */}
                {/* Cualquier ruta desconocida redirige a la landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;