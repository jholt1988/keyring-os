import { KeyRound, Mail, Smartphone } from 'lucide-react';

const authOptions = [
  {
    title: 'Continue with password',
    description: 'Use your existing email and password to resume your session.',
    icon: KeyRound,
    accent: 'border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#BFDBFE]',
  },
  {
    title: 'Send magic link',
    description: 'Receive a one-time sign-in link when you need a lower-friction handoff.',
    icon: Mail,
    accent: 'border-[#14B8A6]/30 bg-[#14B8A6]/10 text-[#99F6E4]',
  },
  {
    title: 'Use device sign-in',
    description: 'Keep future biometric and trusted-device sign-in visible without enabling it yet.',
    icon: Smartphone,
    accent: 'border-[#A78BFA]/30 bg-[#A78BFA]/10 text-[#DDD6FE]',
  },
] as const;

export function AuthDecisionSurface() {
  return (
    <aside className="pointer-events-none fixed right-6 top-6 z-30 hidden w-full max-w-sm xl:block">
      <div className="glass-panel rounded-[24px] border border-white/10 p-5 text-[#F8FAFC] shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#60A5FA]">
              Auth decision surface
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">Choose how tenants sign in</h2>
          </div>
          <span className="rounded-full border border-[#1E3350] bg-[#0F1B31]/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#94A3B8]">
            Preview
          </span>
        </div>

        <p className="text-sm leading-6 text-[#94A3B8]">
          Presentational only for now, mounted behind a layout guard so current sessions stay uninterrupted.
        </p>

        <div className="mt-4 space-y-3">
          {authOptions.map(({ title, description, icon: Icon, accent }) => (
            <div
              key={title}
              className="rounded-[20px] border border-[#1E3350] bg-[#0F1B31]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <div className="flex items-start gap-3">
                <div className={`inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border ${accent}`}>
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#94A3B8]">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default AuthDecisionSurface;
