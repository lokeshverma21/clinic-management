// modules/admin/platform-users/components/platform-users-view.tsx
'use client';

import * as React from 'react';
import type { PlatformUserListItem } from '../platform-users.types';
import { PlatformUsersHeader } from './platform-users-header';
import { PlatformUsersTable } from './platform-users-table';
import { PlatformUsersLoading } from './platform-users-loading';
import { PlatformUsersError } from './platform-users-error';
import { AddAdminDialog } from './add-admin-dialog';
import { ChangeRoleDialog } from './change-role-dialog';
import { RemoveAdminDialog } from './remove-admin-dialog';

interface PlatformUsersViewProps {
  canWrite: boolean;
}

export function PlatformUsersView({ canWrite }: PlatformUsersViewProps) {
  const [users, setUsers] = React.useState<PlatformUserListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = React.useState<PlatformUserListItem | null>(
    null,
  );
  const [selectedUserForRemove, setSelectedUserForRemove] =
    React.useState<PlatformUserListItem | null>(null);

  const loadUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');

      const res = await fetch('/api/admin/platform-users');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to load administrator team');
      }

      setUsers(json.data.users ?? []);
    } catch (err: unknown) {
      console.error('Error loading platform users:', err);
      setHasError(true);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while loading platform users',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  return (
    <div className="space-y-6">
      <PlatformUsersHeader
        totalCount={users.length}
        canWrite={canWrite}
        onAddClick={() => setIsAddOpen(true)}
      />

      {isLoading && users.length === 0 ? (
        <PlatformUsersLoading />
      ) : hasError && users.length === 0 ? (
        <PlatformUsersError onRetry={loadUsers} message={errorMessage} />
      ) : (
        <PlatformUsersTable
          users={users}
          canWrite={canWrite}
          onChangeRole={(u) => setSelectedUserForRole(u)}
          onRemove={(u) => setSelectedUserForRemove(u)}
        />
      )}

      {/* Action Dialogs */}
      {canWrite && (
        <>
          <AddAdminDialog
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            onSuccess={loadUsers}
          />

          <ChangeRoleDialog
            user={selectedUserForRole}
            open={Boolean(selectedUserForRole)}
            onOpenChange={(open) => !open && setSelectedUserForRole(null)}
            onSuccess={loadUsers}
          />

          <RemoveAdminDialog
            user={selectedUserForRemove}
            open={Boolean(selectedUserForRemove)}
            onOpenChange={(open) => !open && setSelectedUserForRemove(null)}
            onSuccess={loadUsers}
          />
        </>
      )}
    </div>
  );
}
