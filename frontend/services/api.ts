import type { PacketData } from '@/types/traffic';

const API_BASE_URL = 'http://10.0.2.2:8080/api';

export async function sendPacketLogs(packets: PacketData[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packets,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to send packet logs:', error);
    throw error;
  }
}

export async function analyzeTraffic(packets: PacketData[]) {
  return sendPacketLogs(packets);
}
