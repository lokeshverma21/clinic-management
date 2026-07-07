"use client"

import * as React from "react"
import { 
  User, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Activity,
  Pencil,
  Archive,
  History,
  Scale
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
import { Separator } from "@/components/ui/separator"
import { PatientAvatar } from "./patient-avatar"

interface PatientDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string | null;
  onEdit: () => void;
}

export function PatientDetailsSheet({ 
  open, 
  onOpenChange, 
  patientId,
  onEdit
}: PatientDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-border/60 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Patient Profile</SheetTitle>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Active
            </div>
          </div>
          <SheetDescription>
            Record created on Jan 15, 2024
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-8">
            {/* Header / Basic Info */}
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <PatientAvatar name="Sarah Connor" className="h-20 w-20 text-xl" />
              <div>
                <h3 className="text-lg font-bold text-foreground">Sarah Connor</h3>
                <p className="text-sm text-muted-foreground">Patient ID: #PAT-8821</p>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* Contact & Personal */}
            <div className="grid gap-6">
              <section className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User size={14} />
                  Personal Information
                </h4>
                <div className="grid gap-3">
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">Phone</span>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Phone size={14} className="text-muted-foreground" />
                      +1 234 567 890
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">Email</span>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Mail size={14} className="text-muted-foreground" />
                      sarah.c@sky.net
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">Gender</span>
                      <div className="flex items-center gap-2 text-sm font-medium capitalize">
                        <Scale size={14} className="text-muted-foreground" />
                        Female
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">Birthday</span>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar size={14} className="text-muted-foreground" />
                        May 12, 1984
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Medical Notes */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText size={14} />
                  Medical Notes
                </h4>
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Follow-up for chronic knee pain. Patient mentioned slight improvement since last visit. No known medication allergies reported recently.
                  </p>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Activity size={14} />
                  System Activity
                </h4>
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-border/50 ml-1">
                  {[
                    { time: "June 24, 2024", event: "Profile updated", user: "Receptionist" },
                    { time: "Jan 15, 2024", event: "Account created", user: "System" },
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
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t border-border/50 grid grid-cols-2 gap-2 bg-muted/10">
          <Button variant="outline" className="w-full gap-2 text-xs" onClick={onEdit}>
            <Pencil size={14} />
            Edit Profile
          </Button>
          <Button variant="outline" className="w-full gap-2 text-xs text-destructive hover:text-destructive">
            <Archive size={14} />
            Archive
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
