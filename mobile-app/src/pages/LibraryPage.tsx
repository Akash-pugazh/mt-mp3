import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import SongRow from "@/components/SongRow";
import { EmptyState, SectionHeader } from "@/components/ui/states";
import { Plus, Trash2, Music, ChevronLeft, Heart, ListMusic, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import GlobalSearchDialog from "@/components/GlobalSearchDialog";
import { usePullToSearch } from "@/hooks/usePullToSearch";

const fadeItem = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } } };

const LibraryPage = () => {
  const { playlists, createPlaylist, deletePlaylist, getPlaylistSongs, likedIds, allSongs } = usePlayer();
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [view, setView] = useState<"main" | "liked" | string>("main");
  const { pullOffset, isPulling } = usePullToSearch(searchOpen, () => setSearchOpen(true));

  const handleCreate = () => {
    if (newName.trim()) { createPlaylist(newName.trim()); setNewName(""); setOpen(false); }
  };

  const likedSongs = allSongs.filter(s => likedIds.includes(s.id));

  // Detail view
  if (view !== "main" && view !== "liked") {
    const pl = playlists.find(p => p.id === view);
    const songs = pl ? getPlaylistSongs(pl.id) : [];
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="pb-40 min-h-screen overflow-y-auto scrollbar-hide" style={{ y: pullOffset }}>
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        <div className="px-5 pt-6 max-w-lg mx-auto">
          <button onClick={() => setView("main")} className="flex items-center gap-1 text-muted-foreground text-[13px] font-medium mb-4 active:opacity-60">
            <ChevronLeft size={16} /> Library
          </button>
          <h1 className="text-[22px] font-bold font-display text-foreground tracking-normal uppercase">{pl?.name}</h1>
          <p className="text-[12px] text-muted-foreground mt-1 mb-5 font-normal">{songs.length} songs</p>
          {songs.length > 0 ? (
            <div className="space-y-0.5">{songs.map((s, i) => <SongRow key={s.id} song={s} queue={songs} index={i} />)}</div>
          ) : (
            <EmptyState icon={Music} title="Empty playlist" subtitle="Add songs from any song's menu." />
          )}
        </div>
      </motion.div>
    );
  }

  // Liked view
  if (view === "liked") {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="pb-40 min-h-screen overflow-y-auto scrollbar-hide" style={{ y: pullOffset }}>
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        <div className="px-5 pt-6 max-w-lg mx-auto">
          <button onClick={() => setView("main")} className="flex items-center gap-1 text-muted-foreground text-[13px] font-medium mb-4 active:opacity-60">
            <ChevronLeft size={16} /> Library
          </button>
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-[48px] h-[48px] rounded-full gradient-warm flex items-center justify-center">
              <Heart size={20} className="text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-[22px] font-bold font-display text-foreground tracking-normal uppercase">Liked Songs</h1>
              <p className="text-[12px] text-muted-foreground font-normal">{likedSongs.length} songs</p>
            </div>
          </div>
          {likedSongs.length > 0 ? (
            <div className="space-y-0.5">{likedSongs.map((s, i) => <SongRow key={s.id} song={s} queue={likedSongs} index={i} />)}</div>
          ) : (
            <EmptyState icon={Heart} title="No liked songs" subtitle="Tap the heart on any song to save it." />
          )}
        </div>
      </motion.div>
    );
  }

  // Main library
  return (
    <div className="relative pb-40 min-h-screen overflow-y-auto scrollbar-hide">
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="relative z-10 px-5 pt-6 max-w-lg mx-auto"
        style={{ y: pullOffset }}
        transition={{ type: "spring", stiffness: isPulling ? 1200 : 460, damping: isPulling ? 72 : 38, mass: 0.5 }}
      >
        <motion.div variants={fadeItem} className="flex items-center justify-between mb-6">
          <h1 className="text-[32px] font-bold font-display tracking-normal uppercase text-foreground">Library</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-foreground/6 flex items-center justify-center active:scale-90 transition-transform">
                <Plus size={20} />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-surface-2 border-foreground/[0.06] rounded-2xl mx-4 max-w-sm">
              <DialogHeader><DialogTitle className="font-display text-[16px] tracking-tight font-bold">New Playlist</DialogTitle></DialogHeader>
              <input
                value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Playlist name"
                className="w-full h-11 px-4 rounded-xl bg-surface-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-foreground/20 transition-all text-[14px]"
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <Button onClick={handleCreate} className="rounded-full h-10 bg-foreground text-background font-semibold text-[14px] hover:bg-foreground/90">
                Create
              </Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Liked Songs */}
        <motion.div
          variants={fadeItem}
          onClick={() => setView("liked")}
          className="flex items-center gap-3.5 p-3 rounded-xl bg-foreground/[0.03] mb-3 cursor-pointer group active:scale-[0.98] transition-transform"
        >
          <div className="w-[44px] h-[44px] rounded-full gradient-warm flex items-center justify-center flex-shrink-0">
            <Heart size={18} className="text-white" fill="currentColor" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-foreground">Liked Songs</p>
            <p className="text-[12px] text-muted-foreground font-normal">{likedSongs.length} songs</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground/30" />
        </motion.div>

        {/* Playlists */}
        {playlists.length === 0 ? (
          <motion.div variants={fadeItem} className="mt-4">
            <EmptyState icon={ListMusic} title="No playlists" subtitle="Create a playlist to organize your music." />
          </motion.div>
        ) : (
          <motion.div variants={fadeItem}>
            <SectionHeader title="Playlists" className="mt-3" />
            <div className="space-y-1">
              {playlists.map(pl => (
                <div
                  key={pl.id}
                  className="flex items-center gap-3.5 p-3 rounded-xl bg-foreground/[0.02] cursor-pointer group active:scale-[0.98] transition-transform"
                  onClick={() => setView(pl.id)}
                >
                  <div className="w-[40px] h-[40px] rounded-full bg-surface-3 flex items-center justify-center flex-shrink-0">
                    <Music size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-foreground truncate">{pl.name}</p>
                    <p className="text-[12px] text-muted-foreground font-normal">{pl.songIds.length} songs</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deletePlaylist(pl.id); }}
                    className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 size={14} className="text-muted-foreground" />
                  </button>
                  <ChevronRight size={14} className="text-muted-foreground/20" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LibraryPage;
