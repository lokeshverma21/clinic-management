// modules/admin/platform-users/components/platform-role-badge.tsx
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import type { PlatformRole } from '../platform-users.types';

interface PlatformRoleBadgeProps {
  role: PlatformRole;
}

export function PlatformRoleBadge({ role }: PlatformRoleBadgeProps) {
  if (role === 'super_admin') {
    return (
      <Badge
        variant="default"
        className="font-mono text-xs gap-1 py-0.5 px-2 bg-primary/90 hover:bg-primary text-primary-foreground capitalize"
      >
        <ShieldAlert className="size-3" />
        <span>Super Admin</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="font-mono text-xs gap-1 py-0.5 px-2 bg-muted text-muted-foreground capitalize border border-border/60"
    >
      <ShieldCheck className="size-3" />
      <span>Support</span>
    </Badge>
  );
}
