import React from 'react';

const PatientsSection = ({
                             patients,
                             loading,
                             search,
                             setSearch,
                             openPatientForm,
                             formatDate,
                             viewPatientRecord,
                             printLatestConsultation,
                             editPatient,
                             deletePatient
                         }) => {
    return (
        <div className="dash-table-section" style={{ marginTop: '2rem' }}>
            <div className="table-head">
                <h2>Gestión de Pacientes</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="table-badge">{patients.length}</span>
                    <button onClick={openPatientForm} className="btn-new-patient">
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
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                    {loading ? (
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
                                <td><span className="table-badge">{patient.total_consultations || 0}</span></td>
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
                                        <button onClick={() => viewPatientRecord(patient)} className="action-btn action-btn--success" title="Ver expediente">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </button>
                                        <button onClick={() => printLatestConsultation(patient)} className="action-btn" style={{ backgroundColor: '#60a5fa', color: 'white' }} title="Imprimir Última Consulta">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                        </button>
                                        <button onClick={() => editPatient(patient)} className="action-btn action-btn--warning" title="Editar">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => deletePatient(patient.id, patient.full_name)} className="action-btn action-btn--danger" title="Eliminar Paciente">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

export default PatientsSection;