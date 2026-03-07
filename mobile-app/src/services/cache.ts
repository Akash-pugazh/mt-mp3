import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DIR = `${FileSystem.documentDirectory}songs/`;
const INDEX_KEY = 'song_cache_index_v1';

type CacheIndex = Record<string, string>;

async function ensureCacheDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

async function readIndex(): Promise<CacheIndex> {
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as CacheIndex;
    return parsed ?? {};
  } catch {
    return {};
  }
}

async function writeIndex(index: CacheIndex): Promise<void> {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 100);
}

export async function getCachedUri(cacheKey: string): Promise<string | null> {
  const index = await readIndex();
  const uri = index[cacheKey];
  if (!uri) return null;

  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    delete index[cacheKey];
    await writeIndex(index);
    return null;
  }

  return uri;
}

export async function downloadIfMissing(cacheKey: string, remoteUrl: string): Promise<string> {
  await ensureCacheDir();

  const existing = await getCachedUri(cacheKey);
  if (existing) return existing;

  const fileName = `${sanitizeFileName(cacheKey)}.mp3`;
  const fileUri = `${CACHE_DIR}${fileName}`;

  await FileSystem.downloadAsync(remoteUrl, fileUri);

  const index = await readIndex();
  index[cacheKey] = fileUri;
  await writeIndex(index);

  return fileUri;
}

export async function getCachedCount(): Promise<number> {
  const index = await readIndex();
  return Object.keys(index).length;
}
