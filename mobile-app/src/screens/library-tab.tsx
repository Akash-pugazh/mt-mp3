import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { HeroHeader } from '../components/hero-header';
import { SongListItem } from '../components/song-list-item';
import { useLibrary } from '../context/library-context';
import { usePlayer } from '../context/player-context';
import { palette } from '../theme/palette';
import type { AppSong, Playlist } from '../types/api';

type Section = 'liked' | 'playlists';

function PlaylistCard({ playlist, onPress }: { playlist: Playlist; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.playlistCard}>
      <View>
        <Text style={styles.playlistTitle}>{playlist.name}</Text>
        <Text style={styles.playlistMeta}>{playlist.songIds.length} song(s)</Text>
      </View>
      <Text style={styles.openLabel}>Open</Text>
    </Pressable>
  );
}

export function LibraryTab() {
  const [section, setSection] = useState<Section>('liked');
  const [playlistName, setPlaylistName] = useState('');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  const {
    likedSongs,
    playlists,
    isLiked,
    toggleLike,
    createPlaylist,
    addSongToPlaylist,
    getSongsByIds,
    hydrated,
  } = useLibrary();
  const { currentSong, setQueueAndPlay } = usePlayer();

  const activePlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === activePlaylistId) || null,
    [activePlaylistId, playlists],
  );

  const activePlaylistSongs = useMemo(() => {
    if (!activePlaylist) return [];
    return getSongsByIds(activePlaylist.songIds);
  }, [activePlaylist, getSongsByIds]);

  const addToPlaylistChooser = (song: AppSong): void => {
    if (playlists.length === 0) {
      Alert.alert('No playlists', 'Create a playlist first.');
      return;
    }

    const buttons = playlists.slice(0, 8).map((playlist) => ({
      text: playlist.name,
      onPress: () => addSongToPlaylist(playlist.id, song),
    }));

    Alert.alert('Add to playlist', song.title, [...buttons, { text: 'Cancel', style: 'cancel' }]);
  };

  if (!hydrated) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helper}>Loading your library...</Text>
      </View>
    );
  }

  if (activePlaylist) {
    return (
      <View style={styles.screen}>
        <View style={styles.headerWrap}>
          <Pressable style={styles.backBtn} onPress={() => setActivePlaylistId(null)}>
            <Text style={styles.backLabel}>← Back to Playlists</Text>
          </Pressable>
          <HeroHeader
            title={activePlaylist.name}
            subtitle={`${activePlaylistSongs.length} songs in this playlist`}
            chips={['Playlist', 'Persistent']}
          />
        </View>

        <FlatList
          data={activePlaylistSongs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <SongListItem
              song={item}
              isActive={currentSong?.id === item.id}
              isLiked={isLiked(item.id)}
              onPress={() => {
                const index = activePlaylistSongs.findIndex((song) => song.id === item.id);
                if (index >= 0) {
                  void setQueueAndPlay(activePlaylistSongs, index);
                }
              }}
              onToggleLike={() => toggleLike(item)}
            />
          )}
          ListEmptyComponent={<Text style={styles.helper}>No songs in this playlist yet.</Text>}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <HeroHeader
          title="Your Library"
          subtitle={`${likedSongs.length} liked songs | ${playlists.length} playlists`}
          chips={['Liked Songs', 'Playlists', 'Persistent']}
        />

        <View style={styles.segmentWrap}>
          <Pressable
            style={[styles.segmentBtn, section === 'liked' && styles.segmentBtnActive]}
            onPress={() => setSection('liked')}
          >
            <Text style={[styles.segmentLabel, section === 'liked' && styles.segmentLabelActive]}>
              Liked Songs
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, section === 'playlists' && styles.segmentBtnActive]}
            onPress={() => setSection('playlists')}
          >
            <Text
              style={[styles.segmentLabel, section === 'playlists' && styles.segmentLabelActive]}
            >
              Playlists
            </Text>
          </Pressable>
        </View>
      </View>

      {section === 'liked' ? (
        <FlatList
          data={likedSongs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <SongListItem
              song={item}
              isActive={currentSong?.id === item.id}
              isLiked={isLiked(item.id)}
              onPress={() => {
                const index = likedSongs.findIndex((song) => song.id === item.id);
                if (index >= 0) {
                  void setQueueAndPlay(likedSongs, index);
                }
              }}
              onToggleLike={() => toggleLike(item)}
              onAddToPlaylist={() => addToPlaylistChooser(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.helper}>No liked songs yet. Tap ♥ on any song.</Text>
          }
        />
      ) : (
        <View style={styles.playlistSection}>
          <View style={styles.createRow}>
            <TextInput
              style={styles.input}
              value={playlistName}
              onChangeText={setPlaylistName}
              placeholder="Create playlist"
              placeholderTextColor={palette.textSecondary}
            />
            <Pressable
              style={styles.createBtn}
              onPress={() => {
                createPlaylist(playlistName);
                setPlaylistName('');
              }}
            >
              <Text style={styles.createBtnLabel}>Create</Text>
            </Pressable>
          </View>

          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <PlaylistCard playlist={item} onPress={() => setActivePlaylistId(item.id)} />
            )}
            ListEmptyComponent={
              <Text style={styles.helper}>No playlists yet. Create your first one above.</Text>
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
  },
  helper: {
    color: palette.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  segmentWrap: {
    marginTop: 0,
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: palette.surface,
  },
  segmentBtnActive: {
    borderColor: '#2fa75b',
    backgroundColor: '#12371f',
  },
  segmentLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  segmentLabelActive: {
    color: '#8af5b3',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  playlistSection: {
    flex: 1,
  },
  createRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    backgroundColor: palette.surface,
    color: palette.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  createBtn: {
    borderRadius: 12,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  createBtnLabel: {
    color: '#062312',
    fontSize: 13,
    fontWeight: '800',
  },
  playlistCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    backgroundColor: palette.surface,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playlistTitle: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  playlistMeta: {
    marginTop: 4,
    color: palette.textSecondary,
    fontSize: 12,
  },
  openLabel: {
    color: palette.accent,
    fontWeight: '700',
    fontSize: 12,
  },
  backBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.surface,
    marginBottom: 10,
  },
  backLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
