'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Wallet, Users, Home, Wrench, RefreshCw, AlertTriangle, BookOpen, Building2, Settings } from 'lucide-react';
import type { IntentChip } from '@keyring/types';

const chips: IntentChip[] = [
  { label: 'Manage Portfolio', icon: 'building', domain: 'portfolio', route: '/portfolio' },
  { label: 'Collect Rent', icon: 'wallet', domain: 'payments', route: '/payments' },
  { label: 'Review Applicants', icon: 'users', domain: 'screening', route: '/screening' },
  { label: 'Fill Vacancies', icon: 'home', domain: 'leasing', route: '/leasing' },
  { label: 'Fix Risks', icon: 'wrench', domain: 'repairs', route: '/repairs' },
  { label: 'Prepare Renewals', icon: 'refresh', domain: 'renewals', route: '/renewals' },
  { label: 'Close Books', icon: 'book', domain: 'financials', route: '/financials' },
  { label: 'Manage Workflows', icon: 'settings', domain: 'workflows', route: '/workflows' },
];

const iconMap: Record<string, typeof Wallet> = {
  building: Building2,
  wallet: Wallet,
  users: Users,
  home: Home,
  wrench: Wrench,
  refresh: RefreshCw,
  alert: AlertTriangle,
  book: BookOpen,
  settings: Settings,
};

const moduleColor: Record<string, string> = {
  portfolio: '#3B82F6',
  payments: '#10B981',
  screening: '#F59E0B',
  leasing: '#8B5CF6',
  repairs: '#14B8A6',
  renewals: '#60A5FA',
  financials: '#22C55E',
  workflows: '#22D3EE',
};

export function IntentBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.toLowerCase().trim();
    if (!q) return;

    if (q.includes('portfolio') || q.includes('propert') || q.includes('manage')) router.push('/portfolio');
    else if (q.includes('rent') || q.includes('payment') || q.includes('collect')) router.push('/payments');
    else if (q.includes('applicant') || q.includes('screen') || q.includes('review')) router.push('/screening');
    else if (q.includes('vacanc') || q.includes('lease') || q.includes('fill')) router.push('/leasing');
    else if (q.includes('repair') || q.includes('mainten') || q.includes('fix')) router.push('/repairs');
    else if (q.includes('renew') || q.includes('expir')) router.push('/renewals');
    else if (q.includes('book') || q.includes('reconcil') || q.includes('financ') || q.includes('close') || q.includes('statement') || q.includes('journal') || q.includes('ledger')) router.push('/financials');
    else if (q.includes('workflow') || q.includes('ai') || q.includes('automat')) router.push('/workflows');

    setQuery('');
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need to do? (e.g. collect rent, review applicants...)"
          className="w-full rounded-[18px] border border-[#1E3350] bg-[#0F1B31] py-3.5 pl-12 pr-4 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] transition-all duration-[180ms] focus:border-[#60A5FA] focus:bg-[#13233C] focus:outline-none focus:ring-1 focus:ring-[#60A5FA]/30"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => {
          const Icon = iconMap[chip.icon] || AlertTriangle;
          const color = moduleColor[chip.domain] || '#3B82F6';
          return (
            <button
              key={chip.label}
              onClick={() => router.push(chip.route)}
              className="group inline-flex items-center gap-2 rounded-full border border-[#1E3350] bg-[#0F1B31] px-3.5 py-2 text-xs font-medium text-[#94A3B8] transition-all duration-[180ms] hover:border-[#2B4A73] hover:bg-[#17304E] hover:text-[#F8FAFC]"
            >
              <Icon size={14} style={{ color }} />
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
