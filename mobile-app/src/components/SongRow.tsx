import { Song } from "@/types/music";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Heart, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { WaveformIndicator } from "@/components/ui/states";
import { toHighQualityImage } from "@/lib/images";
import CachedImage from "@/components/CachedImage";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

interface SongRowProps {
  song: Song;
  queue?: Song[];
  index?: number;
  compact?: boolean;
}

const SongRow = ({ song, queue, index, compact = false }: SongRowProps) => {
  const { play, currentSong, isPlaying, toggle, isLiked, toggleLike, playlists, addToPlaylist, prefetchSong } = usePlayer();
  const navigate = useNavigate();
  const active = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl transition-all duration-200 group cursor-pointer",
        compact ? "p-2" : "p-2.5",
        active
          ? "bg-foreground/[0.04]"
          : "hover:bg-foreground/[0.03] active:scale-[0.98]"
      )}
      onClick={() => {
        if (active) {
          toggle();
          navigate("/now-playing");
          return;
        }
        play(song, queue);
        navigate("/now-playing");
      }}
      onPointerDown={() => prefetchSong(song)}
    >
      {/* Cover art */}
      <div className={cn(
        "relative rounded-lg overflow-hidden flex-shrink-0",
        compact ? "w-10 h-10" : "w-12 h-12"
      )}>
        <CachedImage
          src={toHighQualityImage(song.imageUrl, 900)}
          alt={song.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className={cn(
          "absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-200",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {active && isPlaying ? (
            <WaveformIndicator isPlaying={true} />
          ) : (
            <Play size={compact ? 15 : 18} fill="currentColor" className="text-white ml-0.5" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-semibold truncate leading-tight",
          compact ? "text-[14px]" : "text-[15px]",
          active ? "text-foreground" : "text-foreground/90"
        )}>
          {song.title}
        </p>
        <p className={cn(
          "text-muted-foreground truncate mt-0.5 font-normal",
          compact ? "text-[12px]" : "text-[13px]"
        )}>
          {song.artist}
        </p>
      </div>

      {/* Duration */}
      {!compact && typeof song.duration === "number" && song.duration > 0 && (
        <span className="text-[11px] text-muted-foreground/40 tabular-nums font-medium shrink-0">
          {fmt(song.duration)}
        </span>
      )}

      {/* Menu */}
      {!compact && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <button className="p-1 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
              <MoreHorizontal size={16} className="text-muted-foreground/40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass border-border/20 rounded-xl min-w-[160px]">
            <DropdownMenuItem className="rounded-lg text-[13px]" onClick={e => { e.stopPropagation(); toggleLike(song.id); }}>
              <Heart size={14} className="mr-2" fill={liked ? "currentColor" : "none"} />
              {liked ? "Unlike" : "Like"}
            </DropdownMenuItem>
            {playlists.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-lg text-[13px]">
                  <Plus size={14} className="mr-2" /> Add to playlist
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="glass border-border/20 rounded-xl">
                  {playlists.map(pl => (
                    <DropdownMenuItem key={pl.id} className="rounded-lg text-[13px]" onClick={e => { e.stopPropagation(); addToPlaylist(pl.id, song.id); }}>
                      {pl.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default SongRow;
