import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlayerBar } from '../components/player-bar';
import { TabBar } from '../components/tab-bar';
import { palette } from '../theme/palette';
import type { TabId } from '../types/api';
import { HomeTab } from './home-tab';
import { LibraryTab } from './library-tab';
import { MoviesTab } from './movies-tab';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const tabContent = useMemo(() => {
    if (activeTab === 'home') return <HomeTab />;
    if (activeTab === 'movies') return <MoviesTab />;
    return <LibraryTab />;
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.content}>{tabContent}</View>
      <PlayerBar />
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  content: {
    flex: 1,
  },
});
