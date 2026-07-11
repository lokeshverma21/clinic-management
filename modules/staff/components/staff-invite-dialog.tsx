"use client"

import * as React from "react"
import { 
  Mail, 
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

interface StaffInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add';
}

export function StaffInviteDialog({ open, onOpenChange, mode }: StaffInviteDialogProps) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"doctor" | "receptionist">("doctor");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
        const response = await fetch("/api/staff/invite", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            role,
        }),
        });

        const result = await response.json();

        if (!response.ok) {
        throw new Error(result.error?.message ?? "Something went wrong");
        }

        // Reset form
        setEmail("");
        setRole("doctor");

        onOpenChange(false);

        // Later you can refresh the staff list here.
        // router.refresh();
        // or mutate();
    } catch (err) {
        if (err instanceof Error) {
        setError(err.message);
        } else {
        setError("Something went wrong");
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/60 shadow-lg p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">
            {mode === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Create a new staff member record in the system.' 
              : 'Modify existing staff member information.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh]">
            <div className="grid gap-6 p-6 pt-4">

              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor@gmail.com" className="pl-9 h-10 bg-background text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</Label>
                    <Select defaultValue="doctor" value={role} onValueChange={(value) => setRole(value as "doctor" | "receptionist")}>
                      <SelectTrigger id="role" className="h-10 bg-background text-sm">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                      </SelectContent>
                    </Select>
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
              {isSubmitting ? "Sending Invitation..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      {error && (
        <div className="mx-6 mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
        </div>
        )}
    </Dialog>
  )
}
