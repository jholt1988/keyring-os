'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ActiveContext, RadialState } from '../types/command';
import type { Domain } from '@keyring/types';

interface CommandSurfaceContextValue {
  radialState: RadialState;
  activeContext: ActiveContext;
  selectedDomain: Domain | null;
  selectedIntent: string | null;
  isPanelVisible: boolean;
  filters: string[];
  openPrimary: () => void;
  openSecondary: (domain: Domain) => void;
  startExecuting: (intent: string) => void;
  setPanelVisible: (visible: boolean) => void;
  setActiveContext: (context: ActiveContext) => void;
  setFilters: (filters: string[]) => void;
  collapse: () => void;
}

const CommandSurfaceContext = createContext<CommandSurfaceContextValue | null>(null);

export function CommandSurfaceProvider({ children }: { children: ReactNode }) {
  const [radialState, setRadialState] = useState<RadialState>('idle');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [isPanelVisible, setPanelVisible] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [activeContext, setActiveContext] = useState<ActiveContext>({ domain: null });

  const value = useMemo<CommandSurfaceContextValue>(() => ({
    radialState,
    activeContext,
    selectedDomain,
    selectedIntent,
    isPanelVisible,
    filters,
    openPrimary: () => {
      setRadialState('primary-open');
      setSelectedIntent(null);
    },
    openSecondary: (domain) => {
      setSelectedDomain(domain);
      setRadialState('secondary-open');
    },
    startExecuting: (intent) => {
      setSelectedIntent(intent);
      setRadialState('executing');
    },
    setPanelVisible,
    setActiveContext,
    setFilters,
    collapse: () => {
      setRadialState('idle');
      setSelectedDomain(null);
      setSelectedIntent(null);
    },
  }), [activeContext, filters, isPanelVisible, radialState, selectedDomain, selectedIntent]);

  return <CommandSurfaceContext.Provider value={value}>{children}</CommandSurfaceContext.Provider>;
}

export function useCommandSurface() {
  const context = useContext(CommandSurfaceContext);
  if (!context) {
    throw new Error('useCommandSurface must be used within CommandSurfaceProvider');
  }
  return context;
}
