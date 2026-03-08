const DEFAULT_API_BASE = 'http://localhost:3000';
const fromEnv = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = (fromEnv && fromEnv.trim()) || DEFAULT_API_BASE;
export const API_FALLBACK_BASE_URLS = ['http://127.0.0.1:3000', 'http://10.0.2.2:3000'];

// Artwork base URL from masstamilan
export const ARTWORK_BASE_URL = 'https://www.masstamilan.dev/i';

