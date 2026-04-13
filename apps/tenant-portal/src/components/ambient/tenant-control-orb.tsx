'use client';

interface TenantControlOrbProps {
  state: 'healthy' | 'attention' | 'overdue' | 'lease_expiring' | 'maintenance_open';
  label: string;
}

function stateClasses(state: TenantControlOrbProps['state']) {
  switch (state) {
    case 'overdue':
      return 'border-[#F43F5E]/40 shadow-[0_18px_50px_rgba(244,63,94,0.22)]';
    case 'attention':
    case 'lease_expiring':
      return 'border-[#F59E0B]/40 shadow-[0_18px_50px_rgba(245,158,11,0.22)]';
    case 'maintenance_open':
      return 'border-[#60A5FA]/40 shadow-[0_18px_50px_rgba(96,165,250,0.22)]';
    case 'healthy':
    default:
      return 'border-[#10B981]/35 shadow-[0_18px_50px_rgba(16,185,129,0.18)]';
  }
}

export function TenantControlOrb({ state, label }: TenantControlOrbProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden flex-col items-center gap-2 md:flex">
      <div
        className={`inline-flex size-14 items-center justify-center rounded-full border bg-[radial-gradient(circle_at_30%_30%,rgba(96,165,250,0.45),rgba(15,27,49,0.95))] backdrop-blur-md ${stateClasses(state)}`}
        aria-hidden="true"
      >
        <div className="size-6 rounded-full bg-white/20" />
      </div>
      <span className="max-w-28 text-center text-[11px] font-medium text-[#D9E8FF]">{label}</span>
    </div>
  );
}

export default TenantControlOrb;
