"use client"

import * as React from "react"
import { 
  User, 
  Calendar, 
  Clock, 
  FileText,
  Pencil,
  XCircle,
  CheckCircle2,
  Activity 
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AppointmentStatusBadge } from "./appointment-status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AppointmentDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailsSheet({ open, onOpenChange }: AppointmentDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-border/60 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Appointment Details</SheetTitle>
            <AppointmentStatusBadge status="confirmed" />
          </div>
          <SheetDescription>
            Reference ID: #APT-7829-2024
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-8">
            {/* Patient Info */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User size={14} />
                Patient Information
              </h3>
              <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                <Avatar className="h-12 w-12 border border-background">
                  <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">SC</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">Sarah Connor</div>
                  <div className="text-sm text-muted-foreground">+1 234 567 890</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">sarah.c@example.com</div>
                </div>
              </div>
            </section>

            {/* Doctor Info */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User size={14} />
                Assigned Doctor
              </h3>
              <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                <Avatar className="h-12 w-12 border border-background">
                  <AvatarFallback className="bg-blue-50 text-blue-600 text-sm font-semibold">DS</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">Dr. Smith</div>
                  <div className="text-sm text-muted-foreground">General Physician</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Building A, Room 302</div>
                </div>
              </div>
            </section>

            {/* Date & Time */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar size={14} />
                Schedule
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Date</span>
                  <span className="text-sm font-medium">July 08, 2024</span>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Time</span>
                  <span className="text-sm font-medium">09:30 AM - 10:15 AM</span>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText size={14} />
                Special Notes
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Patient requested follow-up after laboratory results. Mentioned persistent headache and fatigue for the last 3 days. Previous allergy noted: Penicillin.
                </p>
              </div>
            </section>

            {/* Activity Timeline */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity size={14} />
                Activity History
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-border/50 ml-1">
                {[
                  { time: "Today, 10:15 AM", event: "Status updated to Confirmed", user: "Receptionist" },
                  { time: "Yesterday, 04:30 PM", event: "Appointment booked", user: "Online Portal" },
                ].map((item, i) => (
                  <div key={i} className="relative pl-7">
                    <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-border border-2 border-background" />
                    <div className="text-sm font-medium">{item.event}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span>{item.time}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <span>by {item.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t border-border/50 grid grid-cols-2 gap-2 bg-muted/10">
          <Button variant="outline" className="w-full gap-2 text-xs">
            <Pencil size={14} />
            Edit
          </Button>
          <Button variant="outline" className="w-full gap-2 text-xs text-destructive hover:text-destructive">
            <XCircle size={14} />
            Cancel
          </Button>
          <Button className="w-full gap-2 text-xs col-span-2 mt-2 bg-primary">
            <CheckCircle2 size={14} />
            Mark as Completed
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
