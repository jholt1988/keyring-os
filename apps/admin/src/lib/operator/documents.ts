import { apiRequest } from '@/lib/operator/api/client';

export async function fetchDocuments(params?: { propertyId?: string; leaseId?: string; category?: string }) {
  return apiRequest<any[]>('get', '/api/documents', { query: params as any });
}

export async function uploadDocument(formData: FormData) {
  // upload must send raw FormData without JSON header
  const res = await fetch('/api/backend/documents/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export function getDocumentDownloadUrl(id: number) {
  return `/api/backend/documents/${id}/download`;
}
