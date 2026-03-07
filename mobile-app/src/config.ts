const DEFAULT_LAN_API_BASE_URL = 'http://10.154.226.141:3000';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_LAN_API_BASE_URL;

// Real device default: current LAN IP on host machine.
// Override anytime via EXPO_PUBLIC_API_BASE_URL.
// Emulator options:
// - Android emulator: http://10.0.2.2:3000
// - iOS simulator: http://localhost:3000
