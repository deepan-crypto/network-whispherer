import { NativeModules, NativeEventEmitter, DeviceEventEmitter, Platform } from 'react-native';
import type { PacketData } from '@/types/traffic';

const { TrafficMonitor } = NativeModules;

class TrafficMonitorService {
  private eventEmitter: any;
  private listeners: ((packet: PacketData) => void)[] = [];

  constructor() {
    if (Platform.OS === 'android') {
      this.eventEmitter = DeviceEventEmitter;
    }
  }

  startVpn() {
    if (TrafficMonitor) {
      TrafficMonitor.startVpn();
    } else {
      console.warn('TrafficMonitor native module not available. Export project to add native code.');
    }
  }

  stopVpn() {
    if (TrafficMonitor) {
      TrafficMonitor.stopVpn();
    }
  }

  addPacketListener(callback: (packet: PacketData) => void) {
    this.listeners.push(callback);

    const subscription = this.eventEmitter?.addListener(
      'PacketCaptured',
      (packet: PacketData) => {
        callback(packet);
      }
    );

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
      subscription?.remove();
    };
  }
}

export default new TrafficMonitorService();
