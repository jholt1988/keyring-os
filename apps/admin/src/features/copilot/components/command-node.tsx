'use client';

import { Command, X } from 'lucide-react';
import { useCommandSurface } from '../state/command-surface';

export function CommandNode() {
  const { radialState, openPrimary, collapse } = useCommandSurface();
  const isOpen = radialState !== 'idle';

  return (
    <button
      type="button"
      aria-label={isOpen ? 'Collapse command surface' : 'Open command surface'}
      onClick={isOpen ? collapse : openPrimary}
      className="command-node fixed bottom-6 right-6 z-50 inline-flex size-16 items-center justify-center rounded-full border border-white/14 bg-[radial-gradient(circle_at_30%_30%,rgba(96,165,250,0.45),rgba(23,48,78,0.95))] text-white shadow-[0_18px_50px_rgba(2,8,23,0.45)] transition-all duration-[180ms] hover:scale-[1.02] hover:border-[#60A5FA]/40 md:bottom-8 md:right-8 md:size-[72px]"
    >
      {isOpen ? <X size={22} /> : <Command size={22} />}
    </button>
  );
}
