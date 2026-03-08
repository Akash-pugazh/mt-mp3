import { usePlayer } from "@/contexts/PlayerContext";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle,
  Repeat, Heart, ChevronDown
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { EmptyState } from "@/components/ui/states";
import { useState, useCallback, useEffect } from "react";
import SongRow from "@/components/SongRow";
import { toHighQualityImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CachedImage from "@/components/CachedImage";
import { getCachedImageSrc } from "@/lib/image-cache";
import GlobalSearchDialog from "@/components/GlobalSearchDialog";
import { usePullToSearch } from "@/hooks/usePullToSearch";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const NowPlaying = () => {
  const {
    currentSong, isPlaying, toggle, next, previous,
    progress, duration, seek,
    shuffle, toggleShuffle, repeat, toggleRepeat,
    isLiked, toggleLike, queue, queueIndex,
  } = usePlayer();
  const navigate = useNavigate();
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [cachedArtworkSrc, setCachedArtworkSrc] = useState<string>("");
  const [heartBurstKey, setHeartBurstKey] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pullOffset } = usePullToSearch(searchOpen, () => setSearchOpen(true));

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.x < -80) next();
    else if (info.offset.x > 80) previous();
  }, [next, previous]);

  if (!currentSong) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        <EmptyState
          icon={Play}
          title="Nothing playing"
          subtitle="Pick a song to start listening."
          action={
            <Button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-full text-[15px] active:scale-95 transition-transform">
              Browse Songs
            </Button>
          }
        />
      </div>
    );
  }

  const liked = isLiked(currentSong.id);
  const upNext = queue.slice(queueIndex + 1);
  const artworkSource = toHighQualityImage(currentSong.imageUrl, 2200);

  useEffect(() => {
    let cancelled = false;
    setCachedArtworkSrc(artworkSource);
    void getCachedImageSrc(artworkSource)
      .then((cached) => {
        if (!cancelled) setCachedArtworkSrc(cached || artworkSource);
      })
      .catch(() => {
        if (!cancelled) setCachedArtworkSrc(artworkSource);
      });
    return () => {
      cancelled = true;
    };
  }, [artworkSource]);

  return (
    <div className="relative min-h-screen bg-background overflow-y-auto scrollbar-hide">
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      {/* Ambient BG */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSong.id}
            src={cachedArtworkSrc}
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{ opacity: 0.12, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover blur-[100px]"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 px-6 pt-4 pb-40 max-w-lg mx-auto safe-t"
        style={{ y: pullOffset }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => navigate(-1)} size="icon" variant="ghost" className="w-11 h-11 rounded-full text-foreground/75 hover:text-foreground active:scale-90">
            <ChevronDown size={26} />
          </Button>
          <span className="text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">Now Playing</span>
          <div className="w-10" />
        </div>

        {/* Song Info — above artwork */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSong.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mb-6 px-1 min-h-[74px]"
          >
            <h2 className="text-[26px] font-bold font-display text-foreground tracking-tight leading-[1.15] truncate">
              {currentSong.title}
            </h2>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[14px] text-muted-foreground font-normal">
                {currentSong.artist}
              </p>
              <div className="relative">
                <Button
                  onClick={() => {
                    toggleLike(currentSong.id);
                    setHeartBurstKey((k) => k + 1);
                  }}
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 rounded-full active:scale-90 hover:bg-transparent active:bg-transparent focus-visible:bg-transparent data-[state=open]:bg-transparent"
                >
                  <motion.div
                    key={liked ? `liked-${heartBurstKey}` : `idle-${heartBurstKey}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: liked ? [1, 1.2, 1.04, 1] : [1, 0.92, 1] }}
                    transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Heart size={24} className={cn(liked ? "text-accent-rose fill-accent-rose" : "text-muted-foreground/40")} />
                  </motion.div>
                </Button>
                <AnimatePresence>
                  {liked && (
                    <motion.div
                      key={`burst-${heartBurstKey}`}
                      initial={{ opacity: 0.8, scale: 0.6 }}
                      animate={{ opacity: 0, scale: 1.45 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className="pointer-events-none absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, hsl(var(--accent-rose)/0.35) 0%, hsl(var(--accent-violet)/0.3) 42%, hsl(var(--accent-gold)/0.24) 68%, transparent 76%)",
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Circular Disc */}
        <div className="h-[360px] flex items-center justify-center py-2">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            style={{ x, opacity }}
            className="relative cursor-grab active:cursor-grabbing"
            onClick={() => setShowVisualizer(v => !v)}
          >
            <div className={cn(
              "absolute -inset-3 rounded-full transition-opacity duration-1000",
              isPlaying ? "opacity-100" : "opacity-40"
            )}
              style={{ background: 'radial-gradient(circle, transparent 55%, hsl(var(--foreground) / 0.04) 60%, transparent 70%)' }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSong.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className={cn(
                  "w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full overflow-hidden disc-ring",
                  isPlaying && !showVisualizer && "animate-disc"
                )}
                  style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                >
                  <div className="absolute inset-0 rounded-full" style={{
                    background: `
                      radial-gradient(circle, transparent 30%, hsl(var(--foreground) / 0.03) 31%, transparent 32%),
                      radial-gradient(circle, transparent 45%, hsl(var(--foreground) / 0.02) 46%, transparent 47%),
                      radial-gradient(circle, transparent 60%, hsl(var(--foreground) / 0.03) 61%, transparent 62%)
                    `
                  }} />
                  <CachedImage
                    src={artworkSource}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border-2 border-foreground/5" />

                  {showVisualizer && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-end justify-center gap-[3px] pb-16 rounded-full">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[3px] bg-foreground/50 rounded-full"
                          style={{
                            height: `${10 + Math.random() * 35}%`,
                            animation: `waveform ${0.4 + Math.random() * 0.4}s ease-in-out ${i * 0.04}s infinite alternate`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Progress */}
        <div className="mb-5 px-1">
          <Slider
            value={[progress]}
            max={duration || 1}
            step={0.1}
            onValueChange={([v]) => seek(v)}
            className="cursor-pointer [&_[data-radix-slider-track]]:h-[3px] [&_[data-radix-slider-track]]:bg-foreground/8 [&_[data-radix-slider-range]]:bg-foreground/60 [&_[data-radix-slider-thumb]]:w-[0px] [&_[data-radix-slider-thumb]]:h-[0px] [&_[data-radix-slider-thumb]]:opacity-0 hover:[&_[data-radix-slider-thumb]]:w-[12px] hover:[&_[data-radix-slider-thumb]]:h-[12px] hover:[&_[data-radix-slider-thumb]]:opacity-100 [&_[data-radix-slider-thumb]]:bg-foreground [&_[data-radix-slider-thumb]]:border-0 [&_[data-radix-slider-thumb]]:transition-all"
          />
          <div className="flex justify-between mt-1.5 px-px">
            <span className="text-[11px] text-muted-foreground/40 tabular-nums font-medium">{fmt(progress)}</span>
            <span className="text-[11px] text-muted-foreground/40 tabular-nums font-medium">{fmt(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between mb-6 px-4">
          <Button
            onClick={toggleShuffle}
            size="icon"
            variant="ghost"
            className={cn(
              "w-12 h-12 rounded-2xl transition-all active:scale-90 hover:bg-transparent active:bg-transparent focus-visible:bg-transparent",
              shuffle ? "text-foreground" : "text-muted-foreground/40"
            )}
          >
            <Shuffle size={22} />
          </Button>
          <Button onClick={previous} size="icon" variant="ghost" className="w-12 h-12 rounded-2xl active:scale-90 text-foreground/90 hover:bg-transparent active:bg-transparent focus-visible:bg-transparent">
            <SkipBack size={28} fill="currentColor" />
          </Button>
          <Button onClick={toggle} size="icon" className="w-[68px] h-[68px] rounded-[1.1rem] active:scale-95 transition-transform elevation-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={isPlaying ? "pause" : "play"}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {isPlaying
                  ? <Pause size={30} fill="currentColor" className="text-background" />
                  : <Play size={30} fill="currentColor" className="text-background ml-1" />
                }
              </motion.div>
            </AnimatePresence>
          </Button>
          <Button onClick={next} size="icon" variant="ghost" className="w-12 h-12 rounded-2xl active:scale-90 text-foreground/90 hover:bg-transparent active:bg-transparent focus-visible:bg-transparent">
            <SkipForward size={28} fill="currentColor" />
          </Button>
          <Button
            onClick={toggleRepeat}
            size="icon"
            variant="ghost"
            className={cn(
              "w-12 h-12 rounded-2xl transition-all active:scale-90 hover:bg-transparent active:bg-transparent focus-visible:bg-transparent",
              repeat !== "off" ? "text-foreground" : "text-muted-foreground/40"
            )}
          >
            <Repeat size={22} />
          </Button>
        </div>

        {/* Next Songs */}
        <div className="mt-2">
          <p className="text-[14px] font-semibold text-foreground/60 mb-2 px-1 font-display">Next Songs</p>
          {upNext.length > 0 ? (
            <Card className="space-y-0.5 border-foreground/10 bg-surface-1/60 p-1.5 rounded-2xl">
              {upNext.map((song) => (
                <SongRow key={song.id} song={song} queue={queue} compact />
              ))}
            </Card>
          ) : (
            <div className="rounded-xl border border-foreground/10 px-3 py-4 text-[12px] text-muted-foreground">
              No more songs in queue
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NowPlaying;
