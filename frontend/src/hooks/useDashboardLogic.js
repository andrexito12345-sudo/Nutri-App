import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import api from "../api";
import { printSoapReport } from "../utils/soapPrinter";

export function useDashboardLogic() {
    const navigate = useNavigate();


    const [showHerramientasAvanzadas, setShowHerramientasAvanzadas] = useState(false);

// Debug: Sobreescribimos el setter para ver cuándo se llama
    const debugSetter = (value) => {
        console.log("useDashboardLogic: setShowHerramientasAvanzadas llamado con:", value);
        console.log("Estado anterior:", showHerramientasAvanzadas);
        setShowHerramientasAvanzadas(value);
        console.log("Estado nuevo (después del set):", value);
    };

// Usamos el setter con debug
// (más abajo en el return, cambia setShowHerramientasAvanzadas por debugSetter si quieres)

    // --- ESTADOS DE DATOS ---
    const [appointments, setAppointments] = useState([]);
    const [visitStats, setVisitStats] = useState({ total: 0, today: 0 });
    const [appointmentStats, setAppointmentStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // --- ESTADOS DE FILTROS ---
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("todas");
    const [dateFilter, setDateFilter] = useState("todos");

    // --- ESTADOS DE PACIENTES ---
    const [patients, setPatients] = useState([]);
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [patientSearch, setPatientSearch] = useState("");

    // --- ESTADOS DE MODALES Y EDICIÓN ---
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [patientConsultations, setPatientConsultations] = useState([]);
    const [patientWeightHistory, setPatientWeightHistory] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [showPatientForm, setShowPatientForm] = useState(false);
    const [patientFormData, setPatientFormData] = useState({
        full_name: "", email: "", phone: "", birth_date: "", gender: "",
        occupation: "", address: "", emergency_contact: "", emergency_phone: "",
        blood_type: "", allergies: "", notes: ""
    });
    const [savingPatient, setSavingPatient] = useState(false);
    const [pendingAppointment, setPendingAppointment] = useState(null);

    // --- ESTADOS DE HERRAMIENTAS (MODALES EXTRA) ---
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showBMIModal, setShowBMIModal] = useState(false);
    const [showDietModal, setShowDietModal] = useState(false);

    // --- LÓGICA DE IMPRESIÓN ---
    const [printData, setPrintData] = useState(null);
    const printRef = useRef();

    const handlePrintProcess = useReactToPrint({
        content: () => printRef.current,
        documentTitle: printData ? `Consulta_${printData.patient.full_name}` : 'Documento_Clinico',
        onAfterPrint: () => setPrintData(null),
        onPrintError: (error) => console.error("Error al imprimir:", error)
    });

    useEffect(() => {
        if (printData) {
            setTimeout(() => {
                handlePrintProcess();
            }, 100);
        }
    }, [printData, handlePrintProcess]);

    // --- FUNCIONES AUXILIARES ---
    const formatDate = (isoString) => {
        if (!isoString) return "-";
        const d = new Date(isoString);
        if (isNaN(d)) return isoString;
        return d.toLocaleDateString("es-EC", {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // --- CARGA DE DATOS (DASHBOARD) ---
    const loadDashboardData = async (isBackgroundUpdate = false) => {
        try {
            if (!isBackgroundUpdate) setLoading(true);
            setError("");

            const [appointmentsRes, visitsRes, statsRes] = await Promise.all([
                api.get("/appointments"),
                api.get("/visits/stats"),
                api.get("/appointments/stats"),
            ]);

            setAppointments(Array.isArray(appointmentsRes.data?.appointments) ? appointmentsRes.data.appointments : []);

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

    // Efectos de Carga
    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log("🔄 Radar: Buscando nuevas citas...");
            loadDashboardData(true);
        }, 30000);
        return () => clearInterval(intervalId);
    }, []);

    // --- CARGA DE DATOS (PACIENTES) ---
    const fetchPatients = async (searchTerm = "") => {
        try {
            setPatientsLoading(true);
            const response = await api.get("/patients", { params: { search: searchTerm } });
            setPatients(response.data.patients || []);
        } catch (err) {
            console.error("Error cargando pacientes:", err);
        } finally {
            setPatientsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPatients(patientSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    // --- LÓGICA DE CITAS (FILTROS Y ACCIONES) ---
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
                    case "hoy": return appointmentDate >= today && appointmentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
                    case "semana":
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return appointmentDate >= weekAgo;
                    case "mes":
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return appointmentDate >= monthAgo;
                    default: return true;
                }
            });
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((a) => {
                const name = (a.patient_name || "").toLowerCase();
                const email = (a.patient_email || "").toLowerCase();
                const phone = (a.patient_phone || "").toLowerCase();
                return (name.includes(q) || email.includes(q) || phone.includes(q));
            });
        }

        return result.sort((a, b) => b.id - a.id);
    }, [appointments, statusFilter, search, dateFilter]);

    const changeStatus = async (id, newStatus) => {
        try {
            await api.patch(`/appointments/${id}/status`, { status: newStatus });
            setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
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

        return { total, pending, done, cancelled, completionRate, cancellationRate, upcomingAppointments };
    }, [appointments]);

    // --- ACCIONES DE PACIENTES ---
    const viewPatientRecord = async (patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(true);
        try {
            const [consultationsRes, weightRes] = await Promise.all([
                api.get(`/consultations/patient/${patient.id}`),
                api.get(`/consultations/patient/${patient.id}/weight-history`)
            ]);
            setPatientConsultations(consultationsRes.data.consultations || []);
            setPatientWeightHistory(weightRes.data || []);
        } catch (err) {
            console.error("Error cargando expediente:", err);
        }
    };

    const closePatientModal = () => {
        setShowPatientModal(false);
        setSelectedPatient(null);
        setPatientConsultations([]);
        setPatientWeightHistory([]);
    };

    const openPatientForm = () => {
        setPatientFormData({
            full_name: "", email: "", phone: "", birth_date: "", gender: "",
            occupation: "", address: "", emergency_contact: "", emergency_phone: "",
            blood_type: "", allergies: "", notes: ""
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

    const handleCreatePatientFromAppointment = (appointment) => {
        if (window.confirm(`El paciente "${appointment.patient_name}" no tiene expediente.\n\n¿Deseas crearle una ficha nueva usando los datos de la cita?`)) {
            setPendingAppointment(appointment);
            setPatientFormData({
                full_name: appointment.patient_name || "",
                email: appointment.patient_email || "",
                phone: appointment.patient_phone || "",
                notes: `Motivo de consulta inicial: ${appointment.reason || "No especificado"}`,
                birth_date: "", gender: "", occupation: "", address: "",
                emergency_contact: "", emergency_phone: "", blood_type: "", allergies: ""
            });
            setIsEditing(false);
            setShowPatientForm(true);
        }
    };

    const savePatient = async (e) => {
        e.preventDefault();
        if (!patientFormData.full_name || !patientFormData.phone) {
            toast.error("El nombre y el teléfono son obligatorios");
            return;
        }

        try {
            setSavingPatient(true);
            let response;
            if (isEditing) {
                response = await api.put(`/patients/${patientFormData.id}`, patientFormData);
                toast.success("Paciente actualizado correctamente");
            } else {
                response = await api.post("/patients", patientFormData);
                toast.success("Paciente creado exitosamente");
            }

            if (pendingAppointment && !isEditing) {
                const newPatientId = response.data.patient ? response.data.patient.id : response.data.id;
                if (newPatientId) {
                    setShowPatientForm(false);
                    setPendingAppointment(null);
                    navigate(`/consulta/nueva/${pendingAppointment.id}/${newPatientId}`);
                    return;
                }
            }

            setShowPatientForm(false);
            fetchPatients();
            setPatientFormData({
                full_name: "", email: "", phone: "", birth_date: "", gender: "",
                occupation: "", address: "", emergency_contact: "", emergency_phone: "",
                blood_type: "", allergies: "", notes: ""
            });

        } catch (err) {
            console.error("Error al guardar:", err);
            const mensaje = err.response?.data?.error || "Ocurrió un error al guardar";
            toast.error(mensaje);
        } finally {
            setSavingPatient(false);
        }
    };

    const deletePatient = async (id, name) => {
        if (!window.confirm(`⚠️ ¿Estás segura de que deseas eliminar a "${name}"?\n\nEsta acción borrará TODO su historial, consultas y citas. NO se puede deshacer.`)) {
            return;
        }
        try {
            await api.delete(`/patients/${id}`);
            setPatients(prev => prev.filter(p => p.id !== id));
            toast.success("Paciente eliminado correctamente");
        } catch (error) {
            console.error("Error eliminando:", error);
            toast.error("No se pudo eliminar el paciente. Intenta de nuevo.");
        }
    };

    const printLatestConsultation = async (patient) => {
        try {
            const response = await api.get(`/consultations/patient/${patient.id}?limit=1`);
            const consultations = response.data.consultations;
            if (!consultations || consultations.length === 0) {
                alert(`El paciente ${patient.full_name} no tiene consultas.`);
                return;
            }
            printSoapReport(consultations[0], patient);
        } catch (error) {
            console.error(error);
            alert("Error al obtener datos para imprimir.");
        }
    };

    // --- DATOS PARA GRÁFICOS ---
    const todayStats = appointmentStats?.today || { total: 0, pending: 0, done: 0, cancelled: 0 };
    const last30Stats = appointmentStats?.last30 || { total: 0, pending: 0, done: 0, cancelled: 0 };

    const donutData = [
        { name: "Pendientes", value: metrics.pending, color: "#f59e0b" },
        { name: "Realizadas", value: metrics.done, color: "#10b981" },
        { name: "Canceladas", value: metrics.cancelled, color: "#ef4444" },
    ];

    const barData = [
        { periodo: "Hoy", Pendientes: todayStats.pending, Realizadas: todayStats.done, Canceladas: todayStats.cancelled },
        { periodo: "30 días", Pendientes: last30Stats.pending, Realizadas: last30Stats.done, Canceladas: last30Stats.cancelled },
    ];

    return {
        // Datos y Estados
        loading, error, metrics, visitStats,
        filteredAppointments, patients, patientsLoading,

        // Filtros
        search, setSearch,
        statusFilter, setStatusFilter,
        dateFilter, setDateFilter,
        patientSearch, setPatientSearch,

        // Estado Modales
        modals: {
            stats: showStatsModal,
            bmi: showBMIModal,
            diet: showDietModal,
            patientFile: showPatientModal,
            newPatient: showPatientForm,
            herramientasAvanzadas: showHerramientasAvanzadas,  // AÑADIDO
            isEditing
        },

        // Datos para Modales
        modalData: {
            donutData, barData,
            selectedPatient, patientConsultations, patientWeightHistory,
            patientFormData, savingPatient
        },

        // Setters de Modales
        setShowStatsModal,
        setShowBMIModal,
        setShowDietModal,
        setShowPatientForm,
        setPendingAppointment,
        setShowHerramientasAvanzadas: debugSetter,

        // Handlers / Acciones
        handlePatientFormChange: (e) => setPatientFormData(prev => ({ ...prev, [e.target.name]: e.target.value })),
        savePatient, deletePatient, editPatient,
        viewPatientRecord, closePatientModal, openPatientForm,
        changeStatus, handleCreatePatientFromAppointment,
        printLatestConsultation,
        formatDate, navigate,

        // Refs
        printRef,

        // NUEVO: Para las herramientas avanzadas
        showHerramientasAvanzadas
    };
}