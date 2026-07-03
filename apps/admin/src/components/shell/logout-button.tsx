'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialogue';
import { useAuth } from '../../hooks/use-auth';

/**
 * Sidebar account control: shows the signed-in user (avatar + name/email) and,
 * on click, opens a confirmation dialog before signing out.
 *
 * Sign-out posts to the /api/v2/auth/logout proxy — which revokes the session
 * server-side and clears the httpOnly cookies — then redirects to /login, all
 * via useAuth().logout().
 */
export function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();
  const [pending, setPending] = useState(false);

  // Nothing to show until the session resolves.
  if (!user) return null;

  const name = user.username ?? user.email ?? 'Account';
  const email = user.email ?? user.username ?? '';
  const role = user.role ?? user.roles?.[0];
  const initial = name.charAt(0).toUpperCase();

  const onConfirm = async () => {
    if (pending) return;
    setPending(true);
    // logout() redirects on success; re-enable only if it throws.
    try {
      await logout();
    } catch {
      setPending(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Account: ${name}`}
        title={collapsed ? name : undefined}
        className="group relative mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-xl px-2 py-2.5 text-left text-[#94A3B8] transition-all duration-150 hover:bg-[#17304E] hover:text-white"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-xs font-semibold text-white">
          {initial}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-[#E2E8F0]">{name}</span>
            {email && email !== name && (
              <span className="block truncate text-[10px] text-[#8A99AD]">{email}</span>
            )}
          </span>
        )}
        {collapsed && (
          <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-lg bg-[#13233C] px-3 py-2 text-sm text-white group-hover:block z-50">
            {name}
          </span>
        )}
      </DialogTrigger>

      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Sign out?</DialogTitle>
          <DialogDescription>
            You&apos;re signed in as{' '}
            <span className="font-medium text-[#E2E8F0]">{name}</span>
            {email && email !== name ? ` (${email})` : ''}
            {role ? ` · ${role}` : ''}. You&apos;ll need to sign in again to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm" disabled={pending}>Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={pending}
          >
            <LogOut className="size-3.5" />
            {pending ? 'Signing out…' : 'Sign out'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
