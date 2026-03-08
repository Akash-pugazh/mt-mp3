import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, SkipForward } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toHighQualityImage } from "@/lib/images";

const MiniPlayer = () => {
  const { currentSong, isPlaying, toggle, next, progress, duration } = usePlayer();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!currentSong || pathname === "/now-playing") return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="fixed left-2.5 right-2.5 z-40 rounded-2xl overflow-hidden bg-surface-1/90 backdrop-blur-xl border border-foreground/[0.04]"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 74px)" }}
      >
        {/* Progress line */}
        <div className="relative h-[2px] bg-foreground/5">
          <div className="h-full bg-foreground/40 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>

        <div
          className="relative flex items-center gap-3 p-2.5 cursor-pointer"
          onClick={() => navigate("/now-playing")}
        >
          <div className="relative flex-shrink-0">
            <img
              src={toHighQualityImage(currentSong.imageUrl, 500)}
              alt={currentSong.title}
              className="w-11 h-11 rounded-xl object-cover ring-1 ring-foreground/[0.06]"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate text-foreground leading-tight">{currentSong.title}</p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-normal">{currentSong.artist}</p>
          </div>

          <button
            onClick={e => { e.stopPropagation(); toggle(); }}
            className="w-9 h-9 rounded-full bg-foreground/8 flex items-center justify-center active:scale-90 transition-transform"
          >
            {isPlaying
              ? <Pause size={16} fill="currentColor" className="text-foreground" />
              : <Play size={16} fill="currentColor" className="text-foreground ml-px" />
            }
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="w-9 h-9 rounded-full bg-foreground/8 flex items-center justify-center active:scale-90 transition-transform"
          >
            <SkipForward size={14} fill="currentColor" className="text-foreground" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniPlayer;
