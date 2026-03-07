import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/palette';
import type { AppSong } from '../types/api';

type Props = {
  song: AppSong;
  isActive: boolean;
  isLiked?: boolean;
  onPress: () => void;
  onToggleLike?: () => void;
  onAddToPlaylist?: () => void;
};

function SongListItemComponent({
  song,
  isActive,
  isLiked = false,
  onPress,
  onToggleLike,
  onAddToPlaylist,
}: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.row, isActive && styles.activeRow]}>
      <View style={styles.textWrap}>
        <Text numberOfLines={1} style={styles.title}>
          {song.title}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {song.artists} | {song.movieTitle}
        </Text>
      </View>

      <View style={styles.actions}>
        {onAddToPlaylist ? (
          <Pressable onPress={onAddToPlaylist} style={styles.iconBtn}>
            <Text style={styles.iconLabel}>+</Text>
          </Pressable>
        ) : null}

        {onToggleLike ? (
          <Pressable onPress={onToggleLike} style={styles.iconBtn}>
            <Text style={[styles.iconLabel, isLiked && styles.likedIcon]}>♥</Text>
          </Pressable>
        ) : null}

        <Text style={styles.playLabel}>{isActive ? 'Now' : 'Play'}</Text>
      </View>
    </Pressable>
  );
}

export const SongListItem = memo(SongListItemComponent);

const styles = StyleSheet.create({
  row: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  activeRow: {
    borderColor: '#2fa75b',
    backgroundColor: '#162118',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: -1,
  },
  likedIcon: {
    color: palette.accent,
  },
  playLabel: {
    color: palette.accent,
    fontWeight: '700',
    fontSize: 12,
    minWidth: 30,
    textAlign: 'right',
  },
});
