'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '@/lib/tenant-api';

interface TenantHeaderProps {
  title: string;
}

export function TenantHeader({ title }: TenantHeaderProps) {
  const { data } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => fetchNotifications({ read: false }),
    refetchInterval: 60_000,
  });

  const unreadCount = data?.length ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1E3350] bg-[#07111F]/90 px-6 backdrop-blur-sm">
      <h1 className="font-bold text-lg tracking-tight text-[#F8FAFC]">{title}</h1>
      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] transition-all hover:border-[#2B4A73] hover:text-[#F8FAFC]"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F43F5E] text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
