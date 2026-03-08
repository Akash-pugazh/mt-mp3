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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CachedImage from "@/components/CachedImage";
import GlobalSearchDialog from "@/components/GlobalSearchDialog";
import { usePullToSearch } from "@/hooks/usePullToSearch";

const fadeItem = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } } };

const MovieSongsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { play, registerSongs } = usePlayer();

  const [loading, setLoading] = useState(true);
  const [movieTitle, setMovieTitle] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pullOffset, isPulling } = usePullToSearch(searchOpen, () => setSearchOpen(true));

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
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      {/* Hero art */}
      <div className="relative h-[220px] overflow-hidden">
        <CachedImage
          src={toHighQualityImage(songs[0]?.imageUrl || DEFAULT_ARTWORK_WIDE, 2200)}
          alt={movieTitle}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <Button
          onClick={() => navigate(-1)}
          size="icon"
          variant="secondary"
          className="absolute top-5 left-4 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm z-10 active:scale-90 transition-transform border border-foreground/10"
        >
          <ChevronLeft size={22} />
        </Button>
      </div>

      <motion.div
        className="relative z-10 px-5 -mt-12 max-w-lg mx-auto"
        style={{ y: pullOffset }}
        transition={{ type: "spring", stiffness: isPulling ? 1200 : 460, damping: isPulling ? 72 : 38, mass: 0.5 }}
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <h1 className="text-[28px] font-bold font-display text-foreground tracking-normal uppercase">{movieTitle || slug}</h1>
            <p className="text-[13px] text-muted-foreground mt-1 font-normal">
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
                <Button
                  onClick={() => play(songs[0], songs)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[15px] active:scale-95 transition-transform"
                >
                  <Play size={17} fill="currentColor" /> Play All
                </Button>
                <Button
                  onClick={() => {
                    const shuffled = [...songs].sort(() => Math.random() - 0.5);
                    play(shuffled[0], shuffled);
                  }}
                  variant="secondary"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[15px] active:scale-95 transition-transform border border-foreground/10"
                >
                  <Shuffle size={16} /> Shuffle
                </Button>
              </motion.div>
            )}

            {songs.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              >
                <Card className="space-y-0.5 border-foreground/10 bg-surface-1/60 p-1.5 rounded-2xl">
                  {songs.map((song, i) => (
                    <motion.div key={song.id} variants={fadeItem}>
                      <SongRow song={song} queue={songs} index={i} />
                    </motion.div>
                  ))}
                </Card>
              </motion.div>
            ) : (
              <EmptyState icon={Music} title="No songs yet" subtitle="Songs for this movie haven't been added." />
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MovieSongsPage;
