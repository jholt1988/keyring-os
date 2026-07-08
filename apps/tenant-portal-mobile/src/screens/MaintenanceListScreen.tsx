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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getMaintenanceRequests } from '../lib/api';
import type { MaintenanceStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<MaintenanceStackParamList, 'MaintenanceList'>;

type Status = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | string;

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#F59E0B',
  IN_PROGRESS: '#3B82F6',
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

interface MaintenanceItem {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: string;
  category: string;
  createdAt: string;
}

export default function MaintenanceListScreen() {
  const navigation = useNavigation<Nav>();
  const [requests, setRequests] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await getMaintenanceRequests();
      setRequests(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError('Failed to load maintenance requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchRequests();
    }, [fetchRequests]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  if (loading && requests.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading requests…</Text>
      </View>
    );
  }

  if (error && requests.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchRequests} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (requests.length === 0 && !loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No maintenance requests yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const statusColor = STATUS_COLORS[item.status] ?? '#94A3B8';
        const statusLabel = STATUS_LABELS[item.status] ?? item.status;

        return (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('MaintenanceDetail', { id: item.id })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={[styles.badge, { backgroundColor: statusColor }]}>
                <Text style={styles.badgeText}>{statusLabel}</Text>
              </View>
            </View>
            {item.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.meta}>
              <Text style={styles.metaText}>
                {item.category ?? 'General'} · Priority: {item.priority}
              </Text>
              <Text style={styles.metaText}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
