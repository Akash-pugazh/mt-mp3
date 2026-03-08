import { usePlayer } from "@/contexts/PlayerContext";
import SongRow from "@/components/SongRow";
import { SectionHeader, SkeletonSongRow, SkeletonHero } from "@/components/ui/states";
import { motion } from "framer-motion";
import { Play, TrendingUp, Clock, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { listMovies, getMovieSongs } from "@/lib/api";
import type { Song, Movie } from "@/types/music";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const fadeItem = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };

const Home = () => {
  const { allSongs, play, registerSongs } = usePlayer();
  const [apiSongs, setApiSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

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
  const quickPicks = songs.slice(1, 6);
  const trending = songs;

  return (
    <div className="relative pb-40 min-h-screen overflow-y-auto scrollbar-hide">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-lg mx-auto"
      >
        {/* Header */}
        <motion.div variants={fadeItem} className="px-5 pt-6 pb-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Tamil Music</p>
            {!isOnline && <WifiOff size={10} className="text-muted-foreground/40" />}
          </div>
          <h1 className="text-[26px] font-bold font-display mt-0.5 tracking-tight text-foreground">
            Isai
          </h1>
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
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => play(hero, songs)}
            >
              <div className="aspect-[2/1] relative">
                <img src={hero.imageUrl} alt={hero.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40 mb-1.5">Featured</p>
                  <h2 className="text-[20px] font-bold text-foreground font-display leading-tight tracking-tight">{hero.title}</h2>
                  <p className="text-[13px] text-foreground/50 mt-1 font-normal">{hero.artist} · {hero.movie}</p>
                </div>
                <button className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={18} fill="currentColor" className="text-background ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Picks */}
        {!loading && (
          <motion.div variants={fadeItem} className="mt-7">
            <div className="px-5">
              <SectionHeader title="Quick Picks" icon={Clock} />
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-1">
              {quickPicks.map(song => (
                <button
                  key={song.id}
                  onClick={() => play(song, songs)}
                  className="flex-shrink-0 w-[130px] text-left group"
                >
                  <div className="relative w-[130px] h-[130px] rounded-2xl overflow-hidden mb-2">
                    <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-foreground/90 flex items-center justify-center">
                        <Play size={14} fill="currentColor" className="text-background ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] font-semibold truncate text-foreground leading-tight">{song.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-normal">{song.artist}</p>
                </button>
              ))}
            </div>
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
