import { api } from './core';
import { API_V2_BASE } from '../api-client';

export async function fetchVendors() {
  return api('/vendors');
}

export async function createVendor(data: Record<string, unknown>) {
  return api('/vendors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getVendors1099ExportUrl() {
  // Route through the /api/v2 proxy so the httpOnly auth cookie is forwarded.
  return `${API_V2_BASE}/vendors/1099-export`;
}

export const vendorsApi = {
  fetchVendors,
  createVendor,
  getVendors1099ExportUrl,
};
