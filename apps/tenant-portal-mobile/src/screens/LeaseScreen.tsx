import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentLease } from '../lib/api';

interface Lease {
  unitNumber: string;
  status: string;
  rentAmount: number;
  deposit: number;
  startDate: string;
  endDate: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function LeaseScreen() {
  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLease = useCallback(async () => {
    try {
      const data = await getCurrentLease();
      setLease(data);
      setError(null);
    } catch {
      setError('Failed to load lease information');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchLease();
    }, [fetchLease]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading lease…</Text>
      </View>
    );
  }

  if (error || !lease) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'No lease found'}</Text>
        <TouchableOpacity onPress={fetchLease} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Unit header */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Your Unit</Text>
        <Text style={styles.heroValue}>{lease.unitNumber}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                lease.status === 'ACTIVE' ? '#10B981' : '#EF4444',
            },
          ]}
        >
          <Text style={styles.statusText}>{lease.status}</Text>
        </View>
      </View>

      {/* Financials */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financials</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Monthly Rent</Text>
            <Text style={styles.cardValue}>
              ${Number(lease.rentAmount).toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Security Deposit</Text>
            <Text style={styles.cardValue}>
              ${Number(lease.deposit).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lease Term</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Start Date</Text>
            <Text style={styles.cardValue}>{formatDate(lease.startDate)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>End Date</Text>
            <Text style={styles.cardValue}>{formatDate(lease.endDate)}</Text>
          </View>
        </View>
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
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
});
