import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Play, Square, AlertCircle } from 'lucide-react-native';
import trafficMonitor from '@/services/trafficMonitor';
import { sendPacketLogs } from '@/services/api';
import type { PacketData } from '@/types/traffic';

export default function MonitorScreen() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [packets, setPackets] = useState<PacketData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (isMonitoring) {
      unsubscribe = trafficMonitor.addPacketListener((packet: PacketData) => {
        setPackets((prev) => [packet, ...prev].slice(0, 100));
      });
    }

    return () => {
      unsubscribe?.();
    };
  }, [isMonitoring]);

  const handleStartMonitoring = () => {
    try {
      setError(null);
      trafficMonitor.startVpn();
      setIsMonitoring(true);
      setPackets([]);
    } catch (err) {
      setError('Failed to start monitoring. Make sure native module is installed.');
    }
  };

  const handleStopMonitoring = () => {
    trafficMonitor.stopVpn();
    setIsMonitoring(false);
  };

  const handleSyncToBackend = async () => {
    if (packets.length === 0) {
      setError('No packets to sync');
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      await sendPacketLogs(packets);
      setError(null);
    } catch (err) {
      setError('Failed to sync with backend');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderPacketItem = ({ item }: { item: PacketData }) => (
    <View style={styles.packetItem}>
      <View style={styles.packetHeader}>
        <Text style={styles.packetIp}>{item.destIp}</Text>
        <Text style={styles.packetSize}>{formatBytes(item.size)}</Text>
      </View>
      <Text style={styles.packetSource}>From: {item.sourceIp}</Text>
      <Text style={styles.packetTime}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NetWhisper</Text>
        <Text style={styles.subtitle}>Network Traffic Monitor</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        {!isMonitoring ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartMonitoring}>
            <Play size={24} color="#ffffff" />
            <Text style={styles.buttonText}>Start Monitoring</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopMonitoring}>
            <Square size={24} color="#ffffff" />
            <Text style={styles.buttonText}>Stop Monitoring</Text>
          </TouchableOpacity>
        )}

        {packets.length > 0 && (
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={handleSyncToBackend}
            disabled={isSyncing}>
            {isSyncing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.syncButtonText}>
                Sync {packets.length} Packets
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{packets.length}</Text>
          <Text style={styles.statLabel}>Packets Captured</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {isMonitoring ? 'Active' : 'Idle'}
          </Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Recent Packets</Text>
      </View>

      <FlatList
        data={packets}
        renderItem={renderPacketItem}
        keyExtractor={(item) => `${item.timestamp}-${item.destIp}`}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isMonitoring
                ? 'Waiting for network traffic...'
                : 'Start monitoring to capture packets'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    marginLeft: 8,
    color: '#991b1b',
    fontSize: 14,
    flex: 1,
  },
  controlsContainer: {
    padding: 16,
    gap: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  syncButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  packetItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  packetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packetIp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  packetSize: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  packetSource: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  packetTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
