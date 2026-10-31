import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSkeletonTransitionOptions {
  initialDelayMs?: number;
  transitionDelayMs?: number;
}

export function useSkeletonTransition({
  initialDelayMs = 450,
  transitionDelayMs = 240,
}: UseSkeletonTransitionOptions = {}) {
  const [isBooting, setIsBooting] = useState(initialDelayMs > 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialDelayMs <= 0) {
      setIsBooting(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, initialDelayMs);

    return () => clearTimeout(timer);
  }, [initialDelayMs]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const triggerTransition = useCallback(
    (onCommit: () => void) => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion || transitionDelayMs <= 0) {
        onCommit();
        setIsTransitioning(false);
        return;
      }

      setIsTransitioning(true);
      transitionTimerRef.current = setTimeout(() => {
        onCommit();
        setIsTransitioning(false);
        transitionTimerRef.current = null;
      }, transitionDelayMs);
    },
    [transitionDelayMs]
  );

  return {
    isBooting,
    isTransitioning,
    isLoading: isBooting || isTransitioning,
    triggerTransition,
  };
}
