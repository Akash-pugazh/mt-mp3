import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getMovieSongs, listLatestMovies } from '../api/client';
import { HeroHeader } from '../components/hero-header';
import { SongListItem } from '../components/song-list-item';
import { useLibrary } from '../context/library-context';
import { usePlayer } from '../context/player-context';
import { toAppSong } from '../services/mappers';
import { palette } from '../theme/palette';
import type { AppSong } from '../types/api';

const MOVIES_PER_PAGE_TO_EXPAND = 6;

async function loadSongFeedPage(page: number): Promise<AppSong[]> {
  const movieData = await listLatestMovies(page);
  const movies = movieData.items.slice(0, MOVIES_PER_PAGE_TO_EXPAND);

  const songsData = await Promise.allSettled(movies.map((movie) => getMovieSongs(movie.slug)));
  const output: AppSong[] = [];

  songsData.forEach((result, idx) => {
    if (result.status !== 'fulfilled') return;

    const slug = movies[idx]?.slug ?? `movie-${page}-${idx}`;
    result.value.items.forEach((raw) => {
      const mapped = toAppSong(raw, slug);
      if (mapped) output.push(mapped);
    });
  });

  return output;
}

function mergeUniqueSongs(current: AppSong[], next: AppSong[]): AppSong[] {
  const map = new Map<string, AppSong>();
  current.forEach((song) => map.set(song.id, song));
  next.forEach((song) => map.set(song.id, song));
  return Array.from(map.values());
}

export function HomeTab() {
  const [songs, setSongs] = useState<AppSong[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentSong, setQueueAndPlay } = usePlayer();
  const { isLiked, toggleLike, playlists, addSongToPlaylist, registerSongs } = useLibrary();

  const runLoad = async (targetPage: number, reset = false): Promise<void> => {
    try {
      setError(null);
      const loaded = await loadSongFeedPage(targetPage);

      if (loaded.length === 0) {
        setHasMore(false);
        return;
      }

      registerSongs(loaded);
      setSongs((prev) => (reset ? mergeUniqueSongs([], loaded) : mergeUniqueSongs(prev, loaded)));
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  React.useEffect(() => {
    void runLoad(1, true);
  }, []);

  const filteredSongs = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return songs;

    return songs.filter((song) => {
      return (
        song.title.toLowerCase().includes(term) ||
        song.artists.toLowerCase().includes(term) ||
        song.movieTitle.toLowerCase().includes(term)
      );
    });
  }, [songs, query]);

  const handleAddToPlaylist = (song: AppSong): void => {
    if (playlists.length === 0) {
      Alert.alert('No playlists', 'Create a playlist in Library tab first.');
      return;
    }

    const buttons = playlists.slice(0, 8).map((playlist) => ({
      text: playlist.name,
      onPress: () => addSongToPlaylist(playlist.id, song),
    }));

    Alert.alert('Add to playlist', song.title, [...buttons, { text: 'Cancel', style: 'cancel' }]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.accent} />
        <Text style={styles.helper}>Loading your feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <HeroHeader
          title="For You"
          subtitle={`${songs.length} songs discovered across trending latest movies`}
          chips={['Infinite Feed', 'Offline-first', 'Personal Library']}
        />

        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search songs, artists, movies"
          placeholderTextColor={palette.textSecondary}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setHasMore(true);
              void runLoad(1, true);
            }}
            tintColor={palette.accent}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (loadingMore || refreshing || !hasMore || query.trim()) return;
          setLoadingMore(true);
          void runLoad(page + 1, false);
        }}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={palette.accent} style={{ marginTop: 10 }} /> : null
        }
        renderItem={({ item }) => (
          <SongListItem
            song={item}
            isActive={currentSong?.id === item.id}
            isLiked={isLiked(item.id)}
            onPress={() => {
              const idx = filteredSongs.findIndex((song) => song.id === item.id);
              if (idx >= 0) {
                void setQueueAndPlay(filteredSongs, idx);
              }
            }}
            onToggleLike={() => toggleLike(item)}
            onAddToPlaylist={() => handleAddToPlaylist(item)}
          />
        )}
      />
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
    gap: 10,
  },
  helper: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  searchInput: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    backgroundColor: palette.surface,
    color: palette.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  error: {
    marginTop: 8,
    color: palette.danger,
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});
