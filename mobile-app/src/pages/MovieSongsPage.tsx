import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import SongRow from "@/components/SongRow";
import { EmptyState, SkeletonSongRow } from "@/components/ui/states";
import { motion } from "framer-motion";
import { ChevronLeft, Play, Music, Shuffle, Loader2 } from "lucide-react";
import { getMovieSongs } from "@/lib/api";
import { DEFAULT_ARTWORK_WIDE, toHighQualityImage } from "@/lib/images";
import type { Song } from "@/types/music";

const fadeItem = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } } };

const MovieSongsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { play, registerSongs } = usePlayer();

  const [loading, setLoading] = useState(true);
  const [movieTitle, setMovieTitle] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getMovieSongs(slug!);
        if (!cancelled) {
          setMovieTitle(data.title);
          setSongs(data.songs);
          registerSongs(data.songs);
        }
      } catch {
        if (!cancelled) {
          setMovieTitle(slug || '');
          setSongs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug, registerSongs]);

  return (
    <div className="relative pb-40 min-h-screen overflow-y-auto scrollbar-hide">
      {/* Hero art */}
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={toHighQualityImage(songs[0]?.imageUrl || DEFAULT_ARTWORK_WIDE, 1800)}
          alt={movieTitle}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-4 w-9 h-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center z-10 active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="relative z-10 px-5 -mt-12 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-[24px] font-bold font-display text-foreground tracking-tight">{movieTitle || slug}</h1>
          <p className="text-[12px] text-muted-foreground mt-1 font-normal">
            {loading ? 'Loading...' : `${songs.length} songs`}
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonSongRow key={i} />)}
          </div>
        ) : (
          <>
            {songs.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2.5 mb-6">
                <button
                  onClick={() => play(songs[0], songs)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-[14px] active:scale-95 transition-transform"
                >
                  <Play size={15} fill="currentColor" /> Play All
                </button>
                <button
                  onClick={() => {
                    const shuffled = [...songs].sort(() => Math.random() - 0.5);
                    play(shuffled[0], shuffled);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground/8 text-foreground font-semibold text-[14px] active:scale-95 transition-transform"
                >
                  <Shuffle size={14} /> Shuffle
                </button>
              </motion.div>
            )}

            {songs.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                className="space-y-0.5"
              >
                {songs.map((song, i) => (
                  <motion.div key={song.id} variants={fadeItem}>
                    <SongRow song={song} queue={songs} index={i} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState icon={Music} title="No songs yet" subtitle="Songs for this movie haven't been added." />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MovieSongsPage;
