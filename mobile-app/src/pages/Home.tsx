import { usePlayer } from "@/contexts/PlayerContext";
import SongRow from "@/components/SongRow";
import { SectionHeader, SkeletonSongRow, SkeletonHero } from "@/components/ui/states";
import { motion } from "framer-motion";
import { Play, TrendingUp, WifiOff, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { listMovies, getMovieSongs } from "@/lib/api";
import { toHighQualityImage } from "@/lib/images";
import type { Song } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CachedImage from "@/components/CachedImage";
import GlobalSearchDialog from "@/components/GlobalSearchDialog";
import { usePullToSearch } from "@/hooks/usePullToSearch";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const fadeItem = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };

const Home = () => {
  const { allSongs, play, registerSongs } = usePlayer();
  const [apiSongs, setApiSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pullOffset, isPulling } = usePullToSearch(searchOpen, () => setSearchOpen(true));

  // Try to load from API, fall back to mock
  useEffect(() => {
    let cancelled = false;
    async function loadFromApi() {
      try {
        setLoading(true);
        const moviesData = await listMovies('latest-updates', 1);
        if (cancelled) return;
        
        if (moviesData.items.length > 0) {
          // Load songs from first few movies
          const songResults = await Promise.allSettled(
            moviesData.items.slice(0, 3).map(m => getMovieSongs(m.slug))
          );
          
          const songs: Song[] = [];
          songResults.forEach(r => {
            if (r.status === 'fulfilled') songs.push(...r.value.songs);
          });
          
          if (!cancelled && songs.length > 0) {
            setApiSongs(songs);
            registerSongs(songs);
            setIsOnline(true);
          }
        }
      } catch {
        setIsOnline(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    loadFromApi();
    return () => { cancelled = true; };
  }, [registerSongs]);

  const songs = apiSongs.length > 0 ? apiSongs : allSongs;
  const hero = songs[0];
  const trending = songs;

  return (
    <div className="relative pb-40 min-h-screen overflow-y-auto scrollbar-hide">
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-lg mx-auto"
        style={{ y: pullOffset }}
        transition={{ type: "spring", stiffness: isPulling ? 1200 : 460, damping: isPulling ? 72 : 38, mass: 0.5 }}
      >
        {/* Header */}
        <motion.div variants={fadeItem} className="px-5 pt-6 pb-1">
          <div className="flex items-center justify-end">
            {!isOnline && <WifiOff size={11} className="text-muted-foreground/50" />}
          </div>
          <h1 className="text-[34px] font-bold font-display mt-0.5 tracking-normal uppercase text-foreground">MT-MP3 MUSIC</h1>
          <button
            onClick={() => setSearchOpen(true)}
            className="relative mt-3 w-full h-12 px-5 rounded-2xl text-muted-foreground text-[14px] bg-foreground/[0.06] backdrop-blur-xl border border-foreground/[0.14] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.12)]"
          >
            <Search size={17} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          </button>
        </motion.div>

        {/* Loading */}
        {loading && apiSongs.length === 0 && (
          <motion.div variants={fadeItem} className="px-5 mt-5 space-y-3">
            <SkeletonHero />
            <SkeletonSongRow />
            <SkeletonSongRow />
            <SkeletonSongRow />
          </motion.div>
        )}

        {/* Hero */}
        {hero && !loading && (
          <motion.div variants={fadeItem} className="px-5 mt-5">
            <Card
              className="relative rounded-2xl overflow-hidden cursor-pointer group border-foreground/10 bg-surface-1"
              onClick={() => play(hero, songs)}
            >
              <div className="aspect-[2/1] relative">
                <CachedImage src={toHighQualityImage(hero.imageUrl, 2200)} alt={hero.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <Badge variant="secondary" className="mb-2 text-[10px] uppercase tracking-[0.16em] bg-foreground/10 text-foreground border-foreground/10">Featured</Badge>
                  <h2 className="text-[20px] font-bold text-foreground font-display leading-tight tracking-tight">{hero.title}</h2>
                  <p className="text-[14px] text-foreground/60 mt-1 font-normal">{hero.artist} · {hero.movie}</p>
                </div>
                <Button size="icon" className="absolute bottom-4 right-4 w-12 h-12 rounded-full group-hover:scale-110 transition-transform">
                  <Play size={20} fill="currentColor" className="text-background ml-0.5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Trending */}
        {!loading && (
          <motion.div variants={fadeItem} className="mt-7 px-5">
            <SectionHeader title="Trending Now" icon={TrendingUp} />
            <div className="space-y-0.5">
              {trending.map((song, i) => (
                <motion.div key={song.id} variants={fadeItem}>
                  <SongRow song={song} queue={songs} index={i} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
