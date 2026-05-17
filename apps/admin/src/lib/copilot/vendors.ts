import { api } from './core';

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
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  return `${base}/vendors/1099-export`;
}

export const vendorsApi = {
  fetchVendors,
  createVendor,
  getVendors1099ExportUrl,
};
