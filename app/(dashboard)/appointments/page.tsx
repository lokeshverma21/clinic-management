"use client"

import * as React from "react"
import { Calendar, List } from "lucide-react"
import { AppointmentHeader } from "@/modules/appointments/components/appointment-header"
import { AppointmentStats } from "@/modules/appointments/components/appointment-stats"
import { AppointmentToolbar } from "@/modules/appointments/components/appointment-toolbar"
import { AppointmentTimeline } from "@/modules/appointments/components/appointment-timeline"
import { AppointmentTable } from "@/modules/appointments/components/appointment-table"
import { AppointmentDialog } from "@/modules/appointments/components/appointment-dialog"
import { AppointmentDetailsSheet } from "@/modules/appointments/components/appointment-details-sheet"
import { AppointmentLoading } from "@/modules/appointments/components/appointment-loading"
import { AppointmentEmptyState } from "@/modules/appointments/components/appointment-empty-state"
import { AppointmentError } from "@/modules/appointments/components/appointment-error"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AppointmentsPage() {
  const [isBookingOpen, setIsBookingOpen] = React.useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [isEmpty, setIsEmpty] = React.useState(false)

  // Simulation of loading states
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="container p-6 lg:p-8 max-w-7xl mx-auto">
        <AppointmentLoading />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="container p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <AppointmentHeader onBookAppointment={() => setIsBookingOpen(true)} />
        <AppointmentError onRetry={() => { setHasError(false); setIsLoading(true); }} />
      </div>
    )
  }

  return (
    <div className="container p-4 sm:p-2 lg:p-2 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <AppointmentHeader onBookAppointment={() => setIsBookingOpen(true)} />
      
      <AppointmentStats />

      <AppointmentToolbar />

      {isEmpty ? (
        <AppointmentEmptyState onBookAppointment={() => setIsBookingOpen(true)} />
      ) : (
        <Tabs defaultValue="timeline" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-muted/50 p-1 rounded-lg border border-border/50">
              <TabsTrigger value="timeline" className="gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Calendar size={14} />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <List size={14} />
                List View
              </TabsTrigger>
            </TabsList>
            
            <div className="hidden sm:block text-xs text-muted-foreground font-medium">
              Showing 24 appointments for today
            </div>
          </div>

          <TabsContent value="timeline" className="mt-0 ring-offset-background focus-visible:outline-none">
             <div onClick={() => setIsDetailsOpen(true)} className="cursor-pointer">
                <AppointmentTimeline />
             </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0 ring-offset-background focus-visible:outline-none">
             <div onClick={() => setIsDetailsOpen(true)} className="cursor-pointer">
                <AppointmentTable />
             </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Overlays */}
      <AppointmentDialog 
        open={isBookingOpen} 
        onOpenChange={setIsBookingOpen} 
      />
      
      <AppointmentDetailsSheet 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
      />
    </div>
  )
}