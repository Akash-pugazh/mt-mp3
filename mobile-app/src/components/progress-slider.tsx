import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';

type Props = {
  value: number;
  onChange: (next: number) => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function ProgressSlider({ value, onChange }: Props) {
  const [trackWidth, setTrackWidth] = useState(1);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const ratio = clamp(evt.nativeEvent.locationX / trackWidth, 0, 1);
          onChange(ratio);
        },
        onPanResponderMove: (evt) => {
          const ratio = clamp(evt.nativeEvent.locationX / trackWidth, 0, 1);
          onChange(ratio);
        },
      }),
    [trackWidth, onChange],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(Math.max(1, event.nativeEvent.layout.width));
  };

  return (
    <View style={styles.wrap} onLayout={onLayout} {...panResponder.panHandlers}>
      <View style={styles.inactiveTrack} />
      <View style={[styles.activeTrack, { width: `${clamp(value, 0, 1) * 100}%` }]} />
      <View style={[styles.thumb, { left: clamp(value, 0, 1) * trackWidth - 6 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 22,
    justifyContent: 'center',
  },
  inactiveTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#ffffff30',
  },
  activeTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#52B3E9',
  },
  thumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#dff5ff',
    borderWidth: 1,
    borderColor: '#52B3E9',
  },
});
