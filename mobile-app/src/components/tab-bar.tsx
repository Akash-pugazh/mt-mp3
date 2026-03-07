import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TabId } from '../types/api';
import { palette } from '../theme/palette';

type Props = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
};

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'movies', label: 'Movies' },
  { id: 'library', label: 'Library' },
];

export function TabBar({ activeTab, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[styles.tabBtn, isActive && styles.activeTabBtn]}
          >
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#0A0B0D',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14191f',
    borderWidth: 1,
    borderColor: '#2a323d',
  },
  activeTabBtn: {
    backgroundColor: '#173a24',
    borderColor: '#3ecf73',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  activeTabLabel: {
    color: '#7bf3aa',
  },
});
