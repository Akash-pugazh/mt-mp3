// ============================================================
// Local cache — localStorage-based (web)
// Mirrors mobile-app/src/services/cache.ts + library-store.ts
// ============================================================
import type { Song, Playlist } from "@/types/music";

const KEYS = {
  LIKED: "isai_liked_songs",
  PLAYLISTS: "isai_playlists",
  RECENT: "isai_recent_plays",
  SONG_META: "isai_song_meta",
} as const;

// ── Liked Songs ──
export function getLikedSongIds(): string[] {
  try { return JSON.parse(localStorage.getItem(KEYS.LIKED) || "[]"); }
  catch { return []; }
}

export function setLikedSongIds(ids: string[]) {
  localStorage.setItem(KEYS.LIKED, JSON.stringify(ids));
}

export function toggleLikedSong(id: string): boolean {
  const ids = getLikedSongIds();
  const idx = ids.indexOf(id);
  if (idx >= 0) { ids.splice(idx, 1); setLikedSongIds(ids); return false; }
  ids.unshift(id);
  setLikedSongIds(ids);
  return true;
}

export function isSongLiked(id: string): boolean {
  return getLikedSongIds().includes(id);
}

// ── Playlists ──
export function getPlaylists(): Playlist[] {
  try { return JSON.parse(localStorage.getItem(KEYS.PLAYLISTS) || "[]"); }
  catch { return []; }
}

export function savePlaylists(playlists: Playlist[]) {
  localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
}

export function createPlaylist(name: string): Playlist {
  const pl: Playlist = {
    id: crypto.randomUUID(),
    name,
    songIds: [],
    createdAt: Date.now(),
  };
  const all = getPlaylists();
  all.push(pl);
  savePlaylists(all);
  return pl;
}

export function deletePlaylist(id: string) {
  savePlaylists(getPlaylists().filter(p => p.id !== id));
}

export function addSongToPlaylist(playlistId: string, songId: string) {
  const all = getPlaylists();
  const pl = all.find(p => p.id === playlistId);
  if (pl && !pl.songIds.includes(songId)) {
    pl.songIds.push(songId);
    savePlaylists(all);
  }
}

export function removeSongFromPlaylist(playlistId: string, songId: string) {
  const all = getPlaylists();
  const pl = all.find(p => p.id === playlistId);
  if (pl) {
    pl.songIds = pl.songIds.filter(id => id !== songId);
    savePlaylists(all);
  }
}

export function renamePlaylist(id: string, name: string) {
  const all = getPlaylists();
  const pl = all.find(p => p.id === id);
  if (pl) {
    pl.name = name;
    savePlaylists(all);
  }
}

// ── Recent Plays ──
export function getRecentPlays(): string[] {
  try { return JSON.parse(localStorage.getItem(KEYS.RECENT) || "[]"); }
  catch { return []; }
}

export function addRecentPlay(songId: string) {
  let recent = getRecentPlays().filter(id => id !== songId);
  recent.unshift(songId);
  recent = recent.slice(0, 50);
  localStorage.setItem(KEYS.RECENT, JSON.stringify(recent));
}

// ── Song metadata store (offline catalog) ──
export function getSongMeta(id: string): Song | null {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.SONG_META) || "{}");
    return all[id] || null;
  } catch { return null; }
}

export function saveSongMeta(song: Song) {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.SONG_META) || "{}");
    all[song.id] = song;
    localStorage.setItem(KEYS.SONG_META, JSON.stringify(all));
  } catch {}
}

export function getAllSongMeta(): Record<string, Song> {
  try { return JSON.parse(localStorage.getItem(KEYS.SONG_META) || "{}"); }
  catch { return {}; }
}
