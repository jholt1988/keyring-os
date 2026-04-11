'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Wallet, Users, Home, Wrench, RefreshCw, AlertTriangle, BookOpen } from 'lucide-react';
import type { IntentChip } from '@keyring/types';

const chips: IntentChip[] = [
  { label: 'Collect Rent', icon: 'wallet', domain: 'payments', route: '/payments' },
  { label: 'Review Applicants', icon: 'users', domain: 'screening', route: '/screening' },
  { label: 'Fill Vacancies', icon: 'home', domain: 'leasing', route: '/leasing' },
  { label: 'Fix Risks', icon: 'wrench', domain: 'repairs', route: '/repairs' },
  { label: 'Prepare Renewals', icon: 'refresh', domain: 'renewals', route: '/renewals' },
  { label: 'Close Books', icon: 'book', domain: 'financials', route: '/financials' },
];

const iconMap: Record<string, typeof Wallet> = {
  wallet: Wallet,
  users: Users,
  home: Home,
  wrench: Wrench,
  refresh: RefreshCw,
  alert: AlertTriangle,
  book: BookOpen,
};

export function IntentBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.toLowerCase().trim();
    if (!q) return;

    if (q.includes('rent') || q.includes('payment') || q.includes('collect')) router.push('/payments');
    else if (q.includes('applicant') || q.includes('screen') || q.includes('review')) router.push('/screening');
    else if (q.includes('vacanc') || q.includes('lease') || q.includes('fill')) router.push('/leasing');
    else if (q.includes('repair') || q.includes('mainten') || q.includes('fix')) router.push('/repairs');
    else if (q.includes('renew') || q.includes('expir')) router.push('/renewals');
    else if (q.includes('book') || q.includes('reconcil') || q.includes('financ') || q.includes('close') || q.includes('statement') || q.includes('journal') || q.includes('ledger')) router.push('/financials');

    setQuery('');
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need to do? (e.g. collect rent, review applicants...)"
          className="w-full rounded-xl border bg-muted/50 py-3 pl-12 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:outline-none"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => {
          const Icon = iconMap[chip.icon] || AlertTriangle;
          return (
            <button
              key={chip.label}
              onClick={() => router.push(chip.route)}
              className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/20 hover:bg-muted hover:text-foreground"
            >
              <Icon size={14} />
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
