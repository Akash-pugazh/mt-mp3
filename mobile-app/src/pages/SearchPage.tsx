import { useState, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import SongRow from "@/components/SongRow";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { searchAutocomplete } from "@/lib/api";
import type { AutocompleteItem, Song } from "@/types/music";
import { useNavigate } from "react-router-dom";

const RECENT_SEARCH_KEY = "isai_recent_searches";

const SearchPage = () => {
  const { searchSongs } = usePlayer();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  // Local search results (from mock/loaded songs)
  const localResults = query.trim() ? searchSongs(query) : [];

  // API autocomplete
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAutocomplete(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const persistRecent = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setRecentSearches(prev => {
      const next = [normalized, ...prev.filter(item => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 8);
      localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-40 min-h-screen overflow-y-auto scrollbar-hide"
    >
      <div className="px-5 pt-6 max-w-lg mx-auto">
        <h1 className="text-[30px] font-bold font-display mb-5 text-foreground tracking-tight">Search</h1>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onBlur={() => persistRecent(query)}
            onKeyDown={e => {
              if (e.key === 'Enter') persistRecent(query);
            }}
            placeholder="Songs, artists, movies..."
            className="w-full h-12 pl-11 pr-4 rounded-full bg-foreground/[0.05] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-foreground/20 transition-all text-[16px]"
          />
          {searching && (
            <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
          )}
        </div>

        {!query.trim() && recentSearches.length > 0 && (
          <div className="mb-6">
            <p className="text-[13px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Recent</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3.5 py-1.5 rounded-full bg-foreground/[0.06] text-[14px] text-foreground/90 active:scale-95 transition-transform"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* API suggestions — album links */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-[13px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Albums</p>
            <div className="space-y-1">
              {suggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    persistRecent(item.name);
                    navigate(`/movies/${item.slug}`);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-foreground/[0.03] active:scale-[0.98] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center flex-shrink-0">
                    <Search size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[13px] text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Local song results */}
        {query.trim() && localResults.length > 0 && (
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Songs</p>
            <div className="space-y-0.5">
              {localResults.map(song => (
                <SongRow key={song.id} song={song} queue={localResults} />
              ))}
            </div>
          </div>
        )}

        {query.trim() && localResults.length === 0 && suggestions.length === 0 && !searching && (
          <p className="text-center text-muted-foreground mt-16 text-[16px]">No results found</p>
        )}

        {!query.trim() && (
          <p className="text-center text-muted-foreground/50 mt-16 text-[15px]">Type to search</p>
        )}
      </div>
    </motion.div>
  );
};

export default SearchPage;
