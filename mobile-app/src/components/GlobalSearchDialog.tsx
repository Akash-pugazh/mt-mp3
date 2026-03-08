import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Music2 } from "lucide-react";
import { searchAutocomplete } from "@/lib/api";
import { usePlayer } from "@/contexts/PlayerContext";
import type { AutocompleteItem } from "@/types/music";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const GLOBAL_RECENT_SEARCH_KEY = "mt_global_recent_searches";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const GlobalSearchDialog = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const { play, searchSongs } = usePlayer();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(GLOBAL_RECENT_SEARCH_KEY) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  const localResults = query.trim() ? searchSongs(query).slice(0, 8) : [];

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAutocomplete(query);
        setSuggestions(results.slice(0, 8));
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query]);

  const persistRecent = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setRecentSearches((prev) => {
      const next = [normalized, ...prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 6);
      localStorage.setItem(GLOBAL_RECENT_SEARCH_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) persistRecent(query);
      }}
    >
      <div className="bg-surface-1/95">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search songs or movies"
          className="text-[16px] h-14"
        />
        <CommandList className="max-h-[64vh] px-1 pb-2">
          <CommandEmpty
            className={`mx-2 my-2 rounded-xl bg-foreground/5 px-3 py-2.5 text-left text-[15px] text-muted-foreground ${query.trim() ? "" : "hidden"}`}
          >
            {searching ? "Searching..." : "No results found"}
          </CommandEmpty>

          {!query.trim() && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((term) => (
                <CommandItem
                  key={term}
                  value={term}
                  onSelect={() => setQuery(term)}
                  className="rounded-xl py-2.5 text-[14px]"
                >
                  <Search size={16} className="mr-2 text-muted-foreground" />
                  {term}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.trim() && suggestions.length > 0 && (
            <CommandGroup heading="Albums">
              {suggestions.map((item) => (
                <CommandItem
                  key={item.slug}
                  value={`${item.name} ${item.subtitle} ${item.slug}`}
                  onSelect={() => {
                    persistRecent(item.name);
                    onOpenChange(false);
                    navigate(`/movies/${item.slug}`);
                  }}
                  className="rounded-xl py-2.5"
                >
                  <Search size={16} className="mr-2 text-accent-violet" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold truncate">{item.name}</p>
                    <p className="text-[12px] text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.trim() && localResults.length > 0 && (
            <>
              {suggestions.length > 0 && <CommandSeparator />}
              <CommandGroup heading="Songs">
                {localResults.map((song) => (
                  <CommandItem
                    key={song.id}
                    value={`${song.title} ${song.artist} ${song.movie}`}
                    onSelect={() => {
                      persistRecent(query);
                      onOpenChange(false);
                      play(song, localResults);
                    }}
                    className="rounded-xl py-2.5"
                  >
                    <Music2 size={16} className="mr-2 text-accent-rose" />
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold truncate">{song.title}</p>
                      <p className="text-[12px] text-muted-foreground truncate">{song.artist} · {song.movie}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </div>
    </CommandDialog>
  );
};

export default GlobalSearchDialog;
