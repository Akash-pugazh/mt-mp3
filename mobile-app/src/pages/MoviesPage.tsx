import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
import { listMovies } from "@/lib/api";
import { mockMovies } from "@/data/mockData";
import type { Movie } from "@/types/music";
import { SkeletonMovieCard } from "@/components/ui/states";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const fadeItem = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };

const MoviesPage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await listMovies('latest-updates', 1);
        if (data.items.length > 0) {
          setMovies(data.items);
          setHasMore(data.items.length >= 20);
        } else {
          setMovies(mockMovies);
          setHasMore(false);
        }
      } catch {
        setMovies(mockMovies);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await listMovies('latest-updates', nextPage);
      if (data.items.length > 0) {
        setMovies(prev => [...prev, ...data.items]);
        setPage(nextPage);
        setHasMore(data.items.length >= 20);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="relative pb-40 min-h-screen overflow-y-auto scrollbar-hide">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-5 pt-6 max-w-lg mx-auto"
      >
        <motion.div variants={fadeItem}>
          <h1 className="text-[26px] font-bold font-display tracking-tight text-foreground">Movies</h1>
          <p className="text-[12px] text-muted-foreground mt-1 font-normal">Browse by film</p>
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
                      {movie.year && <p className="text-[10px] text-foreground/40 font-medium tabular-nums">{movie.year}</p>}
                      <p className="text-[15px] font-bold text-foreground font-display truncate mt-0.5 tracking-tight">{movie.title}</p>
                    </div>
                    <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={13} fill="currentColor" className="text-white ml-px" />
                    </div>
                  </div>
                  {movie.songCount && <p className="text-[11px] text-muted-foreground mt-1.5 ml-0.5 font-normal">{movie.songCount} songs</p>}
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full mt-6 py-3 rounded-full bg-foreground/6 text-[14px] font-semibold text-foreground/60 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                {loadingMore && <Loader2 size={16} className="animate-spin" />}
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MoviesPage;
