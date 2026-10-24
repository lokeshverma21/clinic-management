// modules/admin/platform-users/components/platform-users-table.tsx
'use client';

import * as React from 'react';
import { formatIstDate } from '@/lib/time';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, UserMinus } from 'lucide-react';
import { PlatformRoleBadge } from './platform-role-badge';
import type { PlatformUserListItem } from '../platform-users.types';

interface PlatformUsersTableProps {
  users: PlatformUserListItem[];
  canWrite: boolean;
  onChangeRole: (user: PlatformUserListItem) => void;
  onRemove: (user: PlatformUserListItem) => void;
}

export function PlatformUsersTable({
  users,
  canWrite,
  onChangeRole,
  onRemove,
}: PlatformUsersTableProps) {
  return (
    <Card className="shadow-none border-border/60">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[30%]">Administrator</TableHead>
              <TableHead className="w-[30%]">Email Address</TableHead>
              <TableHead className="w-[18%]">Assigned Role</TableHead>
              <TableHead className="w-[14%]">Added Date</TableHead>
              {canWrite && <TableHead className="w-[8%] text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const canActOnUser = canWrite && !user.isCurrentUser;

              return (
                <TableRow key={user.id} className="group">
                  {/* Administrator Name + 'You' Badge */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{user.fullName}</span>
                      {user.isCurrentUser && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 font-mono uppercase bg-primary/10 text-primary border-primary/20"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {user.email}
                  </TableCell>

                  {/* Role Badge */}
                  <TableCell>
                    <PlatformRoleBadge role={user.role} />
                  </TableCell>

                  {/* Added Date */}
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatIstDate(user.createdAt, 'MMM d, yyyy')}
                  </TableCell>

                  {/* Row Actions Menu */}
                  {canWrite && (
                    <TableCell className="text-right">
                      {canActOnUser ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              className="gap-2 text-xs"
                              onClick={() => onChangeRole(user)}
                            >
                              <Shield className="size-3.5 text-muted-foreground" />
                              <span>Change Role</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => onRemove(user)}
                            >
                              <UserMinus className="size-3.5" />
                              <span>Remove Admin</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs px-2">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
