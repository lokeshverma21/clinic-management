"use client"

import * as React from "react"
import { formatIstDate } from "@/lib/time"
import { User, Mail, Phone, Calendar, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AdminClinicOwner } from "../clinics.types"

interface ClinicOwnerCardProps {
  owners: AdminClinicOwner[];
}

export function ClinicOwnerCard({ owners }: ClinicOwnerCardProps) {
  return (
    <Card className="shadow-none border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>Clinic Ownership</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs font-mono">
            {owners.length} {owners.length === 1 ? "Owner" : "Owners"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Registered primary contact and administrative account holders for this tenant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {owners.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No active owner membership found for this clinic.
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {owners.map((owner) => (
              <div key={owner.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{owner.fullName}</span>
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>Active Owner</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{owner.email}</span>
                  </div>

                  {owner.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{owner.phone}</span>
                    </div>
                  )}

                  {owner.joinedAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>Joined {formatIstDate(owner.joinedAt, "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
