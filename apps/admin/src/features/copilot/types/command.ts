import type { Domain } from '@keyring/types';

export type RadialState = 'idle' | 'primary-open' | 'secondary-open' | 'executing';

export interface CommandAction {
  id: string;
  label: string;
  route: string;
  hint: string;
}

export interface CommandDomain {
  id: Domain;
  label: string;
  shortLabel: string;
  description: string;
  route: string;
  color: string;
  icon: string;
  actions: CommandAction[];
}

export interface ActiveContext {
  domain: Domain | null;
  entityLabel?: string;
  entityId?: string;
}

export interface CommandSurfaceState {
  radialState: RadialState;
  activeContext: ActiveContext;
  selectedDomain: Domain | null;
  selectedIntent: string | null;
  isPanelVisible: boolean;
  filters: string[];
}
