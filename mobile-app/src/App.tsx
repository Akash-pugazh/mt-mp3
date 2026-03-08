import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
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

const AndroidBackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    const attach = async () => {
      const listener = await CapacitorApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack || window.history.length > 1) {
          window.history.back();
          return;
        }
        if (location.pathname !== "/") {
          navigate("/");
        }
      });
      cleanup = () => {
        void listener.remove();
      };
    };

    void attach();
    return () => cleanup?.();
  }, [navigate, location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PlayerProvider>
          <AndroidBackHandler />
          <div className="min-h-screen bg-background">
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
