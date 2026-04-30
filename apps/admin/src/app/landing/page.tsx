'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, Zap } from 'lucide-react';

const briefingSignals = [
  'What changed overnight',
  'Which decisions need approval',
  'What can safely wait',
];

const operatingPrinciples = [
  {
    icon: Clock3,
    label: 'Brief first',
    copy: 'Start with the few decisions that change today, not another dashboard grid.',
  },
  {
    icon: CheckCircle2,
    label: 'Act from context',
    copy: 'Each item carries the why, the risk, and the next safe action.',
  },
  {
    icon: ShieldCheck,
    label: 'Leave cleanly',
    copy: 'Resolve, dismiss, or delegate in seconds — then get out of the software.',
  },
];

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#07111F] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#07111F_0%,#0a1628_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div className="max-w-3xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-sm text-sky-100">
            <Zap className="h-4 w-4 text-sky-300" />
            KeyringOS briefing surface
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.04em] text-white md:text-7xl">
            Run the portfolio from the decisions that matter.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            KeyringOS opens on a briefing — the overnight signals, risk calls, and next actions your team should handle before anything else.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-300 px-6 py-3 font-semibold text-slate-950 shadow-[0_20px_80px_rgba(56,189,248,0.22)] transition hover:bg-sky-200"
            >
              Open today’s briefing
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Daily Briefing</p>
                <h2 className="mt-2 text-2xl font-semibold">3 decisions before 9 AM</h2>
              </div>
              <div className="rounded-2xl bg-emerald-400/10 px-3 py-2 text-sm font-medium text-emerald-300">
                Live
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {briefingSignals.map((signal, index) => (
                <div key={signal} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-300/10 text-sm font-semibold text-sky-200">
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-100">{signal}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3">
              {operatingPrinciples.map(({ icon: Icon, label, copy }) => (
                <div key={label} className="flex gap-4 rounded-2xl bg-slate-900/80 p-4">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-sky-300" />
                  <div>
                    <h3 className="font-semibold text-white">{label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
