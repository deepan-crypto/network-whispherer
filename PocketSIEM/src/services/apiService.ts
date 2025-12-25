import API_CONFIG from '../config/api';

interface TrafficLog {
  destinationIp: string;
  packetSize: number;
  timestamp: string;
}

interface AnalysisResponse {
  riskScore: string;
  explanation: string;
}

export const apiService = {
  async healthCheck(): Promise<string> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: API_CONFIG.TIMEOUT,
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    return response.text();
  },

  async analyzeTraffic(trafficLog: TrafficLog): Promise<AnalysisResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trafficLog),
      timeout: API_CONFIG.TIMEOUT,
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    return response.json();
  },
};

export default apiService;
