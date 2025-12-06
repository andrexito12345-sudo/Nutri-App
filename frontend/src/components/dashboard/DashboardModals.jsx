import React from 'react';
import PatientFileModal from '../PatientFileModal';
import NewPatientModal from '../NewPatientModal';
import StatsModal from '../StatsModal';
import BMICalculatorTool from '../BMICalculatorTool';
import DietGenerator from '../DietGenerator';
import HerramientasAvanzadas from '../nutricion/HerramientasAvanzadas';

const DashboardModals = ({
                             modals,
                             modalData,
                             actions
                         }) => {
    return (
        <>

            {/* EXPEDIENTE */}
            <PatientFileModal
                isOpen={modals.patientFile}
                onClose={actions.closePatientModal}
                patient={modalData.selectedPatient}
                consultations={modalData.patientConsultations}
                weightHistory={modalData.patientWeightHistory}
            />

            {/* NUEVO/EDITAR PACIENTE */}
            <NewPatientModal
                isOpen={modals.newPatient}
                onClose={() => {
                    actions.setShowPatientForm(false);
                    actions.setPendingAppointment(null);
                }}
                formData={modalData.patientFormData}
                onChange={actions.handlePatientFormChange}
                onSubmit={actions.savePatient}
                isSaving={modalData.savingPatient}
            />

            {/* ESTADÍSTICAS */}
            <StatsModal
                isOpen={modals.stats}
                onClose={() => actions.setShowStatsModal(false)}
                donutData={modalData.donutData}
                barData={modalData.barData}
            />

            {/* IMC */}
            <BMICalculatorTool
                isOpen={modals.bmi}
                onClose={() => actions.setShowBMIModal(false)}
            />

            {/* GENERADOR DE DIETAS */}
            {modals.diet && (
                <DietGenerator
                    onClose={() => actions.setShowDietModal(false)}
                    onSave={(dietData) => {
                        console.log('Dieta guardada:', dietData);
                        actions.setShowDietModal(false);
                    }}
                />
            )}

            {/* HERRAMIENTAS AVANZADAS PRO */}
            {modals.herramientasAvanzadas && (
                <HerramientasAvanzadas
                    patientId={modalData?.selectedPatient?.id || null}
                    onClose={() => actions.setShowHerramientasAvanzadas(false)}
                />
            )}

        </>
    );
};

export default DashboardModals;