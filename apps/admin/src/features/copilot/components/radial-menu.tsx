'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Home,
  RefreshCw,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { getOrderedCommandDomains } from '../config/command-menu';
import { useCommandSurface } from '../state/command-surface';

const iconMap = {
  wallet: Wallet,
  home: Home,
  users: Users,
  wrench: Wrench,
  refresh: RefreshCw,
  book: BookOpen,
};

function polarStyle(index: number, total: number, radius: number) {
  const start = -110;
  const end = 110;
  const angle = total === 1 ? 0 : start + ((end - start) / (total - 1)) * index;
  const radians = (angle * Math.PI) / 180;
  return {
    transform: `translate(${Math.cos(radians) * radius}px, ${Math.sin(radians) * radius}px)`,
  };
}

export function RadialMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    radialState,
    selectedDomain,
    openSecondary,
    startExecuting,
    collapse,
    setPanelVisible,
    setActiveContext,
  } = useCommandSurface();

  const domains = useMemo(() => getOrderedCommandDomains(pathname).slice(0, 6), [pathname]);
  const activeDomain = domains.find((domain) => domain.id === selectedDomain) ?? domains[0];
  const actions = activeDomain?.actions.slice(0, 5) ?? [];

  useEffect(() => {
    if (radialState !== 'executing') return;
    const timeout = window.setTimeout(() => collapse(), 220);
    return () => window.clearTimeout(timeout);
  }, [collapse, radialState]);

  if (radialState === 'idle') return null;

  return (
    <div className="fixed inset-0 z-40 bg-[#020817]/40 backdrop-blur-[2px]" onClick={collapse}>
      <div className="pointer-events-none absolute bottom-20 right-8 md:bottom-24 md:right-16">
        {radialState === 'primary-open' && domains.map((domain, index) => {
          const Icon = iconMap[domain.icon as keyof typeof iconMap] ?? Wallet;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openSecondary(domain.id);
                setActiveContext({ domain: domain.id });
              }}
              style={polarStyle(index, domains.length, 132)}
              className="pointer-events-auto absolute left-0 top-0 inline-flex size-16 items-center justify-center rounded-full border border-white/12 bg-[#0E1B2F] text-[#F8FAFC] shadow-[0_16px_40px_rgba(2,8,23,0.32)] transition-all duration-[200ms] hover:scale-[1.03]"
            >
              <span className="sr-only">{domain.label}</span>
              <Icon size={18} style={{ color: domain.color }} />
            </button>
          );
        })}

        {radialState !== 'primary-open' && activeDomain && actions.map((action, index) => (
          <button
            key={action.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              startExecuting(action.label);
              setPanelVisible(true);
              router.push(action.route);
            }}
            style={polarStyle(index, actions.length, 156)}
            className="pointer-events-auto absolute left-0 top-0 min-w-[148px] -translate-x-1/2 rounded-full border border-white/12 bg-[#10233D] px-4 py-3 text-left shadow-[0_16px_40px_rgba(2,8,23,0.32)] transition-all duration-[200ms] hover:scale-[1.01]"
          >
            <div className="text-sm font-medium text-[#F8FAFC]">{action.label}</div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-[#8DA4C5]">{action.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
