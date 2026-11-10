'use client';

import React, { useContext, useMemo, useState } from 'react';
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

const CommandSurfaceContext = React.createContext<CommandSurfaceContextValue | null>(null);

export function CommandSurfaceProvider({ children }: { children: any }) {
  const [radialState, setRadialState] = useState('idle' as RadialState);
  const [selectedDomain, setSelectedDomain] = useState(null as Domain | null);
  const [selectedIntent, setSelectedIntent] = useState(null as string | null);
  const [isPanelVisible, setPanelVisible] = useState(false);
  const [filters, setFilters] = useState([] as string[]);
  const [activeContext, setActiveContext] = useState({ domain: null } as ActiveContext);

  const value: CommandSurfaceContextValue = useMemo(() => ({
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
    openSecondary: (domain: Domain) => {
      setSelectedDomain(domain);
      setRadialState('secondary-open');
    },
    startExecuting: (intent: string) => {
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

export function useCommandSurface(): CommandSurfaceContextValue {
  const context = useContext(CommandSurfaceContext);
  if (!context) {
    throw new Error('useCommandSurface must be used within CommandSurfaceProvider');
  }
  return context;
}
