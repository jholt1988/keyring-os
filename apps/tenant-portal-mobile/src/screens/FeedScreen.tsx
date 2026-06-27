import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getCurrentLease,
  getMaintenanceRequests,
  getPaymentHistory,
  getNotifications,
} from '../lib/api';

type FeedCard = {
  id: string;
  domain: 'lease' | 'maintenance' | 'payment' | 'notification';
  title: string;
  summary: string;
  priority: number;
};

const DOMAIN_COLORS: Record<FeedCard['domain'], string> = {
  lease: '#3B82F6',
  maintenance: '#F59E0B',
  payment: '#EF4444',
  notification: '#10B981',
};

const DOMAIN_LABELS: Record<FeedCard['domain'], string> = {
  lease: 'Lease',
  maintenance: 'Maintenance',
  payment: 'Payment',
  notification: 'Notification',
};

function buildCards(
  lease: unknown,
  maintenance: unknown[],
  payments: unknown[],
  notifications: unknown[],
): FeedCard[] {
  const cards: FeedCard[] = [];

  if (lease) {
    const l = lease as Record<string, unknown>;
    cards.push({
      id: 'lease-current',
      domain: 'lease',
      title: `Unit ${l.unitNumber ?? '—'}`,
      summary: `Status: ${l.status ?? '—'} · Rent: $${l.rentAmount ?? '—'}`,
      priority: 90,
    });
  }

  if (Array.isArray(maintenance)) {
    for (const m of maintenance as Array<Record<string, unknown>>) {
      cards.push({
        id: `maint-${m.id}`,
        domain: 'maintenance',
        title: (m.title as string) ?? 'Maintenance Request',
        summary: (m.description as string)?.slice(0, 80) ?? '',
        priority: 80,
      });
    }
  }

  if (Array.isArray(payments)) {
    for (const p of payments as Array<Record<string, unknown>>) {
      cards.push({
        id: `pay-${p.id}`,
        domain: 'payment',
        title: `Invoice — $${p.amount ?? '—'}`,
        summary: `Status: ${p.status ?? '—'} · Due: ${(p.dueDate as string) ?? '—'}`,
        priority: 70,
      });
    }
  }

  if (Array.isArray(notifications)) {
    for (const n of notifications as Array<Record<string, unknown>>) {
      cards.push({
        id: `notif-${n.id}`,
        domain: 'notification',
        title: (n.title as string) ?? 'Notification',
        summary: (n.message as string)?.slice(0, 80) ?? '',
        priority: 60,
      });
    }
  }

  // Sort by priority descending
  cards.sort((a, b) => b.priority - a.priority);
  return cards;
}

export default function FeedScreen() {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        getCurrentLease(),
        getMaintenanceRequests(),
        getPaymentHistory(),
        getNotifications(),
      ]);

      const lease = results[0].status === 'fulfilled' ? results[0].value : null;
      const maintenance = results[1].status === 'fulfilled' ? (results[1].value ?? []) : [];
      const payments = results[2].status === 'fulfilled' ? (results[2].value ?? []) : [];
      const notifications = results[3].status === 'fulfilled' ? (results[3].value ?? []) : [];

      setCards(buildCards(lease, maintenance, payments, notifications));
      setError(null);
    } catch (e) {
      setError('Failed to load feed data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAll();
    }, [fetchAll]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, [fetchAll]);

  if (loading && cards.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading feed…</Text>
      </View>
    );
  }

  if (error && cards.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchAll} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cards.length === 0 && !loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No items in your feed yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={cards}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {/* Domain color bar */}
          <View
            style={[
              styles.colorBar,
              { backgroundColor: DOMAIN_COLORS[item.domain] },
            ]}
          />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.domainBadge,
                  { backgroundColor: DOMAIN_COLORS[item.domain] },
                ]}
              >
                <Text style={styles.domainBadgeText}>
                  {DOMAIN_LABELS[item.domain]}
                </Text>
              </View>
              <Text style={styles.priority}>P: {item.priority}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.summary ? (
              <Text style={styles.cardSummary}>{item.summary}</Text>
            ) : null}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  colorBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  domainBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  priority: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardSummary: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
