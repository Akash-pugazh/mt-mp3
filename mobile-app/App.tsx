import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LibraryProvider } from './src/context/library-context';
import { PlayerProvider } from './src/context/player-context';
import { AppShell } from './src/screens/app-shell';

export default function App() {
  return (
    <SafeAreaProvider>
      <LibraryProvider>
        <PlayerProvider>
          <StatusBar style="light" />
          <AppShell />
        </PlayerProvider>
      </LibraryProvider>
    </SafeAreaProvider>
  );
}
