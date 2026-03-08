import { Home, Film, Library, Disc3 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/movies", icon: Film, label: "Movies" },
  { path: "/library", icon: Library, label: "Library" },
  { path: "/now-playing", icon: Disc3, label: "Player" },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentSong, isPlaying } = usePlayer();
  const hideForPlayer = Boolean(currentSong) && pathname !== "/now-playing";

  if (hideForPlayer) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[90px] bg-surface-0/96 backdrop-blur-xl border-t border-foreground/[0.08] safe-b">
      <div className="grid grid-cols-4 h-full w-full max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || (path === "/movies" && pathname.startsWith("/movies"));
          const isPlayerTab = path === "/now-playing";

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              type="button"
              className={cn(
                "relative h-full w-full p-0 overflow-visible rounded-none transition-all duration-300 bg-transparent border-0 outline-none",
                active ? "text-foreground" : "text-foreground/45 active:text-foreground/70"
              )}
              aria-label={label}
              title={label}
            >
              <motion.span
                animate={{
                  scale: active ? 1.08 : 1,
                  filter: active ? "drop-shadow(0 0 10px hsl(var(--foreground) / 0.45))" : "drop-shadow(0 0 0 transparent)",
                }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center justify-center"
              >
                <Icon
                  style={{ width: active ? 24 : 20, height: active ? 24 : 20 }}
                  strokeWidth={active ? 2.35 : 1.9}
                  className={cn(
                    "transition-colors duration-300",
                    isPlayerTab && isPlaying && currentSong && !active && "text-accent-rose"
                  )}
                />
              </motion.span>
              {isPlayerTab && currentSong && !active && (
                <span className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full bg-accent-rose" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
