'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';

/**
 * Sign-out control for the MinimalSidebar bottom nav. Matches the SidebarLink
 * look but renders a button (no navigation target). Posts to the
 * /api/v2/auth/logout proxy — which revokes the session server-side and clears
 * the httpOnly cookies — then redirects to /login, all via useAuth().logout().
 */
export function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const { logout } = useAuth();
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    if (pending) return;
    setPending(true);
    // logout() redirects on success; if it throws we re-enable the button.
    try {
      await logout();
    } catch {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label="Sign out"
      title={collapsed ? 'Sign out' : undefined}
      className={`group relative mx-2 flex w-[calc(100%-1rem)] items-center justify-center rounded-xl py-3 text-[#94A3B8] transition-all duration-150 hover:bg-[#F43F5E]/10 hover:text-[#FCA5A5] disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <LogOut className="h-5 w-5" />
      {collapsed && (
        <span className="absolute left-full ml-2 hidden rounded-lg bg-[#13233C] px-3 py-2 text-sm text-white group-hover:block z-50">
          Sign out
        </span>
      )}
    </button>
  );
}
