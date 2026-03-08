import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Search, Film } from "lucide-react";
import { getMoviePreviewImage, listMovies, searchAutocomplete } from "@/lib/api";
import { DEFAULT_ARTWORK_PREVIEW, toHighQualityImage } from "@/lib/images";
import type { AutocompleteItem, Movie } from "@/types/music";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CachedImage from "@/components/CachedImage";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const fadeItem = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const MOVIE_SOURCE = "tamil-songs";
const MAX_PAGES = 1000;
const MAX_EMPTY_PAGES_IN_A_ROW = 3;
const MOVIE_RECENT_SEARCH_KEY = "mt_movie_recent_searches";
const PULL_SEARCH_TRIGGER = 104;
const PULL_SEARCH_MAX = 140;
const PULL_SEARCH_DAMPING = 0.56;

const MoviesPage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const nextPageRef = useRef(2);
  const inFlightRef = useRef(false);
  const emptyPageStreakRef = useRef(0);
  const hasMoreRef = useRef(true);
  const previewCacheRef = useRef<Map<string, string>>(new Map());
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [pullOffset, setPullOffset] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const pullStartXRef = useRef(0);
  const pullStartYRef = useRef(0);
  const pullTrackingRef = useRef(false);
  const pullActiveRef = useRef(false);
  const pullOffsetRef = useRef(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(MOVIE_RECENT_SEARCH_KEY) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAutocomplete(query);
        setSuggestions(results.slice(0, 10));
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query]);

  const persistRecent = useCallback((value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setRecentSearches((prev) => {
      const next = [normalized, ...prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 6);
      localStorage.setItem(MOVIE_RECENT_SEARCH_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const localMatches = query.trim()
    ? movies
        .filter((movie) => movie.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
    : [];

  const hydrateMoviePreviews = useCallback(async (items: Movie[]) => {
    const targets = items.filter((movie) => {
      const cached = previewCacheRef.current.get(movie.slug);
      const notRealPreview = !movie.imageUrl || movie.imageUrl === DEFAULT_ARTWORK_PREVIEW;
      return !cached && notRealPreview;
    });

    if (!targets.length) return;

    await Promise.allSettled(
      targets.map(async (movie) => {
        const preview = await getMoviePreviewImage(movie.slug);
        if (preview && preview !== DEFAULT_ARTWORK_PREVIEW) {
          previewCacheRef.current.set(movie.slug, preview);
        }
      })
    );

    setMovies((prev) =>
      prev.map((movie) => {
        const preview = previewCacheRef.current.get(movie.slug);
        return preview ? { ...movie, imageUrl: preview } : movie;
      })
    );
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await listMovies(MOVIE_SOURCE, 1);
        if (data.items.length > 0) {
          setMovies(data.items);
          void hydrateMoviePreviews(data.items);
          setHasMore(true);
          hasMoreRef.current = true;
          nextPageRef.current = 2;
          emptyPageStreakRef.current = 0;
        } else {
          setMovies([]);
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } catch {
        setMovies([]);
        setHasMore(false);
        hasMoreRef.current = false;
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [hydrateMoviePreviews]);

  const loadMore = useCallback(async (): Promise<boolean> => {
    if (inFlightRef.current || !hasMoreRef.current || nextPageRef.current > MAX_PAGES) return false;

    inFlightRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = nextPageRef.current;
      const data = await listMovies(MOVIE_SOURCE, nextPage);

      if (data.items.length > 0) {
        setMovies((prev) => {
          const bySlug = new Map(prev.map((item) => [item.slug, item]));
          data.items.forEach((item) => {
            const preview = previewCacheRef.current.get(item.slug);
            bySlug.set(item.slug, preview ? { ...item, imageUrl: preview } : item);
          });
          return Array.from(bySlug.values());
        });
        void hydrateMoviePreviews(data.items);
        emptyPageStreakRef.current = 0;
      } else {
        emptyPageStreakRef.current += 1;
      }

      nextPageRef.current = nextPage + 1;
      const shouldContinue = nextPageRef.current <= MAX_PAGES && emptyPageStreakRef.current < MAX_EMPTY_PAGES_IN_A_ROW;
      hasMoreRef.current = shouldContinue;
      setHasMore(shouldContinue);

      return data.items.length > 0;
    } catch {
      // Keep infinite scroll alive on transient failures; next trigger retries same page.
      return false;
    } finally {
      inFlightRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      { root: null, rootMargin: "1100px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const remaining = doc.scrollHeight - (window.scrollY + window.innerHeight);
      if (remaining < 900 && hasMoreRef.current && !inFlightRef.current && !loading) {
        void loadMore();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadMore, loading]);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;
    const ensureContentFilled = async () => {
      // Auto-load until at least one screen worth of content exists.
      while (!cancelled && hasMoreRef.current && !inFlightRef.current) {
        const doc = document.documentElement;
        const contentShort = doc.scrollHeight <= window.innerHeight + 120;
        if (!contentShort) break;

        const appended = await loadMore();
        if (!appended) break;
      }
    };

    void ensureContentFilled();
    return () => {
      cancelled = true;
    };
  }, [movies.length, loading, loadMore]);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      if (searchOpen) return;
      if (window.scrollY > 0) return;
      const touch = event.touches[0];
      if (!touch) return;
      pullStartXRef.current = touch.clientX;
      pullStartYRef.current = touch.clientY;
      pullTrackingRef.current = true;
      pullActiveRef.current = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!pullTrackingRef.current || searchOpen) return;
      const touch = event.touches[0];
      if (!touch) return;

      const dx = touch.clientX - pullStartXRef.current;
      const dy = touch.clientY - pullStartYRef.current;

      if (!pullActiveRef.current) {
        if (dy < 6) return;
        if (Math.abs(dx) > Math.abs(dy) * 0.9) {
          pullTrackingRef.current = false;
          return;
        }
        if (window.scrollY > 0) {
          pullTrackingRef.current = false;
          return;
        }
        pullActiveRef.current = true;
        setIsPulling(true);
      }

      const offset = Math.min(PULL_SEARCH_MAX, Math.max(0, dy * PULL_SEARCH_DAMPING));
      pullOffsetRef.current = offset;
      setPullOffset(offset);
      event.preventDefault();
    };

    const resetPull = () => {
      pullTrackingRef.current = false;
      pullActiveRef.current = false;
      setIsPulling(false);
      pullOffsetRef.current = 0;
      setPullOffset(0);
    };

    const onTouchEnd = () => {
      if (!pullTrackingRef.current && !pullActiveRef.current) return;
      const shouldOpenSearch = pullOffsetRef.current >= PULL_SEARCH_TRIGGER;
      resetPull();
      if (shouldOpenSearch) {
        setSearchOpen(true);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [searchOpen]);

  return (
    <div className="relative pb-40 min-h-screen">
      <CommandDialog
        open={searchOpen}
        onOpenChange={(open) => {
          setSearchOpen(open);
          if (!open) persistRecent(query);
        }}
      >
        <div className="bg-surface-1/95">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search songs or movies"
            className="text-[16px] h-14"
          />
          <CommandList className="max-h-[64vh] px-1 pb-2">
            <CommandEmpty
              className={`mx-2 my-2 rounded-xl bg-foreground/5 px-3 py-2.5 text-left text-[15px] text-muted-foreground ${query.trim() ? "" : "hidden"}`}
            >
              {searching ? "Searching..." : "No results found"}
            </CommandEmpty>

            {!query.trim() && recentSearches.length > 0 && (
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((term) => (
                  <CommandItem
                    key={term}
                    value={term}
                    onSelect={() => setQuery(term)}
                    className="rounded-xl py-2.5 text-[14px]"
                  >
                    <Search size={16} className="mr-2 text-muted-foreground" />
                    {term}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {query.trim() && localMatches.length > 0 && (
              <CommandGroup heading="Loaded Movies">
                {localMatches.map((movie) => (
                  <CommandItem
                    key={movie.slug}
                    value={`${movie.title} ${movie.slug}`}
                    onSelect={() => {
                      persistRecent(movie.title);
                      setSearchOpen(false);
                      navigate(`/movies/${movie.slug}`);
                    }}
                    className="rounded-xl py-2.5"
                  >
                    <Film size={16} className="mr-2 text-accent-violet" />
                    <span className="text-[15px] font-semibold truncate">{movie.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {query.trim() && suggestions.length > 0 && (
              <CommandGroup heading="All Movies">
                {suggestions.map((item) => (
                  <CommandItem
                    key={item.slug}
                    value={`${item.name} ${item.subtitle} ${item.slug}`}
                    onSelect={() => {
                      persistRecent(item.name);
                      setSearchOpen(false);
                      navigate(`/movies/${item.slug}`);
                    }}
                    className="rounded-xl py-2.5"
                  >
                    <Search size={16} className="mr-2 text-accent-violet" />
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold truncate">{item.name}</p>
                      <p className="text-[12px] text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </div>
      </CommandDialog>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-5 pt-6 max-w-lg mx-auto"
        style={{ y: pullOffset }}
        transition={{ type: "spring", stiffness: isPulling ? 1200 : 460, damping: isPulling ? 72 : 38, mass: 0.5 }}
      >
        <motion.div variants={fadeItem} className="flex items-start justify-between gap-3">
          <div>
          <h1 className="text-[36px] font-bold font-display tracking-normal uppercase text-foreground">Movies</h1>
          <p className="text-[16px] text-muted-foreground mt-1 font-normal">Browse by film</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl animate-shimmer" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {movies.map((movie) => (
                <motion.div
                  key={movie.slug}
                  variants={fadeItem}
                  onClick={() => navigate(`/movies/${movie.slug}`)}
                  className="cursor-pointer group"
                >
                  <Card className="relative aspect-square rounded-2xl overflow-hidden border-foreground/10 bg-surface-1">
                    <CachedImage src={toHighQualityImage(movie.imageUrl, 1600)} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      {movie.year && <p className="text-[13px] text-foreground/55 font-medium tabular-nums">{movie.year}</p>}
                      <p className="text-[18px] font-bold text-foreground font-display truncate mt-0.5 tracking-tight">{movie.title}</p>
                    </div>
                    <Button size="icon" variant="secondary" className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-black/45 hover:bg-black/55 text-white border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={15} fill="currentColor" className="ml-px" />
                    </Button>
                  </Card>
                  {movie.songCount && <p className="text-[14px] text-muted-foreground mt-1.5 ml-0.5 font-normal">{movie.songCount} songs</p>}
                </motion.div>
              ))}
            </div>

            {loadingMore && (
              <div className="grid grid-cols-2 gap-3 mt-3 pb-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl animate-shimmer" />
                ))}
              </div>
            )}
            {hasMore && <div ref={loadMoreRef} className="h-2 w-full" />}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MoviesPage;
