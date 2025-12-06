import React from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Componentes y Hook refactorizados
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import DashboardKPIs from '../components/dashboard/DashboardKPIs';
import AppointmentsSection from '../components/dashboard/AppointmentsSection';
import PatientsSection from '../components/dashboard/PatientsSection';
import DashboardModals from '../components/dashboard/DashboardModals';
import ToolsSidebar from '../components/ToolsSidebar';

import "./DashboardPage.css";

function DashboardPage({ isToolsOpen, closeTools }) {
    // Extraemos TODA la lógica del Hook
    const logic = useDashboardLogic();

    if (logic.loading) {
        return (
            <div className="dash-loading">
                <div className="dash-spinner"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    if (logic.error) {
        return (
            <div className="dash-error">
                <svg className="dash-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{logic.error}</p>
            </div>
        );
    }

    return (
        <div className="dash">
            {/* Header */}
            <div className="dash-header">
                <div>
                    <h1 className="dash-title">Panel de Control</h1>
                    <p className="dash-subtitle">Sistema de Gestión Nutricional</p>
                </div>
                <div className="dash-date">
                    {new Date().toLocaleDateString('es-EC', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </div>
            </div>

            {/* Métricas y KPIs */}
            <DashboardKPIs
                metrics={logic.metrics}
                visitStats={logic.visitStats}
            />

            {/* Sección de Citas */}
            <AppointmentsSection
                appointments={logic.filteredAppointments}
                metrics={logic.metrics}
                filters={{
                    search: logic.search,
                    status: logic.statusFilter,
                    date: logic.dateFilter
                }}
                setSearch={logic.setSearch}
                setStatusFilter={logic.setStatusFilter}
                setDateFilter={logic.setDateFilter}
                formatDate={logic.formatDate}
                changeStatus={logic.changeStatus}
                navigate={logic.navigate}
                handleCreatePatientFromAppointment={logic.handleCreatePatientFromAppointment}
            />

            {/* Sección de Pacientes */}
            <PatientsSection
                patients={logic.patients}
                loading={logic.patientsLoading}
                search={logic.patientSearch}
                setSearch={logic.setPatientSearch}
                openPatientForm={logic.openPatientForm}
                formatDate={logic.formatDate}
                viewPatientRecord={logic.viewPatientRecord}
                printLatestConsultation={logic.printLatestConsultation}
                editPatient={logic.editPatient}
                deletePatient={logic.deletePatient}
            />

            {/* Menú Lateral de Herramientas */}
            <ToolsSidebar
                isOpen={isToolsOpen}
                onClose={closeTools}
                onOpenStats={() => logic.setShowStatsModal(true)}
                onOpenIMC={() => logic.setShowBMIModal(true)}
                onOpenFoods={() => alert("Tabla de Alimentos: En construcción")}
                onOpenDiet={() => logic.setShowDietModal(true)}
            />

            {/* Gestión de Todos los Modales */}
            <DashboardModals
                modals={logic.modals}
                modalData={logic.modalData}
                actions={{
                    closePatientModal: logic.closePatientModal,
                    setShowPatientForm: logic.setShowPatientForm,
                    setPendingAppointment: logic.setPendingAppointment,
                    handlePatientFormChange: logic.handlePatientFormChange,
                    savePatient: logic.savePatient,
                    setShowStatsModal: logic.setShowStatsModal,
                    setShowBMIModal: logic.setShowBMIModal,
                    setShowDietModal: logic.setShowDietModal
                }}
            />

            {/* Contenedor invisible para impresión (Requerido por react-to-print) */}
            <div style={{ display: 'none' }}>
                <div ref={logic.printRef}>
                    {/* El contenido se inyecta dinámicamente, mantenemos la ref aquí */}
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}

export default DashboardPage;