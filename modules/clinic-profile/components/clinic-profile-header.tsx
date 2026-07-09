"use client"

import * as React from "react"

interface ClinicProfileHeaderProps {
  title: string;
  subtitle: string;
}

export function ClinicProfileHeader({ title, subtitle }: ClinicProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-1 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">
        {subtitle}
      </p>
    </div>
  )
}
