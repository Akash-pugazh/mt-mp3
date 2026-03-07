import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MovieItem } from '../types/api';
import { palette } from '../theme/palette';

type Props = {
  movie: MovieItem;
  onPress: () => void;
};

export function MovieListItem({ movie, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.dot} />
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {movie.title}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {movie.slug}
        </Text>
      </View>
      <Text style={styles.cta}>Open</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.accent,
  },
  content: {
    flex: 1,
  },
  title: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  subtitle: {
    marginTop: 4,
    color: palette.textSecondary,
    fontSize: 12,
  },
  cta: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: '700',
  },
});
