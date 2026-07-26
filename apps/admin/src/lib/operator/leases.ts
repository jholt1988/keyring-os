import { apiRequest } from '@/lib/operator/api/client';

export async function recordTenantNotice(leaseIdOrBody: any, dto?: any) {
  if (typeof leaseIdOrBody === 'string') {
    return apiRequest<any>('post', (`/api/leases/${leaseIdOrBody}/notices` as unknown) as any, { body: dto });
  }
  return apiRequest<any>('post', '/api/leases/notices' as any, { body: leaseIdOrBody });
}

export async function createLease(body: any) {
  return apiRequest<any>('post', '/api/leases' as any, { body });
}
