import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { getMaintenanceRequests } from '../lib/api';
import type { MaintenanceStackParamList } from '../navigation/RootNavigator';

type Route = RouteProp<MaintenanceStackParamList, 'MaintenanceDetail'>;

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

interface MaintenanceItem {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: string;
  category: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});
  } catch {
    return iso;
  }
}

export default function MaintenanceDetailScreen() {
  const route = useRoute<Route>();
  const { id } = route.params;

  const [request, setRequest] = useState<MaintenanceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      const all = await getMaintenanceRequests();
      const items: MaintenanceItem[] = Array.isArray(all) ? all : [];
      const found = items.find((r) => String(r.id) === id);
      if (found) {
        setRequest(found);
        setError(null);
      } else {
        setError('Request not found');
      }
    } catch {
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDetail();
    }, [fetchDetail]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Request not found'}</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[request.status] ?? '#94A3B8';
  const statusLabel = STATUS_LABELS[request.status] ?? request.status;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{request.title}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Category</Text>
          <Text style={styles.metaValue}>{request.category ?? 'General'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Priority</Text>
          <Text style={styles.metaValue}>{request.priority}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Created</Text>
          <Text style={styles.metaValue}>{formatDate(request.createdAt)}</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {request.description || 'No description provided.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
});
