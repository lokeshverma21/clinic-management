"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  CreditCard,
  Calendar,
  ArrowUpRight,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClinicStatusBadge } from "./clinic-status-badge"
import type { AdminClinicListItem } from "../clinics.types"

interface ClinicsTableProps {
  clinics: AdminClinicListItem[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export function ClinicsTable({
  clinics,
  total,
  page,
  pageSize,
  onPageChange,
}: ClinicsTableProps) {
  const startRange = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, total);
  const totalPages = Math.ceil(total / pageSize) || 1;

  if (clinics.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 p-8 text-center text-sm text-muted-foreground bg-card">
        No clinics found matching the selected filter criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-3.5 pl-6">Clinic</TableHead>
              <TableHead className="py-3.5">Status</TableHead>
              <TableHead className="py-3.5">Owner</TableHead>
              <TableHead className="py-3.5 hidden md:table-cell">Subscription</TableHead>
              <TableHead className="py-3.5 hidden lg:table-cell">Trial Ends</TableHead>
              <TableHead className="py-3.5 hidden sm:table-cell">Created</TableHead>
              <TableHead className="w-[80px] text-right py-3.5 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clinics.map((clinic) => {
              const formattedCreated = clinic.createdAt
                ? format(new Date(clinic.createdAt), "MMM d, yyyy")
                : "—";

              const formattedTrial = clinic.trialEndsAt
                ? format(new Date(clinic.trialEndsAt), "MMM d, yyyy")
                : "—";

              return (
                <TableRow key={clinic.id} className="hover:bg-muted/30 group">
                  {/* Clinic Name & Slug */}
                  <TableCell className="py-3.5 pl-6">
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/clinics/${clinic.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[200px]">{clinic.name}</span>
                      </Link>
                      <div className="text-xs text-muted-foreground font-mono pl-5 truncate max-w-[200px]">
                        /{clinic.slug}
                        {clinic.phone && <span className="ml-2 font-sans">· {clinic.phone}</span>}
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5">
                    <ClinicStatusBadge status={clinic.status} />
                  </TableCell>

                  {/* Owner */}
                  <TableCell className="py-3.5 text-xs">
                    {clinic.ownerName || clinic.ownerEmail ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <User className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[170px]">
                            {clinic.ownerName ?? clinic.ownerEmail}
                          </span>
                        </div>
                        {clinic.ownerName && clinic.ownerEmail && (
                          <span className="text-muted-foreground pl-4 truncate max-w-[170px]">
                            {clinic.ownerEmail}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60 italic">No active owner</span>
                    )}
                  </TableCell>

                  {/* Plan / Subscription */}
                  <TableCell className="py-3.5 hidden md:table-cell text-xs">
                    {clinic.plan ? (
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground capitalize">{clinic.plan}</span>
                        {clinic.subscriptionStatus && (
                          <Badge variant="outline" className="text-[10px] font-mono py-0 px-1 capitalize">
                            {clinic.subscriptionStatus}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </TableCell>

                  {/* Trial Ends */}
                  <TableCell className="py-3.5 hidden lg:table-cell text-xs font-mono text-muted-foreground">
                    {clinic.trialEndsAt ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" />
                        <span>{formattedTrial}</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* Created At */}
                  <TableCell className="py-3.5 hidden sm:table-cell text-xs text-muted-foreground">
                    {formattedCreated}
                  </TableCell>

                  {/* Action Link */}
                  <TableCell className="text-right py-3.5 pr-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs gap-1 group-hover:bg-accent"
                      render={<Link href={`/admin/clinics/${clinic.id}`} />}
                    >
                      <span>View</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {startRange}–{endRange} of {total} clinics
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
