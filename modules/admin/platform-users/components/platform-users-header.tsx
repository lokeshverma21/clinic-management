// modules/admin/platform-users/components/platform-users-header.tsx
import * as React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PlatformUsersHeaderProps {
  totalCount: number;
  canWrite: boolean;
  onAddClick: () => void;
}

export function PlatformUsersHeader({
  totalCount,
  canWrite,
  onAddClick,
}: PlatformUsersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Team</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCount} {totalCount === 1 ? 'member' : 'members'}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Manage platform administrator accounts and authorization tiers across the ClinicSeva console.
        </p>
      </div>

      {canWrite && (
        <Button size="sm" onClick={onAddClick} className="gap-2 shrink-0">
          <UserPlus className="size-4" />
          <span>Add Administrator</span>
        </Button>
      )}
    </div>
  );
}
