"use client"

import * as React from "react"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  UserPlus,
  FileText 
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDialog({ open, onOpenChange }: AppointmentDialogProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/60 shadow-lg p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment for a patient.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 min-h-0">
          <div className="grid gap-6 p-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient</Label>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger id="patient" className="h-10 bg-background flex-1 text-sm">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Connor</SelectItem>
                      <SelectItem value="john">John Doe</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" title="Add Patient">
                    <UserPlus size={18} className="text-primary" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Doctor</Label>
                <Select>
                  <SelectTrigger id="doctor" className="h-10 bg-background text-sm">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                    <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10 bg-background text-sm",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      }
                    />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-time" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start</Label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="start-time" placeholder="09:00" className="pl-9 h-10 bg-background text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">End</Label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="end-time" placeholder="09:30" className="pl-9 h-10 bg-background text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (Optional)</Label>
                <div className="relative">
                  <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Textarea 
                    id="notes" 
                    placeholder="Reason for visit, symptoms, etc." 
                    className="pl-9 min-h-[100px] bg-background resize-none py-2.5 text-sm" 
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="bg-muted/30 p-6 pt-4 mt-0 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-6">
            Cancel
          </Button>
          <Button type="submit" className="h-10 px-6 bg-primary">
            Book Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
