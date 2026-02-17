/**
 * DerScan API Configuration
 *
 * Change API_BASE_URL to your ngrok URL when testing on a physical device,
 * or use 10.0.2.2 for Android emulator (maps to host's localhost).
 */

// For Android Emulator: 10.0.2.2 maps to your computer's localhost
// For Physical Device: Use your ngrok URL (e.g., https://abc123.ngrok.io)
// For Same WiFi: Use your computer's local IP (e.g., http://192.168.1.100:8000)

export const API_BASE_URL = 'http://10.0.2.2:8000';

// Toggle this to use mock data (no backend/GPU required)
export const USE_MOCK_API = false;

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  analyze: `${API_BASE_URL}/analyze`,
  analyzeMock: `${API_BASE_URL}/analyze/mock`,
} as const;
