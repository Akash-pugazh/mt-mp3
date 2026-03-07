import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AppSong } from '../types/api';
import { downloadIfMissing, getCachedCount, getCachedUri } from '../services/cache';

type PlayerContextValue = {
  queue: AppSong[];
  currentIndex: number;
  currentSong: AppSong | null;
  isPlaying: boolean;
  isBuffering: boolean;
  positionMs: number;
  durationMs: number;
  cacheCount: number;
  setQueue: (songs: AppSong[]) => void;
  setQueueAndPlay: (songs: AppSong[], index: number) => Promise<void>;
  playAt: (index: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (positionMs: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const queueRef = useRef<AppSong[]>([]);
  const currentIndexRef = useRef<number>(-1);

  const [queue, setQueueState] = useState<AppSong[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [cacheCount, setCacheCount] = useState(0);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playsInSilentModeIOS: true,
    }).catch(() => undefined);

    getCachedCount()
      .then(setCacheCount)
      .catch(() => undefined);

    return () => {
      const sound = soundRef.current;
      if (sound) {
        sound.unloadAsync().catch(() => undefined);
      }
    };
  }, []);

  const currentSong = currentIndex >= 0 ? queue[currentIndex] : null;

  const onPlaybackStatusUpdate = async (status: AVPlaybackStatus): Promise<void> => {
    if (!status.isLoaded) return;

    setIsPlaying(status.isPlaying);
    setIsBuffering(status.isBuffering);
    setPositionMs(status.positionMillis ?? 0);
    setDurationMs(status.durationMillis ?? 0);

    if (status.didJustFinish) {
      const nextIndex = currentIndexRef.current + 1;
      if (nextIndex < queueRef.current.length) {
        await playAt(nextIndex);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const loadAndPlaySong = async (song: AppSong): Promise<void> => {
    const existing = soundRef.current;
    if (existing) {
      await existing.unloadAsync();
      soundRef.current = null;
    }

    const cached = await getCachedUri(song.cacheKey);
    const sourceUri = cached ?? song.remoteUrl;

    const { sound } = await Audio.Sound.createAsync(
      { uri: sourceUri },
      { shouldPlay: true, progressUpdateIntervalMillis: 500 },
      (status) => {
        void onPlaybackStatusUpdate(status);
      },
    );

    soundRef.current = sound;

    if (!cached) {
      void downloadIfMissing(song.cacheKey, song.remoteUrl)
        .then(() => getCachedCount().then(setCacheCount))
        .catch(() => undefined);
    }
  };

  const playAt = async (index: number): Promise<void> => {
    if (index < 0 || index >= queueRef.current.length) return;

    const song = queueRef.current[index];
    setCurrentIndex(index);
    setPositionMs(0);
    await loadAndPlaySong(song);
  };

  const setQueue = (songs: AppSong[]): void => {
    setQueueState(songs);
    setCurrentIndex(-1);
    setPositionMs(0);
    setDurationMs(0);
    setIsPlaying(false);
  };

  const setQueueAndPlay = async (songs: AppSong[], index: number): Promise<void> => {
    setQueueState(songs);
    await Promise.resolve();
    queueRef.current = songs;
    await playAt(index);
  };

  const togglePlayPause = async (): Promise<void> => {
    const sound = soundRef.current;
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const seekTo = async (ms: number): Promise<void> => {
    const sound = soundRef.current;
    if (!sound) return;
    await sound.setPositionAsync(ms);
  };

  const playNext = async (): Promise<void> => {
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex < queueRef.current.length) {
      await playAt(nextIndex);
    }
  };

  const playPrevious = async (): Promise<void> => {
    const prevIndex = currentIndexRef.current - 1;
    if (prevIndex >= 0) {
      await playAt(prevIndex);
    }
  };

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      currentIndex,
      currentSong,
      isPlaying,
      isBuffering,
      positionMs,
      durationMs,
      cacheCount,
      setQueue,
      setQueueAndPlay,
      playAt,
      togglePlayPause,
      seekTo,
      playNext,
      playPrevious,
    }),
    [queue, currentIndex, currentSong, isPlaying, isBuffering, positionMs, durationMs, cacheCount],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }

  return ctx;
}
