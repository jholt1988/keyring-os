import { apiRequest } from './api/client';

export async function fetchSmartDevices() { return apiRequest<any>('get', '/api/smart-devices' as any); }
export async function fetchAccessCodes(deviceId?: string) { return apiRequest<any>('get', '/api/smart-devices/access-codes' as any, { query: deviceId ? { deviceId } : undefined }); }
export async function createAccessCode(deviceId: string, body: any) { return apiRequest<any>('post', '/api/smart-devices/access-codes' as any, { body: { deviceId, ...body } }); }
export async function registerSmartDevice(body: any) { return apiRequest<any>('post', '/api/smart-devices/register' as any, { body }); }
