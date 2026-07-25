import { apiRequest } from './api/client';

export async function startMoveIn(data: any) { return apiRequest<any>('post', '/api/moves/start-in' as any, { body: data }); }
export async function startMoveOut(data: any) { return apiRequest<any>('post', '/api/moves/start-out' as any, { body: data }); }
