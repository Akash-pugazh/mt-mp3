const DEFAULT_API_BASE = 'http://localhost:3000';
const fromEnv = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = (fromEnv && fromEnv.trim()) || DEFAULT_API_BASE;

// Artwork base URL from masstamilan
export const ARTWORK_BASE_URL = 'https://www.masstamilan.dev/i';
