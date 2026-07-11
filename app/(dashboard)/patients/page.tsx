"use client"

import * as React from "react"
import { PatientHeader } from "@/modules/patients/components/patient-header"
import { PatientStats } from "@/modules/patients/components/patient-stats"
import { PatientToolbar } from "@/modules/patients/components/patient-toolbar"
import { PatientTable } from "@/modules/patients/components/patient-table"
import { PatientDialog } from "@/modules/patients/components/patient-dialog"
import { PatientDetailsSheet } from "@/modules/patients/components/patient-details-sheet"
import { PatientLoading } from "@/modules/patients/components/patient-loading"

export default function PatientsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<'add' | 'edit'>('add');
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);

  // Simulate initial loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAddPatient = () => {
    setDialogMode('add');
    setIsDialogOpen(true);
  };

  const handleViewPatient = (id: string) => {
    setSelectedPatientId(id);
    setIsSheetOpen(true);
  };

  const handleEditPatient = (id: string) => {
    setSelectedPatientId(id);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleArchivePatient = (id: string) => {
    alert(`Archive patient ${id}`);
  };

  if (isLoading) {
    return (
      <div className="container p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PatientLoading />
      </div>
    );
  }

  return (
    <div className="container p-4 sm:p-6 lg:p-2 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PatientHeader onAddPatient={handleAddPatient} />
      
      <PatientStats />
      
      <div className="space-y-4">
        <PatientToolbar />
        <PatientTable 
          onViewPatient={handleViewPatient}
          onEditPatient={handleEditPatient}
          onArchivePatient={handleArchivePatient}
        />
      </div>

      <PatientDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        mode={dialogMode}
      />

      <PatientDetailsSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        patientId={selectedPatientId}
        onEdit={() => {
          setIsSheetOpen(false);
          setDialogMode('edit');
          setIsDialogOpen(true);
        }}
      />
    </div>
  )
}