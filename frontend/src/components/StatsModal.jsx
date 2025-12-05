import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const StatsModal = ({ isOpen, onClose, donutData, barData }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-patient-info">
                        {/* Icono profesional en lugar de emoji */}
                        <div className="patient-avatar patient-avatar--large" style={{background: '#f3e8ff', color: '#4B0082', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                            </svg>
                        </div>
                        <div>
                            <h2>Estadísticas del Consultorio</h2>
                            <p>Resumen visual de actividad y pacientes</p>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}>✖️</button>
                </div>

                <div className="modal-body" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>

                    {/* Gráfico 1 */}
                    <div className="chart-box" style={{border:'1px solid #eee', padding:'15px', borderRadius:'12px'}}>
                        <h3 style={{fontSize:'1rem', marginBottom:'15px', color:'#444'}}>Distribución de Estados</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                >
                                    {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico 2 */}
                    <div className="chart-box" style={{border:'1px solid #eee', padding:'15px', borderRadius:'12px'}}>
                        <h3 style={{fontSize:'1rem', marginBottom:'15px', color:'#444'}}>Comparativa Mensual</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="periodo" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="Pendientes" fill="#f59e0b" />
                                <Bar dataKey="Realizadas" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StatsModal;