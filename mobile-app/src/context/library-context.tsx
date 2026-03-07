import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AppSong, Playlist } from '../types/api';
import {
  loadLibrarySnapshot,
  saveLikedSongIds,
  savePlaylists,
  saveSongCatalog,
} from '../services/library-store';

type LibraryContextValue = {
  likedSongIds: string[];
  playlists: Playlist[];
  songCatalog: Record<string, AppSong>;
  hydrated: boolean;
  likedSongs: AppSong[];
  isLiked: (songId: string) => boolean;
  toggleLike: (song: AppSong) => void;
  createPlaylist: (name: string) => void;
  addSongToPlaylist: (playlistId: string, song: AppSong) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  registerSongs: (songs: AppSong[]) => void;
  getSongsByIds: (songIds: string[]) => AppSong[];
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songCatalog, setSongCatalog] = useState<Record<string, AppSong>>({});

  useEffect(() => {
    loadLibrarySnapshot()
      .then((snapshot) => {
        setLikedSongIds(snapshot.likedSongIds);
        setPlaylists(snapshot.playlists);
        setSongCatalog(snapshot.songCatalog);
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveLikedSongIds(likedSongIds);
  }, [likedSongIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void savePlaylists(playlists);
  }, [playlists, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void saveSongCatalog(songCatalog);
  }, [songCatalog, hydrated]);

  const likedSet = useMemo(() => new Set(likedSongIds), [likedSongIds]);

  const likedSongs = useMemo(
    () =>
      likedSongIds
        .map((songId) => songCatalog[songId])
        .filter((song): song is AppSong => Boolean(song)),
    [likedSongIds, songCatalog],
  );

  const registerSongs = (songs: AppSong[]): void => {
    if (songs.length === 0) return;

    setSongCatalog((prev) => {
      const next = { ...prev };
      let changed = false;

      songs.forEach((song) => {
        const existing = next[song.id];
        if (
          !existing ||
          existing.remoteUrl !== song.remoteUrl ||
          existing.title !== song.title ||
          existing.artists !== song.artists ||
          existing.movieTitle !== song.movieTitle
        ) {
          changed = true;
        }
        next[song.id] = song;
      });

      return changed ? next : prev;
    });
  };

  const isLiked = (songId: string): boolean => likedSet.has(songId);

  const toggleLike = (song: AppSong): void => {
    registerSongs([song]);
    setLikedSongIds((prev) => {
      if (prev.includes(song.id)) {
        return prev.filter((id) => id !== song.id);
      }
      return [song.id, ...prev];
    });
  };

  const createPlaylist = (name: string): void => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setPlaylists((prev) => {
      const already = prev.some((item) => item.name.toLowerCase() === trimmed.toLowerCase());
      if (already) return prev;

      return [
        {
          id: makeId('playlist'),
          name: trimmed,
          songIds: [],
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  const addSongToPlaylist = (playlistId: string, song: AppSong): void => {
    registerSongs([song]);

    setPlaylists((prev) => {
      return prev.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        if (playlist.songIds.includes(song.id)) return playlist;

        return { ...playlist, songIds: [song.id, ...playlist.songIds] };
      });
    });
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string): void => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        return { ...playlist, songIds: playlist.songIds.filter((id) => id !== songId) };
      }),
    );
  };

  const getSongsByIds = (songIds: string[]): AppSong[] =>
    songIds
      .map((songId) => songCatalog[songId])
      .filter((song): song is AppSong => Boolean(song));

  const value = useMemo<LibraryContextValue>(
    () => ({
      likedSongIds,
      playlists,
      songCatalog,
      hydrated,
      likedSongs,
      isLiked,
      toggleLike,
      createPlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      registerSongs,
      getSongsByIds,
    }),
    [likedSongIds, playlists, songCatalog, hydrated, likedSongs],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return ctx;
}
