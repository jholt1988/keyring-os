'use client';

import { useOperatorData, PortfolioView } from '@/features/operator';

export default function PortfolioPage() {
  const { data, totals, loaded, token, refresh } = useOperatorData();
  return <PortfolioView data={data} totals={totals} loaded={loaded} token={token} onRefresh={refresh} />;
}
