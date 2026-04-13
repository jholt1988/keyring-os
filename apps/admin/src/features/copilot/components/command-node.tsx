'use client';

import { Command, X } from 'lucide-react';
import { FloatingOrb } from './floating-orb';
import { useCommandSurface } from '../state/command-surface';

export function CommandNode() {
  const { radialState, openPrimary, collapse } = useCommandSurface();
  const isOpen = radialState !== 'idle';

  return (
    <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
      <FloatingOrb
        severity={isOpen ? 'high' : 'medium'}
        label={isOpen ? 'Command surface open' : 'Command surface'}
        pulse={!isOpen}
      >
        <button
          type="button"
          aria-label={isOpen ? 'Collapse command surface' : 'Open command surface'}
          onClick={isOpen ? collapse : openPrimary}
          className="command-node inline-flex size-16 items-center justify-center rounded-full text-white transition-all duration-[180ms] hover:scale-[1.02] md:size-[72px]"
        >
          {isOpen ? <X size={22} /> : <Command size={22} />}
        </button>
      </FloatingOrb>
    </div>
  );
}
