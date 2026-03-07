import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSong, Playlist } from '../types/api';

const LIKED_KEY = 'library_liked_song_ids_v1';
const PLAYLISTS_KEY = 'library_playlists_v1';
const SONG_CATALOG_KEY = 'library_song_catalog_v1';

export type LibrarySnapshot = {
  likedSongIds: string[];
  playlists: Playlist[];
  songCatalog: Record<string, AppSong>;
};

export async function loadLibrarySnapshot(): Promise<LibrarySnapshot> {
  const [likedRaw, playlistsRaw, catalogRaw] = await Promise.all([
    AsyncStorage.getItem(LIKED_KEY),
    AsyncStorage.getItem(PLAYLISTS_KEY),
    AsyncStorage.getItem(SONG_CATALOG_KEY),
  ]);

  const likedSongIds = parseJson<string[]>(likedRaw, []);
  const playlists = parseJson<Playlist[]>(playlistsRaw, []);
  const songCatalog = parseJson<Record<string, AppSong>>(catalogRaw, {});

  return { likedSongIds, playlists, songCatalog };
}

export async function saveLikedSongIds(songIds: string[]): Promise<void> {
  await AsyncStorage.setItem(LIKED_KEY, JSON.stringify(songIds));
}

export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

export async function saveSongCatalog(songCatalog: Record<string, AppSong>): Promise<void> {
  await AsyncStorage.setItem(SONG_CATALOG_KEY, JSON.stringify(songCatalog));
}

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return (JSON.parse(raw) as T) ?? fallback;
  } catch {
    return fallback;
  }
}
