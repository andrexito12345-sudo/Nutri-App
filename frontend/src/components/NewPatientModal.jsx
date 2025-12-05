import React from 'react';
import './NewPatientModal.css';

const NewPatientModal = ({
                             isOpen,
                             onClose,
                             formData,
                             onChange,
                             onSubmit,
                             isSaving
                         }) => {

    if (!isOpen) return null;

    return (
        <div className="npm-overlay" onClick={onClose}>
            <div className="npm-content" onClick={(e) => e.stopPropagation()}>

                {/* --- HEADER --- */}
                <div className="npm-header">
                    <div className="npm-header-info">
                        <div className="npm-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                        </div>
                        <div className="npm-header-text">
                            <h2>Nuevo Paciente</h2>
                            <p>Complete los datos para el expediente</p>
                        </div>
                    </div>
                    <button className="npm-close" onClick={onClose} type="button" aria-label="Cerrar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* --- BODY --- */}
                <div className="npm-body">
                    <form onSubmit={onSubmit}>

                        {/* 1. Información Básica */}
                        <div className="npm-section">
                            <h3>
                                <span className="npm-section-icon npm-section-icon--blue">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                Información Básica
                            </h3>
                            <div className="npm-grid">
                                <div className="npm-field">
                                    <label>Nombre Completo <span className="npm-required">*</span></label>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={onChange} placeholder="Ej: María García López" required />
                                </div>
                                <div className="npm-field">
                                    <label>Teléfono <span className="npm-required">*</span></label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={onChange} placeholder="Ej: 0991234567" required />
                                </div>
                                <div className="npm-field">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={onChange} placeholder="Ej: paciente@email.com" />
                                </div>
                                <div className="npm-field">
                                    <label>Fecha de Nacimiento</label>
                                    <input type="date" name="birth_date" value={formData.birth_date} onChange={onChange} />
                                </div>
                                <div className="npm-field">
                                    <label>Género</label>
                                    <select name="gender" value={formData.gender} onChange={onChange}>
                                        <option value="">Seleccionar...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="npm-field">
                                    <label>Ocupación</label>
                                    <input type="text" name="occupation" value={formData.occupation} onChange={onChange} placeholder="Ej: Ingeniero" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Información Médica */}
                        <div className="npm-section">
                            <h3>
                                <span className="npm-section-icon npm-section-icon--red">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                    </svg>
                                </span>
                                Información Médica
                            </h3>
                            <div className="npm-grid">
                                <div className="npm-field">
                                    <label>Tipo de Sangre</label>
                                    <select name="blood_type" value={formData.blood_type} onChange={onChange}>
                                        <option value="">Seleccionar...</option>
                                        <option value="A+">A+</option><option value="A-">A-</option>
                                        <option value="B+">B+</option><option value="B-">B-</option>
                                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                        <option value="O+">O+</option><option value="O-">O-</option>
                                    </select>
                                </div>
                                <div className="npm-field npm-field--full">
                                    <label>Alergias</label>
                                    <textarea name="allergies" value={formData.allergies} onChange={onChange} placeholder="Ej: Penicilina, mariscos..." rows="2" />
                                </div>
                            </div>
                        </div>

                        {/* 3. Contacto de Emergencia */}
                        <div className="npm-section">
                            <h3>
                                <span className="npm-section-icon npm-section-icon--amber">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </span>
                                Contacto de Emergencia
                            </h3>
                            <div className="npm-grid">
                                <div className="npm-field">
                                    <label>Nombre del Contacto</label>
                                    <input type="text" name="emergency_contact" value={formData.emergency_contact} onChange={onChange} placeholder="Ej: Juan García (Esposo)" />
                                </div>
                                <div className="npm-field">
                                    <label>Teléfono de Emergencia</label>
                                    <input type="tel" name="emergency_phone" value={formData.emergency_phone} onChange={onChange} placeholder="Ej: 0987654321" />
                                </div>
                                <div className="npm-field npm-field--full">
                                    <label>Dirección Domiciliaria</label>
                                    <input type="text" name="address" value={formData.address} onChange={onChange} placeholder="Ej: Av. Principal 123, Ciudad" />
                                </div>
                            </div>
                        </div>

                        {/* 4. Notas */}
                        <div className="npm-section">
                            <h3>
                                <span className="npm-section-icon npm-section-icon--gray">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                </span>
                                Notas Adicionales
                            </h3>
                            <div className="npm-field npm-field--full">
                                <textarea name="notes" value={formData.notes} onChange={onChange} placeholder="Observaciones generales sobre el paciente..." rows="3" />
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="npm-actions">
                            <button type="button" className="npm-btn-cancel" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="npm-btn-save" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <span className="npm-spinner"></span>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                        Guardar Paciente
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewPatientModal;