// modules/admin/platform-users/components/remove-admin-dialog.tsx
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
import { AlertCircle, Loader2, UserMinus } from 'lucide-react';
import type { PlatformUserListItem } from '../platform-users.types';

interface RemoveAdminDialogProps {
  user: PlatformUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RemoveAdminDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: RemoveAdminDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setErrorMessage('');
      setIsDeleting(false);
    }
    onOpenChange(isOpen);
  };

  const handleConfirm = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      setErrorMessage('');

      const res = await fetch(`/api/admin/platform-users/${user.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to remove administrator');
      }

      handleClose(false);
      onSuccess();
    } catch (err: unknown) {
      console.error('Error removing platform user:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred while removing admin',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2 text-destructive">
            <UserMinus className="size-5" />
            <DialogTitle className="text-base font-semibold">Remove Administrator</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Are you sure you want to revoke platform access for{' '}
            <span className="font-semibold text-foreground">{user.fullName}</span> ({user.email})?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs text-muted-foreground">
          <p>
            This action will immediately prevent this user from accessing any part of the ClinicSeva
            administration console (/admin).
          </p>
          <p>
            Their past actions recorded in the platform audit log will remain intact with their email address preserved.
          </p>

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive mt-2">
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
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <span>Confirm Removal</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
