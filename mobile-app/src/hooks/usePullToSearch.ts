import { useEffect, useRef, useState } from "react";

const PULL_SEARCH_TRIGGER = 104;
const PULL_SEARCH_MAX = 140;
const PULL_SEARCH_DAMPING = 0.56;

export function usePullToSearch(searchOpen: boolean, onTrigger: () => void) {
  const [pullOffset, setPullOffset] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const pullStartXRef = useRef(0);
  const pullStartYRef = useRef(0);
  const pullTrackingRef = useRef(false);
  const pullActiveRef = useRef(false);
  const pullOffsetRef = useRef(0);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      if (searchOpen) return;
      if (window.scrollY > 0) return;
      const touch = event.touches[0];
      if (!touch) return;
      pullStartXRef.current = touch.clientX;
      pullStartYRef.current = touch.clientY;
      pullTrackingRef.current = true;
      pullActiveRef.current = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!pullTrackingRef.current || searchOpen) return;
      const touch = event.touches[0];
      if (!touch) return;

      const dx = touch.clientX - pullStartXRef.current;
      const dy = touch.clientY - pullStartYRef.current;

      if (!pullActiveRef.current) {
        if (dy < 6) return;
        if (Math.abs(dx) > Math.abs(dy) * 0.9) {
          pullTrackingRef.current = false;
          return;
        }
        if (window.scrollY > 0) {
          pullTrackingRef.current = false;
          return;
        }
        pullActiveRef.current = true;
        setIsPulling(true);
      }

      const offset = Math.min(PULL_SEARCH_MAX, Math.max(0, dy * PULL_SEARCH_DAMPING));
      pullOffsetRef.current = offset;
      setPullOffset(offset);
      event.preventDefault();
    };

    const resetPull = () => {
      pullTrackingRef.current = false;
      pullActiveRef.current = false;
      setIsPulling(false);
      pullOffsetRef.current = 0;
      setPullOffset(0);
    };

    const onTouchEnd = () => {
      if (!pullTrackingRef.current && !pullActiveRef.current) return;
      const shouldOpenSearch = pullOffsetRef.current >= PULL_SEARCH_TRIGGER;
      resetPull();
      if (shouldOpenSearch) {
        onTrigger();
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [onTrigger, searchOpen]);

  const pullProgress = Math.min(1, pullOffset / PULL_SEARCH_TRIGGER);

  return {
    pullOffset,
    pullProgress,
    isPulling,
  };
}

