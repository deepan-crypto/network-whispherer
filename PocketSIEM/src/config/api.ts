import { Platform } from 'react-native';

// For physical devices: Use your computer's IP address
// For Android emulator: Use 10.0.2.2
// For iOS simulator: Use localhost

const getBaseUrl = (): string => {
  if (__DEV__) {
    // Android emulator uses 10.0.2.2 to reach host machine
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080/api';
    }
    // iOS simulator can use localhost
    return 'http://localhost:8080/api';
  }
  return 'https://your-production-api.com/api';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    HEALTH: '/health',
    ANALYZE: '/analyze',
  },
  TIMEOUT: 10000,
};

export default API_CONFIG;
