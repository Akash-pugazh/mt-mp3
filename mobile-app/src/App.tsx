import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import Home from "./pages/Home";
import MoviesPage from "./pages/MoviesPage";
import MovieSongsPage from "./pages/MovieSongsPage";
import LibraryPage from "./pages/LibraryPage";
import NowPlaying from "./pages/NowPlaying";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PlayerProvider>
          <div className="min-h-screen bg-background overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/:slug" element={<MovieSongsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/now-playing" element={<NowPlaying />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MiniPlayer />
            <BottomNav />
          </div>
        </PlayerProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
