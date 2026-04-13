'use client';

import { FloatingOrb } from './floating-orb';

interface AmbientSignal {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  label: string;
  pulse?: boolean;
}

interface AmbientSignalClusterProps {
  signals: AmbientSignal[];
}

export function AmbientSignalCluster({ signals }: AmbientSignalClusterProps) {
  if (!signals.length) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 z-10 hidden justify-end gap-3 px-6 lg:flex">
      {signals.map((signal) => (
        <FloatingOrb
          key={signal.id}
          severity={signal.severity}
          label={signal.label}
          pulse={signal.pulse}
          className="pointer-events-auto"
        >
          <div className="size-12 rounded-full" />
        </FloatingOrb>
      ))}
    </div>
  );
}

export default AmbientSignalCluster;
