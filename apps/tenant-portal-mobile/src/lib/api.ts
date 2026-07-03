import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const AUTH_TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor — JWT Bearer via SecureStore
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SecureStore unavailable
  }
  return config;
});

// ── Auth ──
export async function login(username: string, password: string) {
  const { data } = await api.post('/auth/login', { username, password });
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.accessToken);
  return data;
}

export async function logout() {
  await api.post('/auth/logout');
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

export async function getProfile() {
  const { data } = await api.get('/auth/me');
  return data;
}

// ── Lease ──
export async function getCurrentLease() {
  const { data } = await api.get('/leases/my-lease');
  return data;
}

// ── Maintenance ──
export async function getMaintenanceRequests() {
  const { data } = await api.get('/maintenance');
  return data;
}

export async function createMaintenanceRequest(body: Record<string, unknown>) {
  const { data } = await api.post('/maintenance', body);
  return data;
}

// ── Payments ──
export async function getPaymentHistory() {
  const { data } = await api.get('/payments/invoices');
  return data;
}

export async function getPaymentMethods() {
  const { data } = await api.get('/payments/payment-methods');
  return data;
}

export async function getLedger() {
  const { data } = await api.get('/payments/ledger');
  return data;
}

// ── Messaging ──
export async function getConversations() {
  const { data } = await api.get('/messaging/conversations');
  return data;
}

// ── Notifications ──
export async function getNotifications() {
  const { data } = await api.get('/notifications');
  return data;
}

export { api };
