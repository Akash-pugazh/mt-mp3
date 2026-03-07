import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getMovieSongs, listLatestMovies } from '../api/client';
import { HeroHeader } from '../components/hero-header';
import { MovieListItem } from '../components/movie-list-item';
import { SongListItem } from '../components/song-list-item';
import { useLibrary } from '../context/library-context';
import { usePlayer } from '../context/player-context';
import { toAppSong } from '../services/mappers';
import { palette } from '../theme/palette';
import type { AppSong, MovieItem } from '../types/api';

type MovieSongsViewProps = {
  movie: MovieItem;
  onBack: () => void;
};

function MovieSongsView({ movie, onBack }: MovieSongsViewProps) {
  const [songs, setSongs] = useState<AppSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { currentSong, setQueueAndPlay } = usePlayer();
  const { isLiked, toggleLike, playlists, addSongToPlaylist, registerSongs } = useLibrary();

  React.useEffect(() => {
    let mounted = true;

    getMovieSongs(movie.slug)
      .then((data) => {
        if (!mounted) return;
        const mapped = data.items
          .map((raw) => toAppSong(raw, movie.slug))
          .filter((song): song is AppSong => Boolean(song));

        setSongs(mapped);
        registerSongs(mapped);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load movie songs');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [movie.slug]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return songs;

    return songs.filter((song) => {
      return song.title.toLowerCase().includes(term) || song.artists.toLowerCase().includes(term);
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
        <Text style={styles.helper}>Loading songs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnLabel}>← Back to Movies</Text>
        </Pressable>

        <HeroHeader
          title={movie.title}
          subtitle={`${songs.length} tracks in this movie`}
          chips={['Movie Detail', 'Queue-ready']}
        />

        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search in this movie"
          placeholderTextColor={palette.textSecondary}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <SongListItem
            song={item}
            isActive={currentSong?.id === item.id}
            isLiked={isLiked(item.id)}
            onPress={() => {
              const index = filtered.findIndex((song) => song.id === item.id);
              if (index >= 0) {
                void setQueueAndPlay(filtered, index);
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

export function MoviesTab() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadMovies = async (targetPage: number, reset = false): Promise<void> => {
    try {
      setError(null);
      const data = await listLatestMovies(targetPage);
      const loaded = data.items;

      if (loaded.length === 0) {
        setHasMore(false);
        return;
      }

      setMovies((prev) => {
        const map = new Map<string, MovieItem>();
        (reset ? [] : prev).forEach((movie) => map.set(movie.slug, movie));
        loaded.forEach((movie) => map.set(movie.slug, movie));
        return Array.from(map.values());
      });

      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movies');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  React.useEffect(() => {
    void loadMovies(1, true);
  }, []);

  const filteredMovies = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return movies;

    return movies.filter((movie) => movie.title.toLowerCase().includes(term));
  }, [movies, query]);

  if (selectedMovie) {
    return <MovieSongsView movie={selectedMovie} onBack={() => setSelectedMovie(null)} />;
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.accent} />
        <Text style={styles.helper}>Loading movies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <HeroHeader
          title="Movies"
          subtitle="Latest Tamil movies with infinite loading"
          chips={['Recent Releases', 'Infinite Scroll']}
        />

        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search movies"
          placeholderTextColor={palette.textSecondary}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <FlatList
        data={filteredMovies}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setHasMore(true);
              void loadMovies(1, true);
            }}
            tintColor={palette.accent}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.trim() || loadingMore || !hasMore || refreshing) return;
          setLoadingMore(true);
          void loadMovies(page + 1, false);
        }}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={palette.accent} style={{ marginTop: 12 }} /> : null
        }
        renderItem={({ item }) => <MovieListItem movie={item} onPress={() => setSelectedMovie(item)} />}
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
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
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
  backBtnLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
