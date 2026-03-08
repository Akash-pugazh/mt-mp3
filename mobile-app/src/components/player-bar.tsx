import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLibrary } from '../context/library-context';
import { usePlayer } from '../context/player-context';
import { palette } from '../theme/palette';

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(totalSec % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    isBuffering,
    positionMs,
    durationMs,
    togglePlayPause,
    playNext,
    playPrevious,
    queue,
    currentIndex,
    cacheCount,
  } = usePlayer();

  const { isLiked, toggleLike } = useLibrary();

  if (!currentSong) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyHint}>Pick any song from Home, Movies, or Library</Text>
      </View>
    );
  }

  const progress = durationMs > 0 ? Math.min(1, Math.max(0, positionMs / durationMs)) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.title}>
            {currentSong.title}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {currentSong.artists}
          </Text>
        </View>

        <Pressable style={styles.iconBtn} onPress={() => toggleLike(currentSong)}>
          <Text style={[styles.iconLabel, isLiked(currentSong.id) && styles.likedIcon]}>♥</Text>
        </Pressable>
      </View>

      <View style={styles.timelineBg}>
        <View style={[styles.timelineFg, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{formatMs(positionMs)}</Text>
        <Text style={styles.meta}>
          {currentIndex + 1}/{queue.length} | {cacheCount} cached
        </Text>
        <Text style={styles.meta}>{formatMs(durationMs)}</Text>
      </View>

      <View style={styles.controlsRow}>
        <Pressable style={styles.button} onPress={playPrevious}>
          <Text style={styles.buttonText}>Prev</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={() => void togglePlayPause()}
        >
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            {isBuffering ? 'Buffering' : isPlaying ? 'Pause' : 'Play'}
          </Text>
        </Pressable>
        <Pressable style={styles.button} onPress={playNext}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    borderTopWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#0A0B0D',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emptyHint: {
    color: palette.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  container: {
    borderTopWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#0A0B0D',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  likedIcon: {
    color: palette.accent,
  },
  timelineBg: {
    marginTop: 10,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#1d232b',
    overflow: 'hidden',
  },
  timelineFg: {
    height: '100%',
    backgroundColor: palette.accent,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  meta: {
    color: palette.textSecondary,
    fontSize: 10,
  },
  controlsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    backgroundColor: palette.surface,
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  buttonText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  primaryButtonText: {
    color: '#082211',
  },
});
