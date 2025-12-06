import React from 'react';

const DashboardKPIs = ({ metrics, visitStats }) => {
    return (
        <>
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
        </>
    );
};

export default DashboardKPIs;