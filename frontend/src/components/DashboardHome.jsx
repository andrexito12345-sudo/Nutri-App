import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardHome = ({
                           // DATOS
                           metrics,
                           visitStats,
                           filteredAppointments,
                           patients,
                           patientsLoading,

                           // FILTROS CITAS
                           search, setSearch,
                           statusFilter, setStatusFilter,
                           dateFilter, setDateFilter,

                           // FILTROS PACIENTES
                           patientSearch, setPatientSearch,

                           // FUNCIONES (Acciones)
                           formatDate,
                           changeStatus,
                           handleCreatePatientFromAppointment,
                           openPatientForm,
                           viewPatientRecord,
                           printLatestConsultation,
                           editPatient,
                           deletePatient
                       }) => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-content-wrapper">

            {/* 1. HEADER */}
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

            {/* 2. KPIs PRINCIPALES */}
            <div className="dash-kpis">
                <div className="kpi-card kpi-card--primary">
                    <div className="kpi-header">
                        <span className="kpi-label">Total de Citas</span>
                        <svg className="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <div className="kpi-value">{metrics.total}</div>
                    <div className="kpi-footer">Registro completo</div>
                </div>

                <div className={`kpi-card ${metrics.pending > 0 ? 'kpi-alert-active' : 'kpi-card--warning'}`}>
                    <div className="kpi-header">
                        <span className="kpi-label">Pendientes</span>
                        <svg className="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="kpi-value">
                        {metrics.pending} {metrics.pending > 0 && <span style={{fontSize:'1rem', marginLeft:'5px'}}>🔔</span>}
                    </div>
                    <div className="kpi-footer">{metrics.pending > 0 ? "¡Atención requerida!" : "Todo al día"}</div>
                </div>

                <div className="kpi-card kpi-card--success">
                    <div className="kpi-header">
                        <span className="kpi-label">Completadas</span>
                        <svg className="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="kpi-value">{metrics.done}</div>
                    <div className="kpi-footer">Tasa: {metrics.completionRate}%</div>
                </div>

                <div className="kpi-card kpi-card--danger">
                    <div className="kpi-header">
                        <span className="kpi-label">Canceladas</span>
                        <svg className="kpi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="kpi-value">{metrics.cancelled}</div>
                    <div className="kpi-footer">Tasa: {metrics.cancellationRate}%</div>
                </div>
            </div>

            {/* 3. VISITAS */}
            <div className="dash-visits">
                <div className="visit-card">
                    <div className="visit-info">
                        <span className="visit-value">{visitStats.today}</span>
                        <span className="visit-label">Visitas hoy</span>
                    </div>
                </div>
                <div className="visit-card">
                    <div className="visit-info">
                        <span className="visit-value">{visitStats.total}</span>
                        <span className="visit-label">Visitas totales</span>
                    </div>
                </div>
            </div>

            {/* 4. TABLA DE CITAS */}
            <div className="dash-table-section">
                <div className="table-head">
                    <h2>Gestión de Citas {metrics.pending > 0 && <span className="notification-badge">{metrics.pending} NUEVAS</span>}</h2>
                    <span className="table-badge">{filteredAppointments.length}</span>
                </div>

                <div className="table-filters">
                    <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                        <option value="todas">Todos</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="realizada">Completadas</option>
                        <option value="cancelada">Canceladas</option>
                    </select>
                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select">
                        <option value="todos">Todas las fechas</option>
                        <option value="hoy">Hoy</option>
                        <option value="semana">Semana</option>
                        <option value="mes">Mes</option>
                    </select>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                        <tr><th>Paciente</th><th>Contacto</th><th>Motivo</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                        {filteredAppointments.length === 0 ? (
                            <tr><td colSpan="6" className="empty-row"><p>No hay registros</p></td></tr>
                        ) : (
                            filteredAppointments.map((a) => (
                                <tr key={a.id} className={a.status === 'pendiente' ? 'row-pending' : ''}>
                                    <td>{a.patient_name}</td>
                                    <td>{a.patient_phone}</td>
                                    <td>{a.reason || "—"}</td>
                                    <td>
                                        {formatDate(a.appointment_datetime)} <br/>
                                        <small>{new Date(a.appointment_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                    </td>
                                    <td><span className={`status-pill status-pill--${a.status}`}>{a.status}</span></td>
                                    <td>
                                        <div className="action-btns">
                                            <button onClick={() => changeStatus(a.id, "pendiente")} disabled={a.status==="pendiente"} className="action-btn action-btn--warning" title="Pendiente">⏳</button>

                                            <button onClick={() => {
                                                const pid = a.linked_patient_id || a.patient_id;
                                                if (pid) navigate(`/consulta/nueva/${a.id}/${pid}`);
                                                else handleCreatePatientFromAppointment(a);
                                            }} className="action-btn action-btn--success" title="Procesar">✅</button>

                                            <button onClick={() => changeStatus(a.id, "cancelada")} disabled={a.status==="cancelada"} className="action-btn action-btn--danger" title="Cancelar">🚫</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 5. TABLA DE PACIENTES */}
            <div className="dash-table-section" style={{ marginTop: '2rem' }}>
                <div className="table-head">
                    <h2>Gestión de Pacientes</h2>
                    <div style={{display:'flex', gap:'10px'}}>
                        <span className="table-badge">{patients.length}</span>
                        <button onClick={openPatientForm} className="btn-new-patient">+ Nuevo</button>
                    </div>
                </div>

                <div className="table-filters">
                    <input type="text" placeholder="Buscar paciente..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} className="search-input" />
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                        <tr><th>Paciente</th><th>Contacto</th><th>Última Consulta</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                        {patientsLoading ? (
                            <tr><td colSpan="4">Cargando...</td></tr>
                        ) : patients.map((p) => (
                            <tr key={p.id}>
                                <td>{p.full_name}</td>
                                <td>{p.phone}</td>
                                <td>{p.last_consultation ? formatDate(p.last_consultation) : "—"}</td>
                                <td>
                                    <div className="action-btns">
                                        <button onClick={() => viewPatientRecord(p)} className="action-btn action-btn--success" title="Expediente">📂</button>
                                        <button onClick={() => printLatestConsultation(p)} className="action-btn" style={{backgroundColor:'#60a5fa', color:'white'}} title="Imprimir">🖨️</button>
                                        <button onClick={() => editPatient(p)} className="action-btn action-btn--warning" title="Editar">✏️</button>
                                        <button onClick={() => deletePatient(p.id, p.full_name)} className="action-btn action-btn--danger" title="Eliminar">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;