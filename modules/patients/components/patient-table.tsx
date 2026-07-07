"use client"

import * as React from "react"
import { 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Archive,
  ChevronLeft,
  ChevronRight
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
import { PatientAvatar } from "./patient-avatar"
import { type Patient } from "../patients.types"

interface PatientTableProps {
  onViewPatient: (patientId: string) => void;
  onEditPatient: (patientId: string) => void;
  onArchivePatient: (patientId: string) => void;
}

const mockPatients: Patient[] = [
  {
    id: "1",
    fullName: "Sarah Connor",
    phone: "+1 234 567 890",
    email: "sarah.c@sky.net",
    gender: "female",
    dateOfBirth: "1984-05-12",
    notes: "Follow-up for chronic knee pain.",
    clinicId: "clinic-1",
    deletedAt: null,
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z")
  },
  {
    id: "2",
    fullName: "John Doe",
    phone: "+1 987 654 321",
    email: "john.doe@example.com",
    gender: "male",
    dateOfBirth: "1990-08-24",
    notes: null,
    clinicId: "clinic-1",
    deletedAt: null,
    createdAt: new Date("2024-01-20T14:30:00Z"),
    updatedAt: new Date("2024-01-20T14:30:00Z")
  },
  {
    id: "3",
    fullName: "Jane Miller",
    phone: "+1 555 012 345",
    email: "jane.m@healthcare.com",
    gender: "female",
    dateOfBirth: "1975-11-03",
    notes: "Allergic to penicillin.",
    clinicId: "clinic-1",
    deletedAt: null,
    createdAt: new Date("2024-02-01T09:15:00Z"),
    updatedAt: new Date("2024-02-01T09:15:00Z")
  },
];

export function PatientTable({ 
  onViewPatient, 
  onEditPatient, 
  onArchivePatient 
}: PatientTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] py-4 pl-6">Avatar</TableHead>
              <TableHead className="py-4">Name</TableHead>
              <TableHead className="py-4">Phone</TableHead>
              <TableHead className="py-4 hidden md:table-cell">Email</TableHead>
              <TableHead className="py-4 hidden lg:table-cell">Gender</TableHead>
              <TableHead className="py-4 hidden lg:table-cell">Date of Birth</TableHead>
              <TableHead className="py-4 hidden xl:table-cell">Created Date</TableHead>
              <TableHead className="w-[80px] text-right py-4 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPatients.map((patient) => (
              <TableRow key={patient.id} className="group hover:bg-muted/30 transition-colors border-border/50">
                <TableCell className="py-4 pl-6">
                  <PatientAvatar name={patient.fullName} />
                </TableCell>
                <TableCell className="py-4">
                  <span className="font-medium text-sm group-hover:text-primary transition-colors cursor-pointer" onClick={() => onViewPatient(patient.id)}>
                    {patient.fullName}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">{patient.phone}</TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground hidden md:table-cell">{patient.email}</TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground capitalize hidden lg:table-cell">{patient.gender}</TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground hidden lg:table-cell">{patient.dateOfBirth}</TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground hidden xl:table-cell">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right py-4 pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal size={16} />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2" onClick={() => onViewPatient(patient.id)}>
                         <Eye size={16} className="text-muted-foreground" />
                         View Patient
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => onEditPatient(patient.id)}>
                         <Pencil size={16} className="text-muted-foreground" />
                         Edit Patient
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/5"
                        onClick={() => onArchivePatient(patient.id)}
                      >
                         <Archive size={16} />
                         Archive Patient
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination component to match toolbar theme */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">10</span> of <span className="font-medium text-foreground">1,280</span> patients
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border/50" disabled>
            <ChevronLeft size={16} />
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="default" size="sm" className="h-8 w-8 p-0 text-xs shadow-none">1</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs">2</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs">3</Button>
          </div>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border/50">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
