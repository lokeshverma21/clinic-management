"use client"

import * as React from "react"
import { 
  User, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon,
  FileText,
  AlertCircle
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
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
}

export function PatientDialog({ open, onOpenChange, mode }: PatientDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>();

  // Mock submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call and potential duplicate warning
    setTimeout(() => {
      if (!showDuplicateWarning && mode === 'add') {
        setShowDuplicateWarning(true);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        onOpenChange(false);
        setShowDuplicateWarning(false);
      }
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/60 shadow-lg p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">
            {mode === 'add' ? 'Add Patient' : 'Edit Patient'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Create a new patient record in the system.' 
              : 'Modify existing patient information.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh]">
            <div className="grid gap-6 p-6 pt-4">
              {showDuplicateWarning && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold mb-1">Potential Duplicate</p>
                    <p>This phone number already exists for another patient. Shared household numbers are allowed.</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" placeholder="e.g. Sarah Connor" className="pl-9 h-10 bg-background text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" placeholder="+1 234 567 890" className="pl-9 h-10 bg-background text-sm" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="sarah.c@sky.net" className="pl-9 h-10 bg-background text-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-10 bg-background text-sm pl-9",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender</Label>
                    <Select defaultValue="female">
                      <SelectTrigger id="gender" className="h-10 bg-background text-sm">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (Optional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Textarea 
                      id="notes" 
                      placeholder="Medical history, allergies, etc." 
                      className="pl-9 min-h-[100px] bg-background resize-none py-2.5 text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="bg-muted/30 p-6 pt-4 mt-0 border-t border-border/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="h-10 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="h-10 px-6 bg-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : (mode === 'add' ? 'Create Patient' : 'Save Changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
