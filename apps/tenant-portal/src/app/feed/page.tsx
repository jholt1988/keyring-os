'use client';

import { TenantHeader } from '@/components/shell/tenant-header';
import { TenantFeedList } from '@/components/feed/tenant-feed-list';
import { useTenantFeed } from '@/hooks/useTenantFeed';

export default function FeedPage() {
  const {
    items,
    isLoading,
    isError,
    dismiss,
    refetch,
    showDismissed,
    setShowDismissed,
    dismissedCount,
    usingFallback,
  } = useTenantFeed();

  return (
    <>
      <TenantHeader title="My Feed" />
      <div className="p-6">
        <TenantFeedList
          items={items}
          isLoading={isLoading}
          isError={isError}
          onDismiss={dismiss}
          onRefetch={refetch}
          showDismissed={showDismissed}
          onToggleDismissed={setShowDismissed}
          dismissedCount={dismissedCount}
          usingFallback={usingFallback}
        />
      </div>
    </>
  );
}
