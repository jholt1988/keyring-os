'use client';

import { useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { commandDomains, getOrderedCommandDomains } from '../config/command-menu';
import { useCommandSurface } from '../state/command-surface';

export function CommandComposer() {
  const pathname = usePathname();
  const router = useRouter();
  const { setActiveContext, startExecuting, setPanelVisible } = useCommandSurface();
  const [query, setQuery] = useState('');

  const intents = useMemo(() => getOrderedCommandDomains(pathname).flatMap((domain) => [
    { label: domain.label, route: domain.route, domain: domain.id },
    ...domain.actions.map((action) => ({ label: action.label, route: action.route, domain: domain.id })),
  ]), [pathname]);

  const submit = (value: string) => {
    const normalized = value.toLowerCase().trim();
    if (!normalized) return;

    const match = intents.find((intent) => intent.label.toLowerCase().includes(normalized))
      ?? commandDomains.find((domain) => domain.description.toLowerCase().includes(normalized));

    if (!match) return;

    startExecuting(match.label);
    setPanelVisible(true);
    setActiveContext({ domain: 'domain' in match ? match.domain : match.id });
    router.push(match.route);
    setQuery('');
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(query);
      }}
      className="relative"
    >
      <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6E85A5]" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="What needs to happen now?"
        className="h-12 w-full rounded-full border border-white/10 bg-white/[0.04] pl-11 pr-28 text-sm text-[#F8FAFC] placeholder:text-[#6E85A5] outline-none transition-all duration-[180ms] focus:border-[#60A5FA]/60 focus:bg-white/[0.06]"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1.5 inline-flex h-9 items-center gap-1 rounded-full border border-white/10 bg-[#17304E] px-3 text-xs font-medium text-[#D9E8FF] transition-all duration-[180ms] hover:border-[#60A5FA]/40 hover:bg-[#20436A]"
      >
        <Sparkles size={14} />
        Execute
      </button>
    </form>
  );
}
