import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { listMovies } from "@/lib/api";
import type { Movie } from "@/types/music";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const fadeItem = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };
const MOVIE_SOURCE = "tamil-songs";
const MAX_PAGES = 200;

const MoviesPage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stagnantPages, setStagnantPages] = useState(0);
  const [emptyPages, setEmptyPages] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await listMovies(MOVIE_SOURCE, 1);
        if (data.items.length > 0) {
          setMovies(data.items);
          setHasMore(true);
          setStagnantPages(0);
          setEmptyPages(0);
        } else {
          setMovies([]);
          setHasMore(false);
        }
      } catch {
        setMovies([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || page >= MAX_PAGES) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await listMovies(MOVIE_SOURCE, nextPage);
      if (data.items.length > 0) {
        let added = 0;
        setMovies(prev => {
          const bySlug = new Map(prev.map(item => [item.slug, item]));
          data.items.forEach(item => {
            if (!bySlug.has(item.slug)) {
              added += 1;
            }
            bySlug.set(item.slug, item);
          });
          return Array.from(bySlug.values());
        });
        setPage(nextPage);
        setEmptyPages(0);
        if (added === 0) {
          setStagnantPages(prev => {
            const next = prev + 1;
            if (next >= 8) setHasMore(false);
            return next;
          });
        } else {
          setStagnantPages(0);
          setHasMore(nextPage < MAX_PAGES);
        }
      } else {
        setPage(nextPage);
        setEmptyPages(prev => {
          const next = prev + 1;
          if (next >= 3 || nextPage >= MAX_PAGES) {
            setHasMore(false);
          }
          return next;
        });
      }
    } catch {
      // Keep infinite scroll alive on transient failures; next intersection retries.
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page]);

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
      { root: null, rootMargin: "900px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    const ensureContentFilled = () => {
      const doc = document.documentElement;
      const contentShort = doc.scrollHeight <= window.innerHeight + 80;
      if (contentShort && hasMore && !loading && !loadingMore) {
        void loadMore();
      }
    };
    const id = window.setTimeout(ensureContentFilled, 50);
    return () => window.clearTimeout(id);
  }, [movies.length, hasMore, loading, loadingMore, loadMore]);

  return (
    <div className="relative pb-40 min-h-screen overflow-y-auto scrollbar-hide">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-5 pt-6 max-w-lg mx-auto"
      >
        <motion.div variants={fadeItem}>
          <h1 className="text-[30px] font-bold font-display tracking-tight text-foreground">Movies</h1>
          <p className="text-[14px] text-muted-foreground mt-1 font-normal">Browse by film</p>
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
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      {movie.year && <p className="text-[12px] text-foreground/40 font-medium tabular-nums">{movie.year}</p>}
                      <p className="text-[17px] font-bold text-foreground font-display truncate mt-0.5 tracking-tight">{movie.title}</p>
                    </div>
                    <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={13} fill="currentColor" className="text-white ml-px" />
                    </div>
                  </div>
                  {movie.songCount && <p className="text-[13px] text-muted-foreground mt-1.5 ml-0.5 font-normal">{movie.songCount} songs</p>}
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