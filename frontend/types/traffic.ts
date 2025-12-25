export interface PacketData {
  sourceIp: string;
  destIp: string;
  size: number;
  timestamp: number;
}

export interface TrafficLog {
  id: string;
  packets: PacketData[];
  startTime: number;
  endTime?: number;
}
