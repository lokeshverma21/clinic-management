// modules/admin/platform-users/components/change-role-dialog.tsx
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { PlatformUserListItem, PlatformRole } from '../platform-users.types';

interface ChangeRoleDialogProps {
  user: PlatformUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = React.useState<PlatformRole | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const effectiveRole = selectedRole ?? user?.role ?? 'support';

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedRole(null);
      setErrorMessage('');
      setIsSubmitting(false);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (effectiveRole === user.role) {
      setErrorMessage('Please select a different role to change.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await fetch(`/api/admin/platform-users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: effectiveRole }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to update administrator role');
      }

      handleClose(false);
      onSuccess();
    } catch (err: unknown) {
      console.error('Error changing platform user role:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred while changing role',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-base font-semibold">Change Administrator Role</DialogTitle>
            <DialogDescription className="text-xs">
              Modify platform privileges for <span className="font-semibold text-foreground">{user.fullName}</span> ({user.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="change-role-select" className="text-xs font-medium">
                Assigned Role
              </Label>
              <Select
                value={effectiveRole}
                onValueChange={(val) => {
                  setSelectedRole((val as PlatformRole) ?? user.role);
                  if (errorMessage) setErrorMessage('');
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="change-role-select" className="h-9 text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support" className="text-xs">
                    Support (Read-only observability)
                  </SelectItem>
                  <SelectItem value="super_admin" className="text-xs">
                    Super Admin (Full write permissions & team management)
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Role</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
