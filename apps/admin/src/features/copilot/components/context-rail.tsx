'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Activity, Layers3, Sparkles } from 'lucide-react';
import { getOrderedCommandDomains, inferDomainFromPath } from '../config/command-menu';
import { useCommandSurface } from '../state/command-surface';

export function ContextRail() {
  const pathname = usePathname();
  const { radialState, selectedIntent, activeContext } = useCommandSurface();

  const currentDomain = useMemo(() => {
    const domainId = activeContext.domain ?? inferDomainFromPath(pathname);
    return getOrderedCommandDomains(pathname).find((item) => item.id === domainId) ?? null;
  }, [activeContext.domain, pathname]);

  return (
    <div className="sticky top-0 z-30 border-b border-white/8 bg-[#07111F]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#D7E4F4]">
          <Layers3 size={13} className="text-[#60A5FA]" />
          {currentDomain ? `${currentDomain.label} context` : 'System briefing'}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-[#8DA4C5]">
          <Activity size={13} className="text-[#A3B8D7]" />
          Radial state: {radialState}
        </div>
        {selectedIntent && (
          <div className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/8 px-3 py-1.5 text-xs text-[#BFF6FF]">
            <Sparkles size={13} className="text-[#22D3EE]" />
            Executing intent: {selectedIntent}
          </div>
        )}
        {currentDomain?.description && (
          <p className="ml-auto max-w-xl text-xs text-[#6E85A5]">{currentDomain.description}</p>
        )}
      </div>
    </div>
  );
}
