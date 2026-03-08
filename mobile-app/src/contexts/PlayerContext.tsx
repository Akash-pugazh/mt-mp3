import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import type { Song, RepeatMode, Playlist } from "@/types/music";
import * as cache from "@/lib/cache";
import { resolvePlayableUrl } from "@/lib/api";

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  likedIds: string[];
  playlists: Playlist[];

  play: (song?: Song, newQueue?: Song[]) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;

  toggleLike: (id: string) => void;
  isLiked: (id: string) => boolean;
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (plId: string, songId: string) => void;
  removeFromPlaylist: (plId: string, songId: string) => void;
  getPlaylistSongs: (plId: string) => Song[];
  renamePlaylist: (id: string, name: string) => void;

  allSongs: Song[];
  searchSongs: (q: string) => Song[];
  registerSongs: (songs: Song[]) => void;
  prefetchSong: (song: Song) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resolvedUrlCacheRef = useRef<Map<string, string>>(new Map());
  const playRequestIdRef = useRef(0);
  const [allSongs, setAllSongs] = useState<Song[]>(() => {
    const merged = Object.values(cache.getAllSongMeta());
    const seen = new Set<string>();
    return merged.filter(song => {
      if (seen.has(song.id)) return false;
      seen.add(song.id);
      return true;
    });
  });

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [likedIds, setLikedIds] = useState<string[]>(cache.getLikedSongIds());
  const [playlists, setPlaylists] = useState<Playlist[]>(cache.getPlaylists());

  const registerSongs = useCallback((songs: Song[]) => {
    if (!songs.length) return;
    setAllSongs(prev => {
      const byId = new Map(prev.map(song => [song.id, song]));
      songs.forEach(song => {
        byId.set(song.id, { ...byId.get(song.id), ...song });
        cache.saveSongMeta(song);
      });
      return Array.from(byId.values());
    });
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
      audioRef.current.volume = volume;
    }
    const audio = audioRef.current;
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [repeat, shuffle, queue, queueIndex]);

  const getNextIndex = useCallback(() => {
    if (shuffle) {
      if (queue.length <= 1) return 0;
      let n: number;
      do { n = Math.floor(Math.random() * queue.length); } while (n === queueIndex);
      return n;
    }
    if (queueIndex < queue.length - 1) return queueIndex + 1;
    return repeat === "all" ? 0 : -1;
  }, [shuffle, queueIndex, queue.length, repeat]);

  const resolveSongStreamUrl = useCallback(async (song: Song): Promise<string | null> => {
    const cached = resolvedUrlCacheRef.current.get(song.id);
    if (cached) return cached;
    const resolved = await resolvePlayableUrl(song);
    if (resolved) {
      resolvedUrlCacheRef.current.set(song.id, resolved);
    }
    return resolved;
  }, []);

  const prefetchSong = useCallback((song: Song) => {
    void resolveSongStreamUrl(song);
  }, [resolveSongStreamUrl]);

  const playSong = useCallback(async (song: Song) => {
    const requestId = ++playRequestIdRef.current;
    setCurrentSong(song);
    setDuration(song.duration || 0);
    setProgress(0);
    setIsPlaying(false);
    cache.addRecentPlay(song.id);
    cache.saveSongMeta(song);
    registerSongs([song]);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();

      const streamUrl = await resolveSongStreamUrl(song);
      if (!streamUrl) return;
      if (requestId !== playRequestIdRef.current) return;
      audioRef.current.src = streamUrl;
      audioRef.current.play().then(() => {
        if (requestId === playRequestIdRef.current) {
          setIsPlaying(true);
        }
      }).catch(async () => {
        const retryUrl = await resolveSongStreamUrl(song);
        if (!retryUrl || retryUrl === streamUrl) return;
        if (requestId !== playRequestIdRef.current) return;
        audioRef.current!.src = retryUrl;
        await audioRef.current!.play().then(() => {
          if (requestId === playRequestIdRef.current) {
            setIsPlaying(true);
          }
        }).catch(() => {});
      });
    }
  }, [registerSongs, resolveSongStreamUrl]);

  const play = useCallback((song?: Song, newQueue?: Song[]) => {
    if (song) {
      const q = newQueue || queue;
      if (newQueue) setQueue(q);
      const idx = q.findIndex(s => s.id === song.id);
      setQueueIndex(idx >= 0 ? idx : 0);
      playSong(song);
    } else if (currentSong) {
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [queue, currentSong, playSong]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    isPlaying ? pause() : play();
  }, [isPlaying, pause, play]);

  const handleNext = useCallback(() => {
    const idx = getNextIndex();
    if (idx >= 0 && queue[idx]) {
      setQueueIndex(idx);
      playSong(queue[idx]);
    } else {
      setIsPlaying(false);
    }
  }, [getNextIndex, queue, playSong]);

  const previous = useCallback(() => {
    if (progress > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    const idx = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    if (queue[idx]) {
      setQueueIndex(idx);
      playSong(queue[idx]);
    }
  }, [queueIndex, queue, playSong, progress]);

  const seek = useCallback((t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t;
    setProgress(t);
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
    setVolumeState(v);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);
  const cycleRepeat = useCallback(() => {
    setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off");
  }, []);

  const toggleLike = useCallback((id: string) => {
    cache.toggleLikedSong(id);
    setLikedIds(cache.getLikedSongIds());
  }, []);

  const isLikedFn = useCallback((id: string) => likedIds.includes(id), [likedIds]);

  const createPlaylistFn = useCallback((name: string) => {
    cache.createPlaylist(name);
    setPlaylists(cache.getPlaylists());
  }, []);

  const deletePlaylistFn = useCallback((id: string) => {
    cache.deletePlaylist(id);
    setPlaylists(cache.getPlaylists());
  }, []);

  const addToPlaylistFn = useCallback((plId: string, songId: string) => {
    cache.addSongToPlaylist(plId, songId);
    setPlaylists(cache.getPlaylists());
  }, []);

  const removeFromPlaylistFn = useCallback((plId: string, songId: string) => {
    cache.removeSongFromPlaylist(plId, songId);
    setPlaylists(cache.getPlaylists());
  }, []);

  const renamePlaylistFn = useCallback((id: string, name: string) => {
    cache.renamePlaylist(id, name);
    setPlaylists(cache.getPlaylists());
  }, []);

  const getPlaylistSongs = useCallback((plId: string): Song[] => {
    const pl = playlists.find(p => p.id === plId);
    if (!pl) return [];
    return pl.songIds
      .map(id => allSongs.find(s => s.id === id) || cache.getSongMeta(id))
      .filter(Boolean) as Song[];
  }, [playlists, allSongs]);

  const searchSongs = useCallback((q: string): Song[] => {
    const lower = q.toLowerCase();
    return allSongs.filter(s =>
      s.title.toLowerCase().includes(lower) ||
      s.artist.toLowerCase().includes(lower) ||
      s.movie.toLowerCase().includes(lower)
    );
  }, [allSongs]);

  useEffect(() => {
    if (!queue.length || queueIndex < 0) return;
    const upcoming = [queue[queueIndex + 1], queue[queueIndex + 2]].filter(Boolean) as Song[];
    upcoming.forEach((song) => {
      void resolveSongStreamUrl(song);
    });
  }, [queue, queueIndex, resolveSongStreamUrl]);

  return (
    <PlayerContext.Provider value={{
      currentSong, queue, queueIndex, isPlaying, progress, duration, volume,
      shuffle, repeat, likedIds, playlists,
      play, pause, toggle, next: handleNext, previous, seek, setVolume,
      toggleShuffle, cycleRepeat,
      toggleLike, isLiked: isLikedFn,
      createPlaylist: createPlaylistFn, deletePlaylist: deletePlaylistFn,
      addToPlaylist: addToPlaylistFn, removeFromPlaylist: removeFromPlaylistFn,
      getPlaylistSongs, renamePlaylist: renamePlaylistFn,
      allSongs, searchSongs, registerSongs, prefetchSong,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
