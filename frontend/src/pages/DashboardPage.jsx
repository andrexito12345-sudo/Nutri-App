// frontend/src/pages/DashboardPage.jsx
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useMemo, useState, useRef } from "react";
import api from "../api";
import { printSoapReport } from "../utils/soapPrinter";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useReactToPrint } from 'react-to-print';
import ToolsSidebar from '../components/ToolsSidebar';
import StatsModal from '../components/StatsModal';
import PatientFileModal from '../components/PatientFileModal';
import NewPatientModal from '../components/NewPatientModal';
// 1. IMPORTAR LA NUEVA HERRAMIENTA IMC
import BMICalculatorTool from '../components/BMICalculatorTool';

import "./DashboardPage.css";

function DashboardPage({ isToolsOpen, closeTools }) {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [visitStats, setVisitStats] = useState({ total: 0, today: 0 });
    const [appointmentStats, setAppointmentStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("todas");
    const [dateFilter, setDateFilter] = useState("todos");

    // ESTADO PARA EL MENÚ LATERAL Y HERRAMIENTAS
    const [showStatsModal, setShowStatsModal] = useState(false);
    // 2. NUEVO ESTADO PARA MODAL IMC
    const [showBMIModal, setShowBMIModal] = useState(false);

    // --- LÓGICA DE IMPRESIÓN MAESTRA ---
    // 1. Estado para guardar temporalmente los datos que se van a imprimir
    const [printData, setPrintData] = useState(null);
    // 2. Referencia al componente oculto que sirve de plantilla
    const printRef = useRef();

    // 3. Configuración del hook de impresión
    const handlePrintProcess = useReactToPrint({
        content: () => printRef.current,
        documentTitle: printData ? `Consulta_${printData.patient.full_name}` : 'Documento_Clinico',
        onAfterPrint: () => setPrintData(null), // Limpia los datos al terminar para evitar bucles
        onPrintError: (error) => console.error("Error al imprimir:", error)
    });

    // 4. Efecto Mágico: Detecta cuando 'printData' tiene datos y lanza la impresora
    useEffect(() => {
        if (printData) {
            // Un pequeño timeout asegura que el documento oculto ya se "pintó" en el navegador
            setTimeout(() => {
                handlePrintProcess();
            }, 100);
        }
    }, [printData]);

    // Estados para Gestión de Pacientes
    const [patients, setPatients] = useState([]);
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [patientSearch, setPatientSearch] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [patientConsultations, setPatientConsultations] = useState([]);
    const [patientWeightHistory, setPatientWeightHistory] = useState([]);

    // Estados para crear/editar paciente
    const [isEditing, setIsEditing] = useState(false);
    const [showPatientForm, setShowPatientForm] = useState(false);
    const [patientFormData, setPatientFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        birth_date: "",
        gender: "",
        occupation: "",
        address: "",
        emergency_contact: "",
        emergency_phone: "",
        blood_type: "",
        allergies: "",
        notes: ""
    });
    const [savingPatient, setSavingPatient] = useState(false);

    // --- NUEVO ESTADO: Para recordar la cita mientras creamos al paciente ---
    const [pendingAppointment, setPendingAppointment] = useState(null);


    const formatDate = (isoString) => {
        if (!isoString) return "-";
        const d = new Date(isoString);
        if (isNaN(d)) return isoString;
        return d.toLocaleDateString("es-EC", {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pendiente":
                return "#f59e0b";
            case "realizada":
                return "#10b981";
            case "cancelada":
                return "#ef4444";
            default:
                return "#6b7280";
        }
    };

    // 1. FUNCIÓN DE CARGA (REUTILIZABLE)
    // La sacamos afuera para poder llamarla desde el intervalo
    const loadDashboardData = async (isBackgroundUpdate = false) => {
        try {
            // Solo mostramos el spinner de carga si NO es una actualización de fondo
            if (!isBackgroundUpdate) setLoading(true);

            setError("");

            const [appointmentsRes, visitsRes, statsRes] = await Promise.all([
                api.get("/api/appointments"),
                api.get("/api/visits/stats"),
                api.get("/api/appointments/stats"),
            ]);

            const appointmentsData = Array.isArray(appointmentsRes.data?.appointments)
                ? appointmentsRes.data.appointments
                : [];

            setAppointments(appointmentsData);

            const visitsData = visitsRes.data || {};
            setVisitStats({
                total: visitsData.total ?? 0,
                today: visitsData.today ?? 0,
            });

            setAppointmentStats(statsRes.data || null);
        } catch (err) {
            console.error("Error cargando dashboard:", err);
            if (!isBackgroundUpdate) setError("No se pudieron cargar los datos.");
        } finally {
            if (!isBackgroundUpdate) setLoading(false);
        }
    };

    // 2. EFECTO DE CARGA INICIAL (Solo una vez al entrar)
    useEffect(() => {
        loadDashboardData();
    }, []);

    // 3. EFECTO "RADAR" (Auto-actualiza cada 30 seg)
    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log("🔄 Radar: Buscando nuevas citas...");
            loadDashboardData(true); // 'true' para que sea silencioso (sin spinner)
        }, 30000);

        return () => clearInterval(intervalId); // Limpieza al salir
    }, []);

    // Función para cargar pacientes
    const fetchPatients = async (searchTerm = "") => {
        try {
            setPatientsLoading(true);
            const response = await api.get("/api/patients", { params: { search: searchTerm } });
            setPatients(response.data.patients || []);
        } catch (err) {
            console.error("Error cargando pacientes:", err);
        } finally {
            setPatientsLoading(false);
        }
    };

    // Cargar pacientes al montar
    useEffect(() => {
        fetchPatients();
    }, []);

    // Buscar pacientes con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPatients(patientSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    // Función para ver expediente de un paciente
    const viewPatientRecord = async (patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(true);

        try {
            // Cargar consultas del paciente
            const [consultationsRes, weightRes] = await Promise.all([
                api.get(`/api/consultations/patient/${patient.id}`),
                api.get(`/api/consultations/patient/${patient.id}/weight-history`)
            ]);

            setPatientConsultations(consultationsRes.data.consultations || []);
            setPatientWeightHistory(weightRes.data || []);
        } catch (err) {
            console.error("Error cargando expediente:", err);
        }
    };

    // Función para cerrar modal
    const closePatientModal = () => {
        setShowPatientModal(false);
        setSelectedPatient(null);
        setPatientConsultations([]);
        setPatientWeightHistory([]);
    };

    // Función para abrir formulario de nuevo paciente
    const openPatientForm = () => {
        setPatientFormData({
            full_name: "",
            email: "",
            phone: "",
            birth_date: "",
            gender: "",
            occupation: "",
            address: "",
            emergency_contact: "",
            emergency_phone: "",
            blood_type: "",
            allergies: "",
            notes: ""
        });
        setIsEditing(false);
        setShowPatientForm(true);
    };

    const editPatient = (patient) => {
        setPatientFormData({
            ...patient,
            birth_date: patient.birth_date ? patient.birth_date.split('T')[0] : '',
        });
        setIsEditing(true);
        setShowPatientForm(true);
    };

    // ==========================================
    //  FUNCIÓN: CREAR PACIENTE DESDE CITA (AUTOMÁTICO)
    // ==========================================
    const handleCreatePatientFromAppointment = (appointment) => {
        // 1. Preguntar confirmación
        if (window.confirm(`El paciente "${appointment.patient_name}" no tiene expediente.\n\n¿Deseas crearle una ficha nueva usando los datos de la cita?`)) {

            // Guardamos la cita en memoria
            setPendingAppointment(appointment);
            // 2. Pre-llenar el formulario con los datos de la cita
            setPatientFormData({
                full_name: appointment.patient_name || "",
                email: appointment.patient_email || "",
                phone: appointment.patient_phone || "",
                notes: `Motivo de consulta inicial: ${appointment.reason || "No especificado"}`,
                // Campos vacíos por defecto para que los llenes tú
                birth_date: "",
                gender: "",
                occupation: "",
                address: "",
                emergency_contact: "",
                emergency_phone: "",
                blood_type: "",
                allergies: ""
            });

            // 3. Configurar modo "Crear" y abrir el modal
            setIsEditing(false); // Aseguramos que no es edición, es creación
            setShowPatientForm(true); // Abrimos el formulario

            // Opcional: Marcar la cita como "Realizada" visualmente o esperar a que guardes
            // changeStatus(appointment.id, "realizada");
        }
    };


    // ==========================================
    //  FUNCIÓN GUARDAR PACIENTE (CORREGIDA)
    // ==========================================
    const savePatient = async (e) => {
        e.preventDefault();

        // 1. Validaciones básicas
        if (!patientFormData.full_name || !patientFormData.phone) {
            toast.error("El nombre y el teléfono son obligatorios");
            return;
        }

        try {
            setSavingPatient(true);
            let response; // <--- CLAVE: Declaramos la variable aquí afuera para que exista en todo el bloque

            if (isEditing) {
                // Editar
                response = await api.put(`/api/patients/${patientFormData.id}`, patientFormData);
                toast.success("Paciente actualizado correctamente");
            } else {
                // Crear
                response = await api.post("/api/patients", patientFormData);
                toast.success("Paciente creado exitosamente");
            }

            // 2. Lógica de Redirección Automática (Cita -> Paciente -> SOAP)
            if (pendingAppointment && !isEditing) {
                // Aseguramos leer el ID correctamente según cómo responde tu backend
                const newPatientId = response.data.patient ? response.data.patient.id : response.data.id;

                if (newPatientId) {
                    setShowPatientForm(false);
                    setPendingAppointment(null); // Limpiamos la memoria
                    // Nos vamos directo al SOAP
                    navigate(`/consulta/nueva/${pendingAppointment.id}/${newPatientId}`);
                    return; // Terminamos aquí para no recargar la tabla innecesariamente
                }
            }

            // 3. Si no es redirección, simplemente cerramos y recargamos la lista
            setShowPatientForm(false);
            fetchPatients(); // <--- Esto hace que aparezca en la lista si "no se veía"

            // Limpiar formulario
            setPatientFormData({
                full_name: "", email: "", phone: "", birth_date: "", gender: "",
                occupation: "", address: "", emergency_contact: "", emergency_phone: "",
                blood_type: "", allergies: "", notes: ""
            });

        } catch (err) {
            console.error("Error al guardar:", err);
            // Mostrar mensaje real del backend (ej: "El teléfono ya existe")
            const mensaje = err.response?.data?.error || "Ocurrió un error al guardar";
            toast.error(mensaje);
        } finally {
            setSavingPatient(false);
        }
    };

    // ==========================================
    //  FUNCIÓN ELIMINAR PACIENTE
    // ==========================================
    const deletePatient = async (id, name) => {
        // 1. Confirmación de seguridad
        if (!window.confirm(`⚠️ ¿Estás segura de que deseas eliminar a "${name}"?\n\nEsta acción borrará TODO su historial, consultas y citas. NO se puede deshacer.`)) {
            return;
        }

        try {
            // 2. Petición al backend
            await api.delete(`/api/patients/${id}`);

            // 3. Actualizar la tabla visualmente (filtrar el eliminado)
            setPatients(prev => prev.filter(p => p.id !== id));

            toast.success("Paciente eliminado correctamente");
        } catch (error) {
            console.error("Error eliminando:", error);
            toast.error("No se pudo eliminar el paciente. Intenta de nuevo.");
        }
    };

    // Manejar cambios en el formulario
    const handlePatientFormChange = (e) => {
        const { name, value } = e.target;
        setPatientFormData(prev => ({ ...prev, [name]: value }));
    };

    const filteredAppointments = useMemo(() => {
        const list = Array.isArray(appointments) ? appointments : [];
        let result = [...list];

        if (statusFilter !== "todas") {
            result = result.filter((a) => a.status === statusFilter);
        }

        if (dateFilter !== "todos") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter((a) => {
                const appointmentDate = new Date(a.appointment_datetime);

                switch (dateFilter) {
                    case "hoy":
                        return appointmentDate >= today && appointmentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
                    case "semana":
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return appointmentDate >= weekAgo;
                    case "mes":
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return appointmentDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((a) => {
                const name = (a.patient_name || "").toLowerCase();
                const email = (a.patient_email || "").toLowerCase();
                const phone = (a.patient_phone || "").toLowerCase();
                return (
                    name.includes(q) ||
                    email.includes(q) ||
                    phone.includes(q)
                );
            });
        }

        return result.sort((a, b) => b.id - a.id);
    }, [appointments, statusFilter, search, dateFilter]);

    const changeStatus = async (id, newStatus) => {
        try {
            await api.patch(`/appointments/${id}/status`, { status: newStatus });

            setAppointments((prev) =>
                prev.map((a) =>
                    a.id === id ? { ...a, status: newStatus } : a
                )
            );
        } catch (err) {
            console.error("Error actualizando estado:", err);
            alert("No se pudo actualizar el estado de la cita.");
        }
    };

    const metrics = useMemo(() => {
        const total = appointments.length;
        const pending = appointments.filter(a => a.status === "pendiente").length;
        const done = appointments.filter(a => a.status === "realizada").length;
        const cancelled = appointments.filter(a => a.status === "cancelada").length;

        const completionRate = total > 0 ? ((done / total) * 100).toFixed(1) : 0;
        const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0;

        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingAppointments = appointments.filter(a => {
            const date = new Date(a.appointment_datetime);
            return a.status === "pendiente" && date >= now && date <= sevenDaysLater;
        }).length;

        return {
            total,
            pending,
            done,
            cancelled,
            completionRate,
            cancellationRate,
            upcomingAppointments
        };
    }, [appointments]);

    if (loading) {
        return (
            <div className="dash-loading">
                <div className="dash-spinner"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dash-error">
                <svg className="dash-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{error}</p>
            </div>
        );
    }

    const todayStats = appointmentStats?.today || {
        total: 0,
        pending: 0,
        done: 0,
        cancelled: 0,
    };

    const last30Stats = appointmentStats?.last30 || {
        total: 0,
        pending: 0,
        done: 0,
        cancelled: 0,
    };

    const donutData = [
        { name: "Pendientes", value: metrics.pending, color: "#f59e0b" },
        { name: "Realizadas", value: metrics.done, color: "#10b981" },
        { name: "Canceladas", value: metrics.cancelled, color: "#ef4444" },
    ];

    const barData = [
        {
            periodo: "Hoy",
            Pendientes: todayStats.pending,
            Realizadas: todayStats.done,
            Canceladas: todayStats.cancelled,
        },
        {
            periodo: "30 días",
            Pendientes: last30Stats.pending,
            Realizadas: last30Stats.done,
            Canceladas: last30Stats.cancelled,
        },
    ];

    // =====================================================================
    //  FUNCIÓN DE IMPRESIÓN (Simplificada)
    // =====================================================================
    const printLatestConsultation = async (patient) => {
        try {
            // 1. Obtener datos
            const response = await api.get(`/api/consultations/patient/${patient.id}?limit=1`);
            const consultations = response.data.consultations;

            if (!consultations || consultations.length === 0) {
                alert(`El paciente ${patient.full_name} no tiene consultas.`);
                return;
            }

            // 2. Llamar a nuestro archivo externo para imprimir
            // Le pasamos la consulta y el paciente, y él se encarga de todo el diseño.
            printSoapReport(consultations[0], patient);

        } catch (error) {
            console.error(error);
            alert("Error al obtener datos para imprimir.");
        }
    };



    return (
        <div className="dash">
            {/* Header compacto */}
            <div className="dash-header">
                <div>
                    <h1 className="dash-title">Panel de Control</h1>
                    <p className="dash-subtitle">Sistema de Gestión Nutricional</p>
                </div>
                <div className="dash-date">
                    {new Date().toLocaleDateString('es-EC', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* KPIs principales */}
            <div className="dash-kpis">
                <div className="kpi-card kpi-card--primary">
                    <div className="kpi-header">
                        <span className="kpi-label">Total de Citas</span>
                        <svg className="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div className="kpi-value">{metrics.total}</div>
                    <div className="kpi-footer">Registro completo</div>
                </div>

                {/* KPI PENDIENTES CON ALERTA VISUAL */}
                <div className={`kpi-card ${metrics.pending > 0 ? 'kpi-alert-active' : 'kpi-card--warning'}`}>
                    <div className="kpi-header">
                        <span className="kpi-label">Pendientes</span>
                        <svg className="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="kpi-value">
                        {metrics.pending}
                        {metrics.pending > 0 && <span style={{fontSize:'1rem', marginLeft:'5px'}}>🔔</span>}
                    </div>
                    <div className="kpi-footer">
                        {metrics.pending > 0 ? "¡Atención requerida!" : "Todo al día"}
                    </div>
                </div>

                <div className="kpi-card kpi-card--success">
                    <div className="kpi-header">
                        <span className="kpi-label">Completadas</span>
                        <svg className="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="kpi-value">{metrics.done}</div>
                    <div className="kpi-footer">Tasa: {metrics.completionRate}%</div>
                </div>

                <div className="kpi-card kpi-card--danger">
                    <div className="kpi-header">
                        <span className="kpi-label">Canceladas</span>
                        <svg className="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="kpi-value">{metrics.cancelled}</div>
                    <div className="kpi-footer">Tasa: {metrics.cancellationRate}%</div>
                </div>
            </div>

            {/* Visitas */}
            <div className="dash-visits">
                <div className="visit-card">
                    <svg className="visit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <div className="visit-info">
                        <span className="visit-value">{visitStats.today}</span>
                        <span className="visit-label">Visitas hoy</span>
                    </div>
                </div>
                <div className="visit-card">
                    <svg className="visit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <div className="visit-info">
                        <span className="visit-value">{visitStats.total}</span>
                        <span className="visit-label">Visitas totales</span>
                    </div>
                </div>
            </div>

            {/* Tabla de citas */}
            <div className="dash-table-section">
                <div className="table-head">
                    <h2>
                        Gestión de Citas
                        {metrics.pending > 0 && (
                            <span className="notification-badge">{metrics.pending} NUEVAS</span>
                        )}
                    </h2>
                    <span className="table-badge">{filteredAppointments.length}</span>
                </div>

                <div className="table-filters">
                    <div className="search-wrapper">
                        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="todas">Todos</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="realizada">Completadas</option>
                        <option value="cancelada">Canceladas</option>
                    </select>

                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="todos">Todas las fechas</option>
                        <option value="hoy">Hoy</option>
                        <option value="semana">Esta semana</option>
                        <option value="mes">Este mes</option>
                    </select>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Contacto</th>
                            <th>Motivo</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-row">
                                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p>No hay registros</p>
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map((a) => (
                                <tr
                                    key={a.id}
                                    className={a.status === 'pendiente' ? 'row-pending' : ''}
                                >
                                    <td>
                                        <div className="patient-cell">
                                            <div className="patient-avatar">
                                                {a.patient_name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{a.patient_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <span>{a.patient_email || "—"}</span>
                                            <span className="phone">{a.patient_phone}</span>
                                        </div>
                                    </td>
                                    <td className="reason-cell">{a.reason || "—"}</td>
                                    <td>
                                        <div className="date-cell">
                                            <span>{formatDate(a.appointment_datetime)}</span>
                                            <span className="time">
                                                    {new Date(a.appointment_datetime).toLocaleTimeString('es-EC', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                        </div>
                                    </td>
                                    <td>
                                            <span className={`status-pill status-pill--${a.status}`}>
                                                {a.status}
                                            </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                onClick={() => changeStatus(a.id, "pendiente")}
                                                disabled={a.status === "pendiente"}
                                                className="action-btn action-btn--warning"
                                                title="Pendiente"
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>

                                            </button>
                                            {/* BOTÓN PROCESAR CITA (LÓGICA INTELIGENTE) */}
                                            <button
                                                onClick={() => {
                                                    // 1. Verificamos si el paciente ya existe en la base de datos
                                                    const finalPatientId = a.linked_patient_id || a.patient_id;

                                                    if (finalPatientId) {
                                                        // CASO A: SI EXISTE -> Vamos directo a la Consulta SOAP
                                                        navigate(`/consulta/nueva/${a.id}/${finalPatientId}`);
                                                    } else {
                                                        // CASO B: NO EXISTE -> Ofrecemos crearlo automáticamente
                                                        handleCreatePatientFromAppointment(a);
                                                    }
                                                }}
                                                className="action-btn action-btn--success"
                                                title={a.linked_patient_id ? "Realizar Consulta" : "Crear Paciente desde Cita"}
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => changeStatus(a.id, "cancelada")}
                                                disabled={a.status === "cancelada"}
                                                className="action-btn action-btn--danger"
                                                title="Cancelada"
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECCIÓN: GESTIÓN DE PACIENTES */}
            <div className="dash-table-section" style={{ marginTop: '2rem' }}>
                <div className="table-head">
                    <h2>Gestión de Pacientes</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="table-badge">{patients.length}</span>
                        <button
                            onClick={openPatientForm}
                            className="btn-new-patient"
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Paciente
                        </button>
                    </div>
                </div>

                <div className="table-filters">
                    <div className="search-wrapper">
                        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar paciente por nombre, teléfono o email..."
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Contacto</th>
                            <th>Última Consulta</th>
                            <th>Total Consultas</th>
                            <th>Peso Actual</th>
                            <th>IMC</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {patientsLoading ? (
                            <tr>
                                <td colSpan="7" className="empty-row">
                                    <div className="dash-spinner" style={{ margin: '0 auto' }}></div>
                                    <p>Cargando pacientes...</p>
                                </td>
                            </tr>
                        ) : patients.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-row">
                                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p>No hay pacientes registrados</p>
                                </td>
                            </tr>
                        ) : (
                            patients.map((patient) => (
                                <tr key={patient.id}>
                                    <td>
                                        <div className="patient-cell">
                                            <div className="patient-avatar">
                                                {patient.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{patient.full_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <span>{patient.email || "—"}</span>
                                            <span className="phone">{patient.phone}</span>
                                        </div>
                                    </td>
                                    <td>{patient.last_consultation ? formatDate(patient.last_consultation) : "Sin consultas"}</td>
                                    <td>
                                        <span className="table-badge">{patient.total_consultations || 0}</span>
                                    </td>
                                    <td>{patient.current_weight ? `${patient.current_weight} kg` : "—"}</td>
                                    <td>
                                            <span style={{
                                                color: patient.current_bmi
                                                    ? patient.current_bmi < 18.5 ? '#3b82f6'
                                                        : patient.current_bmi < 25 ? '#10b981'
                                                            : patient.current_bmi < 30 ? '#f59e0b'
                                                                : '#ef4444'
                                                    : '#6b7280'
                                            }}>
                                                {patient.current_bmi ? patient.current_bmi.toFixed(1) : "—"}
                                            </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                onClick={() => viewPatientRecord(patient)}
                                                className="action-btn action-btn--success"
                                                title="Ver expediente"
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>

                                            {/* --- NUEVO BOTÓN IMPRIMIR DIRECTO --- */}
                                            <button
                                                onClick={() => printLatestConsultation(patient)}
                                                className="action-btn"
                                                style={{backgroundColor: '#60a5fa', color: 'white'}} // Azulito
                                                title="Imprimir Última Consulta"
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => editPatient(patient)} className="action-btn action-btn--warning" title="Editar">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>

                                            {/* --- NUEVO BOTÓN ELIMINAR (ROJO) --- */}
                                            <button
                                                onClick={() => deletePatient(patient.id, patient.full_name)}
                                                className="action-btn action-btn--danger"
                                                title="Eliminar Paciente"
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL: EXPEDIENTE DEL PACIENTE (AHORA ES UN COMPONENTE LIMPIO) */}
            <PatientFileModal
                isOpen={showPatientModal}
                onClose={closePatientModal}
                patient={selectedPatient}
                consultations={patientConsultations}
                weightHistory={patientWeightHistory}
            />

            {/* MODAL: FORMULARIO NUEVO PACIENTE (REFACTORIZADO) */}
            <NewPatientModal
                isOpen={showPatientForm}
                onClose={() => {
                    setShowPatientForm(false);
                    setPendingAppointment(null); // Importante: Limpiamos la cita pendiente si cancela
                }}
                formData={patientFormData}
                onChange={handlePatientFormChange}
                onSubmit={savePatient}
                isSaving={savingPatient}
            />

            {/* COMPONENTE MENÚ LATERAL */}
            <ToolsSidebar
                isOpen={isToolsOpen}
                onClose={closeTools}
                // Funciones para abrir las herramientas
                onOpenStats={() => setShowStatsModal(true)}
                onOpenIMC={() => setShowBMIModal(true)}
                onOpenFoods={() => alert("Tabla de Alimentos: En construcción")}
            />

            {/* MODAL DE ESTADÍSTICAS (Se abre desde el menú) */}
            <StatsModal
                isOpen={showStatsModal}
                onClose={() => setShowStatsModal(false)}
                donutData={donutData}
                barData={barData}
            />

            {/* MODAL DE CALCULADORA IMC (NUEVO) */}
            <BMICalculatorTool
                isOpen={showBMIModal}
                onClose={() => setShowBMIModal(false)}
            />
            <ToastContainer />
        </div>
    );
}

export default DashboardPage;