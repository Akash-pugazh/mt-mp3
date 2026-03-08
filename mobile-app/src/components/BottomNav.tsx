import { Home, Film, Library, Disc3, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/movies", icon: Film, label: "Movies" },
  { path: "/library", icon: Library, label: "Library" },
  { path: "/now-playing", icon: Disc3, label: "Player" },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentSong, isPlaying } = usePlayer();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[74px] bg-surface-0/95 backdrop-blur-xl border-t border-foreground/[0.04] safe-b">
      <div className="flex h-full items-center justify-around max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || (path === "/movies" && pathname.startsWith("/movies"));
          const isPlayerTab = path === "/now-playing";

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all duration-200 min-w-[64px]",
                active ? "text-foreground" : "text-muted-foreground active:text-foreground/60"
              )}
            >
              <Icon
                size={active ? 22 : 20}
                strokeWidth={active ? 2.2 : 1.5}
                className={cn(
                  "transition-all duration-200",
                  isPlayerTab && isPlaying && currentSong && "text-accent-rose"
                )}
              />
              <span className={cn(
                "text-[10px] tracking-wide",
                active ? "font-semibold" : "font-medium"
              )}>
                {label}
              </span>
              {isPlayerTab && currentSong && !active && (
                <span className="absolute top-1.5 right-4 w-[5px] h-[5px] rounded-full bg-accent-rose" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
