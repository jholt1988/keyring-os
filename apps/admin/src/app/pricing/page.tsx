"use client";

import Link from "next/link";
import { useState } from "react";
import {
  COMPARISON_ROWS,
  INCLUDED_ON_EVERY_TIER,
  formatUsdFromCents,
  parseDoorCount,
  quoteDoors,
  type TierPrice,
} from "./prices";

function tierPriceLabel(tier: TierPrice): string {
  return tier.monthlyCents === null ? "No price" : formatUsdFromCents(tier.monthlyCents);
}

export default function PricingPage() {
  const [rawDoors, setRawDoors] = useState("");
  const doors = parseDoorCount(rawDoors);
  const quote = doors === null ? null : quoteDoors(doors);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111F] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#07111F_0%,#0a1628_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 lg:px-10">
        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-6 inline-flex items-center rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-sm font-medium text-sky-100">
              Proposed
            </p>
            <h1 className="text-balance text-5xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
              Pricing by door count.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Proposed monthly prices for Keyring. Landlord is the small-portfolio plan. Operator is the recommended plan above 15 doors. Portfolio AI is a feature tier, not a volume discount.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-sky-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-200"
            >
              Create an account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </header>

        <section
          aria-labelledby="calculator-heading"
          data-testid="calculator"
          className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="calculator-heading" className="text-2xl font-semibold">
                Door-count calculator
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Enter a whole number of doors from 1 to 300. Outside that range, this calculator shows no price.
              </p>
            </div>
            <label className="block text-sm font-medium text-slate-200">
              Door count
              <input
                inputMode="numeric"
                value={rawDoors}
                onChange={(event) => setRawDoors(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-lg text-white outline-none ring-sky-300/40 focus:ring-2 md:w-40"
              />
            </label>
          </div>

          {quote === null ? (
            <p className="mt-8 text-lg text-slate-300" data-testid="calculator-empty">
              No price
            </p>
          ) : (
            <>
              <p className="mt-8 text-sm uppercase tracking-[0.18em] text-sky-300">
                Recommended{" "}
                <span data-testid="recommended-price" className="text-white">
                  {formatUsdFromCents(quote.recommended.monthlyCents!)}
                </span>
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {quote.tiers.map((tier) => (
                  <article
                    key={tier.id}
                    data-testid={`tier-${tier.id}`}
                    className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold">{tier.name}</h3>
                      {tier.recommended ? (
                        <span className="rounded-full bg-sky-300/15 px-3 py-1 text-xs font-medium text-sky-200">
                          Recommended
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight" data-testid={`tier-${tier.id}-price`}>
                      {tierPriceLabel(tier)}
                    </p>
                    {tier.monthlyCents !== null ? (
                      <p className="mt-1 text-sm text-slate-400">per month</p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-400">Unavailable above 15 doors</p>
                    )}
                    {tier.annualCents !== null ? (
                      <p className="mt-4 text-sm text-slate-300" data-testid={`tier-${tier.id}-annual`}>
                        {formatUsdFromCents(tier.annualCents)} per year
                      </p>
                    ) : null}
                    {tier.id === "portfolio" ? (
                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        Shown, not selected. Portfolio AI is a feature tier, not a cheaper volume tier.
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold">Included on every tier</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {INCLUDED_ON_EVERY_TIER.map((item) => (
              <li key={item} className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-200">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-xl font-semibold">
            Copied comparison
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Competitor cells are copied from the source table. They are not recalculated from a per-door rate.
          </p>
          <div className="mt-4 overflow-x-auto rounded-[1.5rem] border border-white/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-white/[0.04] text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Doors</th>
                  <th className="px-4 py-3 font-medium">Keyring</th>
                  <th className="px-4 py-3 font-medium">Buildium</th>
                  <th className="px-4 py-3 font-medium">DoorLoop</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.doors} data-testid={`comparison-${row.doors}`} className="border-t border-white/10">
                    <th className="px-4 py-4 font-medium text-slate-200">{row.doors} doors</th>
                    <td className="px-4 py-4" data-testid={`comparison-${row.doors}-keyring`}>
                      {row.keyring}
                    </td>
                    <td className="px-4 py-4" data-testid={`comparison-${row.doors}-buildium`}>
                      {row.buildium}
                    </td>
                    <td className="px-4 py-4" data-testid={`comparison-${row.doors}-doorloop`}>
                      {row.doorloop}
                      {row.doorloopNote ? <span className="mt-1 block text-slate-400">{row.doorloopNote}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
