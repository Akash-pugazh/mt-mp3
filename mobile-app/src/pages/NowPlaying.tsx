import { usePlayer } from "@/contexts/PlayerContext";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle,
  Repeat, Repeat1, Heart, ChevronDown
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { EmptyState } from "@/components/ui/states";
import { useState, useCallback } from "react";
import SongRow from "@/components/SongRow";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const NowPlaying = () => {
  const {
    currentSong, isPlaying, toggle, next, previous,
    progress, duration, seek,
    shuffle, toggleShuffle, repeat, cycleRepeat,
    isLiked, toggleLike, queue, queueIndex,
  } = usePlayer();
  const navigate = useNavigate();
  const [showVisualizer, setShowVisualizer] = useState(false);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.x < -80) next();
    else if (info.offset.x > 80) previous();
  }, [next, previous]);

  if (!currentSong) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={Play}
          title="Nothing playing"
          subtitle="Pick a song to start listening."
          action={
            <button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-full bg-foreground text-background font-semibold text-[14px] active:scale-95 transition-transform">
              Browse Songs
            </button>
          }
        />
      </div>
    );
  }

  const liked = isLiked(currentSong.id);
  const upNext = queue.slice(queueIndex + 1, queueIndex + 4);

  return (
    <div className="relative min-h-screen bg-background overflow-y-auto scrollbar-hide">
      {/* Ambient BG */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSong.id}
            src={currentSong.imageUrl}
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
        className="relative z-10 flex flex-col min-h-screen px-6 pt-4 pb-6 max-w-lg mx-auto safe-t"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform text-foreground/60 hover:text-foreground">
            <ChevronDown size={24} />
          </button>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Now Playing</span>
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
            className="mb-6 px-1"
          >
            <h2 className="text-[26px] font-bold font-display text-foreground tracking-tight leading-[1.15]">
              {currentSong.title}
            </h2>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[14px] text-muted-foreground font-normal">
                {currentSong.artist}
              </p>
              <button onClick={() => toggleLike(currentSong.id)} className="p-1 active:scale-90 transition-transform">
                <Heart size={22} className={cn(liked ? "text-accent-rose fill-accent-rose" : "text-muted-foreground/40")} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Circular Disc */}
        <div className="flex-1 flex items-center justify-center py-2">
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
                  <img src={currentSong.imageUrl} alt={currentSong.title} className="w-full h-full object-cover" />
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

        {/* Time — centered below disc */}
        <div className="text-center mb-4">
          <span className="text-[14px] text-muted-foreground tabular-nums font-medium">{fmt(progress)}</span>
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
          <button onClick={toggleShuffle} className={cn("w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90", shuffle ? "text-foreground" : "text-muted-foreground/40")}>
            <Shuffle size={20} />
          </button>
          <button onClick={previous} className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform text-foreground/80">
            <SkipBack size={26} fill="currentColor" />
          </button>
          <button onClick={toggle} className="w-[64px] h-[64px] rounded-full bg-foreground flex items-center justify-center active:scale-95 transition-transform elevation-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={isPlaying ? "pause" : "play"}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {isPlaying
                  ? <Pause size={28} fill="currentColor" className="text-background" />
                  : <Play size={28} fill="currentColor" className="text-background ml-1" />
                }
              </motion.div>
            </AnimatePresence>
          </button>
          <button onClick={next} className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform text-foreground/80">
            <SkipForward size={26} fill="currentColor" />
          </button>
          <button onClick={cycleRepeat} className={cn("w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90", repeat !== "off" ? "text-foreground" : "text-muted-foreground/40")}>
            {repeat === "one" ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Next Songs */}
        {upNext.length > 0 && (
          <div className="mt-auto">
            <p className="text-[14px] font-semibold text-foreground/60 mb-2 px-1 font-display">Next Songs</p>
            <div className="space-y-0.5">
              {upNext.map((song) => (
                <SongRow key={song.id} song={song} queue={queue} compact />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NowPlaying;
