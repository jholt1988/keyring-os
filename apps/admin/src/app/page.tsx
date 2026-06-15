'use client';

import { useOperatorData, CommandCenterView } from '@/features/operator';

export default function BriefingPage() {
  const { data, totals, loaded, token, refresh } = useOperatorData();
  return <CommandCenterView data={data} totals={totals} loaded={loaded} token={token} onRefresh={refresh} />;
}
