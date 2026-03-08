import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import Home from "./pages/Home";
import MoviesPage from "./pages/MoviesPage";
import MovieSongsPage from "./pages/MovieSongsPage";
import LibraryPage from "./pages/LibraryPage";
import NowPlaying from "./pages/NowPlaying";
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

const AnimatedRoutes = () => {
  const location = useLocation();
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    scrollPositionsRef.current[previousPath] = window.scrollY;

    const nextPath = location.pathname;
    const nextScrollY = scrollPositionsRef.current[nextPath] ?? 0;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, nextScrollY);
    });

    previousPathRef.current = nextPath;
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:slug" element={<MovieSongsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/now-playing" element={<NowPlaying />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PlayerProvider>
          <AndroidBackHandler />
          <div className="min-h-screen bg-background relative">
            <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 50% -10%, hsl(var(--accent-violet) / 0.14), transparent 48%), radial-gradient(circle at 80% 20%, hsl(var(--accent-rose) / 0.1), transparent 42%)" }} />
            <AnimatedRoutes />
            <MiniPlayer />
            <BottomNav />
          </div>
        </PlayerProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
