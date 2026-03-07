import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/palette';

type Props = {
  title: string;
  subtitle: string;
  chips?: string[];
};

export function HeroHeader({ title, subtitle, chips = [] }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bgOrbPrimary} />
      <View style={styles.bgOrbSecondary} />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {chips.length > 0 ? (
        <View style={styles.chipsRow}>
          {chips.map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#243326',
    backgroundColor: '#111a13',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  bgOrbPrimary: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: '#1db95433',
    top: -80,
    right: -40,
  },
  bgOrbSecondary: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: '#4f6cff26',
    bottom: -40,
    left: -30,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    color: '#c5d1dc',
    fontSize: 12,
  },
  chipsRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#2e4835',
    backgroundColor: '#111f15',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    color: '#9cd9b2',
    fontSize: 11,
    fontWeight: '700',
  },
});
