// app/actions/feed-actions.ts
"use server";

export interface FeedResponse { success: boolean; message?: string }

export async function executeFeedAction(intent: string, itemId: string): Promise<FeedResponse> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error('BACKEND_URL is not set.');

  // Assuming v2 to match our previous materialized view architecture
  const res = await fetch(`${base}/api/v2/feed/${itemId}/action`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'X-Mock-User-Id': 'dev-admin-uuid-001',
        'X-Mock-Role': 'admin',
    
    },
    body: JSON.stringify({ intent }),
  });

  if (!res.ok) throw new Error(`Feed API responded ${res.status}`);
  return res.json();
}