'use client';

/**
 * BriefingContext
 * Shares live briefing data and the "selected decision for ContextPanel"
 * across the AppShell without prop-drilling through every page component.
 */

import type { Decision, Signal } from '@keyring/types';
import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useBriefing } from '@/app/hooks/useBriefing';

interface BriefingContextValue {
  signals: Signal[];
  selectedDecision: Decision | null;
  selectDecision: (d: Decision | null) => void;
  panelOpen: boolean;
  openPanel: (d?: Decision) => void;
  closePanel: () => void;
  isLoading: boolean;
}

const BriefingContext = createContext<BriefingContextValue | null>(null);

export function BriefingProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useBriefing();
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const selectDecision = useCallback((d: Decision | null) => {
    setSelectedDecision(d);
  }, []);

  const openPanel = useCallback((d?: Decision) => {
    if (d) setSelectedDecision(d);
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  // Derive ambient signals: top 4 by severity, deduplicated
  const signals: Signal[] = data?.signals?.slice(0, 4) ?? [];

  return (
    <BriefingContext.Provider
      value={{ signals, selectedDecision, selectDecision, panelOpen, openPanel, closePanel, isLoading }}
    >
      {children}
    </BriefingContext.Provider>
  );
}

export function useBriefingContext() {
  const ctx = useContext(BriefingContext);
  if (!ctx) throw new Error('useBriefingContext must be used inside <BriefingProvider>');
  return ctx;
}
