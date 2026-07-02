# keyring-os Tenant Portal Mobile — Scaffold

> Run these commands in the keyring-os monorepo root after `pnpm install`.

## Prerequisites

```bash
cd /teamspace/studios/this_studio/repo-review/keyring-os
pnpm install
```

## Step 1: Create the Expo app

```bash
cd apps
npx create-expo-app tenant-portal-mobile --template blank-typescript
cd tenant-portal-mobile
```

## Step 2: Add keyring shared deps

Edit `apps/tenant-portal-mobile/package.json` — add these dependencies:

```json
{
  "dependencies": {
    "@keyring/types": "workspace:*",
    "@tanstack/react-query": "^5.96.2",
    "axios": "^1.13.2",
    "expo-secure-store": "~15.0.8",
    "expo-linking": "~8.0.11",
    "expo-notifications": "~0.32.16",
    "@react-navigation/native": "^7.1.20",
    "@react-navigation/native-stack": "^7.6.3",
    "@react-navigation/bottom-tabs": "^7.8.5",
    "react-native-screens": "~4.16.0",
    "react-native-safe-area-context": "^5.6.2",
    "react-native-paper": "^5.14.5",
    "react-native-reanimated": "~4.1.5",
    "react-native-gesture-handler": "~2.28.0"
  }
}
```

Then run `pnpm install` from the monorepo root.

## Step 3: Add to turbo.json

Add this task to `turbo.json`:

```json
{
  "tasks": {
    "tenant-portal-mobile#build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "tenant-portal-mobile#lint": {},
    "tenant-portal-mobile#typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

## Step 4: Create API client

Create `apps/tenant-portal-mobile/src/lib/api.ts`:

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import type { TenantFeedResponse } from '@keyring/types';

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

// ── Feed ──
export async function fetchTenantFeed(): Promise<TenantFeedResponse> {
  const { data } = await api.get('/tenant/feed');
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

// ── Messaging ──
export async function getConversations() {
  const { data } = await api.get('/messaging/conversations');
  return data;
}

export { api };
```

## Step 5: Create navigation shell

Create `apps/tenant-portal-mobile/src/navigation/RootNavigator.tsx`:

```tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import FeedScreen from '../screens/FeedScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import LeaseScreen from '../screens/LeaseScreen';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Maintenance" component={MaintenanceScreen} />
        <Tab.Screen name="Payments" component={PaymentsScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Lease" component={LeaseScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

## Step 6: Create first screen (Feed)

Create `apps/tenant-portal-mobile/src/screens/FeedScreen.tsx`:

```tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchTenantFeed } from '../lib/api';
import type { TenantFeedItem } from '@keyring/types';

export default function FeedScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-feed'],
    queryFn: fetchTenantFeed,
    refetchInterval: 30_000,
  });

  if (isLoading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Failed to load feed</Text>;

  return (
    <FlatList
      data={data?.items ?? []}
      keyExtractor={(item: TenantFeedItem) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: '600' }}>{item.title}</Text>
          <Text style={{ color: '#666' }}>{item.summary}</Text>
        </View>
      )}
    />
  );
}
```

## Step 7: Run

```bash
cd /teamspace/studios/this_studio/repo-review/keyring-os
pnpm install
cd apps/tenant-portal-mobile
npx expo start
```

## Next steps after scaffold

1. Port remaining screens from tenant_portal_mobile (30+ screens)
2. Add push notification support (expo-notifications)
3. Add biometric auth (expo-local-authentication)
4. Wire up E2E tests with Detox or Maestro
5. Build for App Store / Play Store via EAS

## Decision record

Per ADR-002 (tenant-mobile-strategy.md), we're sunsetting the standalone
tenant_portal_mobile and migrating its features into this keyring-os monorepo
app. The shared `@keyring/types` package provides the DTO contract.
