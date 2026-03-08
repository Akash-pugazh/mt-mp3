import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, SkipForward } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toHighQualityImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import CachedImage from "@/components/CachedImage";

const MiniPlayer = () => {
  const { currentSong, isPlaying, toggle, next, progress, duration } = usePlayer();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!currentSong || pathname === "/now-playing") return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 90, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="fixed bottom-0 left-0 right-0 z-50 h-[90px] overflow-hidden bg-surface-0/96 backdrop-blur-xl border-t border-foreground/[0.08] safe-b"
      >
        {/* Progress line */}
        <div className="relative h-[2px] bg-foreground/5">
          <div className="h-full bg-foreground/40 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>

        <div
          className="relative h-[calc(100%-2px)] max-w-lg mx-auto flex items-center gap-3 px-3 py-2 cursor-pointer"
          onClick={() => navigate("/now-playing")}
        >
          <div className="relative flex-shrink-0">
            <CachedImage
              src={toHighQualityImage(currentSong.imageUrl, 900)}
              alt={currentSong.title}
              className="w-12 h-12 rounded-xl object-cover ring-1 ring-foreground/[0.06]"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold truncate text-foreground leading-tight">{currentSong.title}</p>
            <p className="text-[12px] text-muted-foreground truncate mt-0.5 font-normal">{currentSong.artist}</p>
          </div>

          <Button
            onClick={e => { e.stopPropagation(); toggle(); }}
            size="icon"
            variant="secondary"
            className="w-11 h-11 rounded-full bg-foreground/10 border border-foreground/10 active:scale-90 transition-transform"
          >
            {isPlaying
              ? <Pause size={19} fill="currentColor" className="text-foreground" />
              : <Play size={19} fill="currentColor" className="text-foreground ml-px" />
            }
          </Button>
          <Button
            onClick={e => { e.stopPropagation(); next(); }}
            size="icon"
            variant="secondary"
            className="w-11 h-11 rounded-full bg-foreground/10 border border-foreground/10 active:scale-90 transition-transform hover:bg-foreground/10 active:bg-foreground/10 focus-visible:bg-foreground/10"
          >
            <SkipForward size={18} fill="currentColor" className="text-foreground" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniPlayer;
