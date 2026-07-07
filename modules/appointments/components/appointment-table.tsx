"use client"

import * as React from "react"
import { 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  XCircle, 
  CheckCircle2 
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AppointmentStatusBadge, type AppointmentStatus } from "./appointment-status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AppointmentRow {
  id: string;
  time: string;
  patient: { name: string; phone: string };
  doctor: string;
  status: AppointmentStatus;
  notes: string;
}

const mockTableData: AppointmentRow[] = [
  {
    id: "1",
    time: "09:00 AM",
    patient: { name: "Sarah Connor", phone: "+1 234 567 890" },
    doctor: "Dr. Smith",
    status: "completed",
    notes: "Follow-up for chronic knee pain. Patient mentioned slight improvement since last visit.",
  },
  {
    id: "2",
    time: "09:30 AM",
    patient: { name: "John Doe", phone: "+1 987 654 321" },
    doctor: "Dr. Smith",
    status: "confirmed",
    notes: "New patient consultation.",
  },
  {
    id: "3",
    time: "09:30 AM",
    patient: { name: "Jane Miller", phone: "+1 555 012 345" },
    doctor: "Dr. Johnson",
    status: "booked",
    notes: "Annual physical exam.",
  },
  {
    id: "4",
    time: "10:00 AM",
    patient: { name: "Michael Scott", phone: "+1 444 999 111" },
    doctor: "Dr. Johnson",
    status: "no_show",
    notes: "Requested earlier slot but didn't confirm.",
  },
  {
    id: "5",
    time: "11:00 AM",
    patient: { name: "Pam Beesly", phone: "+1 777 888 222" },
    doctor: "Dr. Smith",
    status: "booked",
    notes: "Post-surgery checkup.",
  },
];

export function AppointmentTable() {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px] py-4">Time</TableHead>
            <TableHead className="py-4">Patient</TableHead>
            <TableHead className="py-4">Doctor</TableHead>
            <TableHead className="py-4">Status</TableHead>
            <TableHead className="py-4 hidden lg:table-cell">Notes</TableHead>
            <TableHead className="w-[80px] text-right py-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTableData.map((row) => (
            <TableRow key={row.id} className="group hover:bg-muted/30 transition-colors border-border/50">
              <TableCell className="font-medium align-top py-4">{row.time}</TableCell>
              <TableCell className="align-top py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-border/60">
                    <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                      {row.patient.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">{row.patient.name}</span>
                    <span className="text-xs text-muted-foreground">{row.patient.phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="align-top py-4">
                <span className="text-sm">{row.doctor}</span>
              </TableCell>
              <TableCell className="align-top py-4">
                <AppointmentStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground text-sm align-top py-4 hidden lg:table-cell">
                {row.notes}
              </TableCell>
              <TableCell className="text-right align-top py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal size={16} />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2">
                       <Eye size={16} className="text-muted-foreground" />
                       View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                       <Pencil size={16} className="text-muted-foreground" />
                       Edit Appointment
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2">
                       <CheckCircle2 size={16} className="text-green-600" />
                       Mark Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive">
                       <XCircle size={16} />
                       Cancel Appointment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
