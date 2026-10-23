// modules/admin/platform-users/components/add-admin-dialog.tsx
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2, Info } from 'lucide-react';
import type { PlatformRole } from '../platform-users.types';

interface AddAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddAdminDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddAdminDialogProps) {
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<PlatformRole>('support');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const resetForm = () => {
    setEmail('');
    setRole('support');
    setErrorMessage('');
    setIsSubmitting(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMessage('Please enter an email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await fetch('/api/admin/platform-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, role }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to add administrator');
      }

      handleClose(false);
      onSuccess();
    } catch (err: unknown) {
      console.error('Error adding platform user:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred while adding admin',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-base font-semibold">Add Platform Administrator</DialogTitle>
            <DialogDescription className="text-xs">
              Grant platform-level administrative or support privileges to an existing user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground flex gap-2.5 items-start border border-border/50">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                The person must already have a ClinicSeva account with a verified email.
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs font-medium">
                Account Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="colleague@clinicseva.internal"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                disabled={isSubmitting}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-role" className="text-xs font-medium">
                Administrative Role
              </Label>
              <Select
                value={role}
                onValueChange={(val) => setRole((val as PlatformRole) ?? 'support')}
                disabled={isSubmitting}
              >
                <SelectTrigger id="admin-role" className="h-9 text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support" className="text-xs">
                    Support (Read-only observability across console)
                  </SelectItem>
                  <SelectItem value="super_admin" className="text-xs">
                    Super Admin (Full control: write, tenant actions & team management)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Administrator</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
