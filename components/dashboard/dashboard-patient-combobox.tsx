"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, AlertCircle } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Patient } from "@/modules/patients"

export interface DashboardPatientComboboxProps {
  value: string
  onChange: (patientId: string) => void
  disabled?: boolean
  initialLabel?: string
  initialPatientList?: Patient[]
  placeholder?: string
  id?: string
  name?: string
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-required"?: boolean
}

export function DashboardPatientCombobox({
  value,
  onChange,
  disabled = false,
  initialLabel,
  initialPatientList,
  placeholder = "Select patient...",
  id,
  name,
  className,
  "aria-label": ariaLabel = "Select patient",
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
}: DashboardPatientComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [patients, setPatients] = React.useState<Patient[]>(() => initialPatientList ?? [])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [hasMore, setHasMore] = React.useState(false)

  // Track the latest selected or loaded patient object to display accurate label
  const [selectedPatientCache, setSelectedPatientCache] = React.useState<Patient | null>(null)

  // If initialPatientList updates (e.g., new patient created via PatientDialog), merge into list
  React.useEffect(() => {
    if (initialPatientList && initialPatientList.length > 0) {
      const timer = setTimeout(() => {
        setPatients((prev) => {
          const ids = new Set(prev.map((p) => p.id))
          const newItems = initialPatientList.filter((p) => !ids.has(p.id))
          return newItems.length > 0 ? [...newItems, ...prev] : prev
        })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [initialPatientList])

  // Request counter to ignore stale out-of-order responses
  const requestSeqRef = React.useRef(0)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const fetchPatients = React.useCallback(async (searchQuery: string) => {
    const seq = ++requestSeqRef.current

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: "1",
        pageSize: "20",
      })
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim())
      }

      const res = await fetch(`/api/patients?${params.toString()}`, {
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`Failed to load patients (${res.status})`)
      }

      const json = await res.json()
      if (seq !== requestSeqRef.current) return // Stale response

      const list: Patient[] = json.data?.patients ?? []
      const total: number = json.data?.total ?? list.length
      setPatients(list)
      setHasMore(total > list.length)
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return // Ignored
      }
      if (seq === requestSeqRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load patients")
      }
    } finally {
      if (seq === requestSeqRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // Debounced search on query change when open (instant on open, 300ms when typing)
  React.useEffect(() => {
    if (!open) return

    const delay = query ? 300 : 0
    const timer = setTimeout(() => {
      void fetchPatients(query)
    }, delay)

    return () => clearTimeout(timer)
  }, [query, open, fetchPatients])

  // Find selected patient either from loaded list or selection cache
  const selectedPatient = React.useMemo(() => {
    if (!value) return null
    return (
      patients.find((p) => p.id === value) ??
      (selectedPatientCache?.id === value ? selectedPatientCache : null)
    )
  }, [value, patients, selectedPatientCache])

  // Compute trigger label
  const displayLabel = React.useMemo(() => {
    if (selectedPatient) {
      return `${selectedPatient.fullName} (${selectedPatient.phone})`
    }
    if (value) {
      return initialLabel || "Selected patient"
    }
    return placeholder
  }, [selectedPatient, value, initialLabel, placeholder])

  const handleSelect = (patient: Patient) => {
    setSelectedPatientCache(patient)
    onChange(patient.id)
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            id={id}
            name={name}
            disabled={disabled}
            aria-expanded={open}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-required={ariaRequired}
            className={cn(
              "w-full justify-between h-10 text-sm font-normal bg-background hover:bg-background/80 transition-colors",
              !value && "text-muted-foreground",
              className
            )}
          >
            <span className="truncate text-left">{displayLabel}</span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent
        className="w-[var(--anchor-width,340px)] min-w-[280px] p-0 shadow-md border-border/60"
        align="start"
      >
        <Command shouldFilter={false} className="flex flex-col max-h-[300px]">
          <CommandInput
            placeholder="Search name or phone..."
            value={query}
            onValueChange={setQuery}
            className="h-9 text-xs"
          />
          <CommandList className="max-h-[240px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                <span>Searching patients...</span>
              </div>
            )}

            {error && !loading && (
              <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/5 m-1 rounded-md">
                <AlertCircle className="size-3.5 shrink-0" />
                <span className="flex-1 truncate">{error}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchPatients(query)}
                  className="h-6 text-[11px] px-2"
                >
                  Retry
                </Button>
              </div>
            )}

            {!loading && !error && patients.length === 0 && (
              <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                No patients found.
              </CommandEmpty>
            )}

            {!loading && !error && patients.length > 0 && (
              <CommandGroup>
                {patients.map((p) => {
                  const isSelected = value === p.id
                  const extraDetails = [
                    p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : null,
                    p.dateOfBirth ? `DOB: ${p.dateOfBirth}` : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")

                  return (
                    <CommandItem
                      key={p.id}
                      value={p.id}
                      onSelect={() => handleSelect(p)}
                      className="text-xs py-2 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 size-3.5 shrink-0 text-primary",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground truncate">
                            {p.fullName}
                          </span>
                          <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                            {p.phone}
                          </span>
                        </div>
                        {extraDetails && (
                          <span className="text-[10px] text-muted-foreground/80 truncate">
                            {extraDetails}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {hasMore && !loading && (
              <div className="p-2 border-t border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground">
                  Type name or phone to narrow results
                </p>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
