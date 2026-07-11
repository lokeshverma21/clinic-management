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
import { type StaffListItem } from "../staff.types"
import { Patient } from "@/modules/patients/patients.types"
import { StaffAvatar } from "./staff-avatar"
import { Badge } from "@/components/ui/badge"

interface StaffTableProps {
  staff: StaffListItem[]

  onViewStaff: (staff: StaffListItem) => void
  onEditStaff: (staff: StaffListItem) => void
  onArchiveStaff: (staff: StaffListItem) => void
}


export function StaffTable({ 
  onViewStaff, 
  onEditStaff, 
  onArchiveStaff 
}: StaffTableProps) {

    const [staff, setStaff] = React.useState<StaffListItem[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
    async function loadStaff() {
        try {
        const res = await fetch("/api/staff");

        if (!res.ok) {
            throw new Error("Failed to load staff");
        }

        const json = await res.json();
        setStaff(json.data.staff);
        } finally {
        setLoading(false);
        }
    }

    loadStaff();
    }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] py-4 pl-6">Avatar</TableHead>
              <TableHead className="py-4">Name</TableHead>
              <TableHead className="py-4 hidden md:table-cell">Email</TableHead>
              <TableHead className="py-4">Phone</TableHead>
              <TableHead className="py-4">Role</TableHead>
              <TableHead className="py-4 hidden lg:table-cell">Status</TableHead>
              <TableHead className="py-4 hidden lg:table-cell">Joined</TableHead>
              <TableHead className="w-[80px] text-right py-4 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((staff) => (
              <TableRow key={staff.membershipId} className="group hover:bg-muted/30 transition-colors border-border/50">
                <TableCell className="py-4 pl-6">
                  <StaffAvatar name={staff.user?.fullName ?? "Pending Invite"} />
                </TableCell>
                <TableCell className="py-4">
                  <span className="font-medium text-sm group-hover:text-primary transition-colors cursor-pointer" onClick={() => onViewStaff(staff)}>
                    {staff.user?.fullName ?? "Pending Invite"}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground hidden md:table-cell">{staff.user?.email ?? staff.invitedEmail ?? "-"}</TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">{staff.user?.phone ?? "-"}</TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground capitalize hidden lg:table-cell"><Badge variant={`${staff.role == "owner" ? "default" : "secondary"}`}>{staff.role}</Badge></TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground capitalize hidden lg:table-cell">{staff.status}</TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground hidden xl:table-cell">
                  {staff.joinedAt ? new Date(staff.joinedAt).toLocaleDateString() : "Pending"}
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
                      <DropdownMenuItem className="gap-2" onClick={() => onViewStaff(staff)}>
                         <Eye size={16} className="text-muted-foreground" />
                         View Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => onEditStaff(staff)}>
                         <Pencil size={16} className="text-muted-foreground" />
                         Edit Staff
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/5"
                        onClick={() => onArchiveStaff(staff)}
                      >
                         <Archive size={16} />
                         Archive Staff
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
            {staff.length} staff member{staff.length !== 1 && "s"}
          {/* Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">10</span> of <span className="font-medium text-foreground">1,280</span> patients */}
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
