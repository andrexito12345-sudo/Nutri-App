import React from 'react';

const AppointmentsSection = ({
                                 appointments,
                                 metrics,
                                 filters,
                                 setSearch,
                                 setStatusFilter,
                                 setDateFilter,
                                 formatDate,
                                 changeStatus,
                                 navigate,
                                 handleCreatePatientFromAppointment
                             }) => {
    return (
        <div className="dash-table-section">
            <div className="table-head">
                <h2>
                    Gestión de Citas
                    {metrics.pending > 0 && (
                        <span className="notification-badge">{metrics.pending} NUEVAS</span>
                    )}
                </h2>
                <span className="table-badge">{appointments.length}</span>
            </div>

            <div className="table-filters">
                <div className="search-wrapper">
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar paciente..."
                        value={filters.search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>

                <select
                    value={filters.status}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="todas">Todos</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="realizada">Completadas</option>
                    <option value="cancelada">Canceladas</option>
                </select>

                <select
                    value={filters.date}
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
                    {appointments.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="empty-row">
                                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p>No hay registros</p>
                            </td>
                        </tr>
                    ) : (
                        appointments.map((a) => (
                            <tr key={a.id} className={a.status === 'pendiente' ? 'row-pending' : ''}>
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
                                                    hour: '2-digit', minute: '2-digit'
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
                                        <button
                                            onClick={() => {
                                                const finalPatientId = a.linked_patient_id || a.patient_id;
                                                if (finalPatientId) {
                                                    navigate(`/consulta/nueva/${a.id}/${finalPatientId}`);
                                                } else {
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
    );
};

export default AppointmentsSection;