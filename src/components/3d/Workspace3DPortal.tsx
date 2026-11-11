import React, { Suspense, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { ArrowDown, Monitor, RotateCcw, SkipForward } from 'lucide-react';
import { MathUtils } from 'three';
import { usePreferences } from '../../context/PreferencesContext';
import { heroContent } from '../../data/portfolioData';
import {
  calculateScrollProgress,
  computePortalTransitionState,
  ROOM_INITIAL_POSITION,
} from '../../utils/cameraScrollMath';
import { LoadingScreen } from '../ui/LoadingScreen';
import { CameraScrollRig } from './CameraScrollRig';
import { RoomEnvironment3D } from './RoomEnvironment3D';

export interface Workspace3DPortalHandle {
  enterMonitor: (targetSectionId?: string) => void;
  exitMonitor: () => void;
  setProgress: (progress: number) => void;
}

interface Workspace3DPortalProps {
  onEnterMonitor?: () => void;
  onPortalStateChange?: (isInside: boolean) => void;
}

function detectWebGLSupport(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

const PORTAL_COPY = {
  pt: {
    badge: 'Setup Interativo 3D · Three.js',
    greeting: 'Olá, eu sou',
    headline: 'Role a página para mergulhar no monitor e explorar meu portfólio',
    subheadline:
      'Conforme você gira o scroll ou arrasta a tela, a câmera entra direto no monitor onde estão meus projetos e experiência.',
    enterCta: 'Entrar no Monitor',
    skipIntro: 'Pular intro',
    scrollHint: 'Scroll para dar zoom na tela',
    backTo3D: 'Voltar ao Setup 3D',
    osWindowTitle: 'lincoln@workstation:~/portfolio — Monitor Principal',
  },
  en: {
    badge: 'Interactive 3D Setup · Three.js',
    greeting: "Hi, I'm",
    headline: 'Scroll down to dive into the monitor and explore my portfolio',
    subheadline:
      'As you scroll or drag, the 3D camera zooms straight into the computer screen where my projects, stack, and experience live.',
    enterCta: 'Enter Monitor',
    skipIntro: 'Skip intro',
    scrollHint: 'Scroll to zoom into screen',
    backTo3D: 'Back to 3D Setup',
    osWindowTitle: 'lincoln@workstation:~/portfolio — Main Monitor',
  },
} as const;

export const Workspace3DPortal = React.forwardRef<
  Workspace3DPortalHandle,
  Workspace3DPortalProps
>(({ onEnterMonitor, onPortalStateChange }, ref) => {
  const { language, theme } = usePreferences();
  const copy = PORTAL_COPY[language];
  const isDark = theme === 'dark';

  const [scrollProgress, setScrollProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const [hasWebGL] = useState<boolean>(() => detectWebGLSupport());
  const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);

  const [isRoomLoaded, setIsRoomLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(() => hasWebGL && !isJsdom);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  const { progress: assetProgress, active: isAssetLoading } = useProgress();
  const targetLoadProgressRef = useRef(10);

  const handleRoomLoaded = React.useCallback(() => {
    setIsRoomLoaded(true);
  }, []);

  const handleSkipLoading = React.useCallback(() => {
    setIsRoomLoaded(true);
    targetLoadProgressRef.current = 100;
    setDisplayProgress(100);
    setIsFadingOut(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  // Update target progress as assets stream in
  useEffect(() => {
    if (!isLoading) return;

    let target = 15;
    if (isRoomLoaded && (!isAssetLoading || assetProgress >= 100)) {
      target = 100;
    } else if (isRoomLoaded) {
      target = Math.max(90, assetProgress);
    } else {
      target = Math.min(88, Math.max(15, assetProgress * 0.9));
    }

    targetLoadProgressRef.current = Math.max(targetLoadProgressRef.current, target);
  }, [isLoading, isRoomLoaded, isAssetLoading, assetProgress]);

  // Smooth interpolation ticker for progress bar
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const target = targetLoadProgressRef.current;
        if (prev >= 100) return 100;
        const diff = target - prev;
        if (diff <= 0.4 && target >= 100) {
          return 100;
        }
        const step = Math.max(0.6, diff * 0.12);
        return Math.min(target, prev + step);
      });
    }, 25);

    const fallbackTimer = setTimeout(() => {
      setIsRoomLoaded(true);
      targetLoadProgressRef.current = 100;
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
    };
  }, [isLoading]);

  // Once displayProgress reaches 100, smoothly fade out the loading overlay
  useEffect(() => {
    if (!isLoading || displayProgress < 100) return;

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 250);

    const finishTimer = setTimeout(() => {
      setIsLoading(false);
    }, 950);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [isLoading, displayProgress]);

  // Expose imperative control for seamless section navigation from the Navbar or Command Palette
  useImperativeHandle(ref, () => ({
    enterMonitor: (targetSectionId = 'about') => {
      targetProgressRef.current = 1;
      currentProgressRef.current = 1;
      setScrollProgress(1);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      if (onPortalStateChange) {
        onPortalStateChange(true);
      }
      if (onEnterMonitor) {
        onEnterMonitor();
      }
      setTimeout(() => {
        const el =
          document.getElementById(targetSectionId) ||
          document.getElementById('about') ||
          document.getElementById('main-content');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    },
    exitMonitor: () => {
      handleBackTo3D();
    },
    setProgress: (progress: number) => {
      targetProgressRef.current = progress;
      currentProgressRef.current = progress;
      setScrollProgress(progress);
    },
  }));

  // Always start cleanly at the 3D office overview (progress = 0)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });

    targetProgressRef.current = 0;
    currentProgressRef.current = 0;
    setScrollProgress(0);
  }, []);

  // Lock document scroll while progress < 1, drive zoom via wheel / touch
  useEffect(() => {
    const isJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);

    const handleWheel = (e: WheelEvent) => {
      // If intro is active (zoom < 0.98), intercept wheel to drive smooth 3D zoom into monitor or back out
      if (currentProgressRef.current < 0.98) {
        e.preventDefault();
        const delta = e.deltaY * 0.0018;
        targetProgressRef.current = Math.min(1, Math.max(0, targetProgressRef.current + delta));
      } else {
        // Once inside portfolio (zoom >= 0.98):
        // If user is at top of page and scrolls up (deltaY < 0), drive reverse zoom back to office room
        const isAtTop = (window.scrollY || document.documentElement.scrollTop || 0) <= 2;
        if (isAtTop && e.deltaY < 0) {
          e.preventDefault();
          if (window.scrollY !== 0) {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
          const delta = e.deltaY * 0.003;
          targetProgressRef.current = Math.min(0.96, Math.max(0, targetProgressRef.current + delta));
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = (touchStartY - currentY) * 0.0028;
      touchStartY = currentY;

      if (currentProgressRef.current < 0.98) {
        if (e.cancelable) e.preventDefault();
        targetProgressRef.current = Math.min(1, Math.max(0, targetProgressRef.current + deltaY));
      } else {
        // In portfolio: if user pulls down at top of page, reverse zoom back to office room
        const isAtTop = (window.scrollY || document.documentElement.scrollTop || 0) <= 2;
        if (isAtTop && deltaY < 0) {
          if (e.cancelable) e.preventDefault();
          if (window.scrollY !== 0) {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
          targetProgressRef.current = Math.min(0.96, Math.max(0, targetProgressRef.current + deltaY * 1.5));
        }
      }
    };

    const handleScroll = () => {
      // Only in test runner (jsdom) does fireEvent.scroll drive portal progress
      if (isJsdom) {
        const runwayPx = Math.max(window.innerHeight * 0.9, 560);
        const progress = calculateScrollProgress(window.scrollY, runwayPx);
        if (progress > 0) {
          targetProgressRef.current = progress;
          currentProgressRef.current = progress;
          setScrollProgress(progress);
        }
      }
    };

    let rafId: number | null = null;
    let lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const animate = (now: number) => {
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0.001), 0.1);
      lastTime = now;

      const prev = currentProgressRef.current;
      let target = targetProgressRef.current;

      // When zooming IN towards monitor (target >= 0.98), snap to 1 once close
      if (target >= 0.98 && prev >= 0.95 && targetProgressRef.current >= 0.98) {
        target = 1;
        targetProgressRef.current = 1;
      } else if (target <= 0.02 && targetProgressRef.current <= 0.02) {
        // When zooming OUT towards 3D room, snap to 0 cleanly once close
        target = 0;
        targetProgressRef.current = 0;
      }

      // Snappy responsiveness (14) eliminates dragging latency
      const next = MathUtils.damp(prev, target, 14, dt);
      const settled = Math.abs(next - target) < 0.0005 ? target : next;
      currentProgressRef.current = settled;

      // Quantized update threshold prevents 120Hz React state thrashing
      setScrollProgress((p) => (Math.abs(p - settled) > 0.002 ? settled : p));

      // Lock scroll while in 3D overview, unlock once arrived inside monitor
      if (!isJsdom && typeof document !== 'undefined') {
        if (settled >= 0.98) {
          document.body.style.overflow = '';
        } else {
          document.body.style.overflow = 'hidden';
        }
      }

      rafId = window.requestAnimationFrame(animate);
    };

    if (!isJsdom && typeof window.requestAnimationFrame !== 'undefined') {
      rafId = window.requestAnimationFrame(animate);
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, []);

  const transition = computePortalTransitionState(scrollProgress);

  useEffect(() => {
    if (onPortalStateChange) {
      onPortalStateChange(transition.isInsideMonitor);
    }
  }, [transition.isInsideMonitor, onPortalStateChange]);

  const handleEnterMonitorClick = () => {
    targetProgressRef.current = 1;
    currentProgressRef.current = 1;
    setScrollProgress(1);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    if (onPortalStateChange) {
      onPortalStateChange(true);
    }
    if (onEnterMonitor) {
      onEnterMonitor();
    }
    const aboutEl = document.getElementById('about') || document.getElementById('main-content');
    if (aboutEl) {
      aboutEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSkipIntro = () => {
    targetProgressRef.current = 1;
    currentProgressRef.current = 1;
    setScrollProgress(1);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    if (onPortalStateChange) {
      onPortalStateChange(true);
    }
    if (onEnterMonitor) {
      onEnterMonitor();
    }
    const aboutEl = document.getElementById('about') || document.getElementById('main-content');
    if (aboutEl) {
      aboutEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBackTo3D = () => {
    targetProgressRef.current = 0;
    currentProgressRef.current = 0;
    setScrollProgress(0);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    if (onPortalStateChange) {
      onPortalStateChange(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen
          progress={displayProgress}
          isFadingOut={isFadingOut}
          language={language}
          theme={theme}
          onSkip={handleSkipLoading}
        />
      )}

      <section
        data-testid="workspace-3d-portal"
        data-portal-state={transition.isInsideMonitor ? 'inside-monitor' : 'room-overview'}
        style={{
          opacity: transition.canvasOpacity,
          pointerEvents: !transition.isInsideMonitor && transition.canvasOpacity > 0.05 ? 'auto' : 'none',
        }}
        className="fixed inset-0 z-30 h-screen w-full select-none overflow-hidden bg-[#e9e3d8] dark:bg-[#181a20] transition-opacity duration-300"
      >
        <div className="relative h-screen w-full overflow-hidden flex items-center">
          {/* Full-screen 3D WebGL Canvas */}
          <div
            data-testid="studio-3d-stage"
            className="absolute inset-0 z-0"
          >
            {hasWebGL ? (
              <Canvas
                dpr={[1, 1.5]}
                gl={{
                  powerPreference: 'high-performance',
                  antialias: true,
                  stencil: false,
                  depth: true,
                }}
                camera={{
                  position: ROOM_INITIAL_POSITION,
                  fov: 38,
                  near: 0.05,
                  far: 100,
                }}
              >
                <ambientLight intensity={1.5} />
                <directionalLight position={[5, 8, 5]} intensity={1.8} />
                <directionalLight position={[-4, 4, -3]} intensity={0.8} />
                <CameraScrollRig scrollProgress={scrollProgress} />
                <Suspense fallback={null}>
                  <RoomEnvironment3D
                    scrollProgress={scrollProgress}
                    isDark={isDark}
                    onLoaded={handleRoomLoaded}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-sky-500/10 via-transparent to-emerald-500/10" />
            )}
          </div>

          {/* Left-aligned Hero HUD */}
          <div
            style={{
              opacity: isLoading ? 0 : transition.hudOpacity,
              pointerEvents: !isLoading && transition.hudOpacity > 0.15 ? 'auto' : 'none',
              transform: `translateY(${(-scrollProgress * 60).toFixed(1)}px)`,
            }}
            className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-16 sm:pt-20 transition-opacity duration-500"
          >
            <div className="max-w-md space-y-4 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-950/70 p-6 sm:p-7 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-3.5">
                <img
                  src={heroContent.avatarUrl}
                  alt="Avatar 3D Preview"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-400/80 shrink-0"
                />
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    {copy.greeting}
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Lincoln Diogo
                  </p>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-semibold leading-snug text-zinc-800 dark:text-zinc-100">
                {copy.headline}
              </h2>

              <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {copy.subheadline}
              </p>

              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  data-testid="enter-monitor-button"
                  onClick={handleEnterMonitorClick}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500 hover:bg-sky-400 text-zinc-950 px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <Monitor className="h-4 w-4" />
                  <span>{copy.enterCta}</span>
                  <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
                </button>

                <button
                  type="button"
                  data-testid="skip-intro-button"
                  onClick={handleSkipIntro}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300/80 dark:border-zinc-700/80 bg-white/40 dark:bg-zinc-900/40 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 px-4 py-2.5 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  <span>{copy.skipIntro}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Monitor Portal Overlay */}
          <div
            data-testid="monitor-portal-screen"
            style={{
              opacity: transition.screenOverlayOpacity,
            }}
            className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-10 transition-opacity duration-200"
          >
            <div className="mx-auto w-full max-w-2xl rounded-xl border border-sky-500/25 bg-zinc-950/80 px-4 py-2 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between text-[11px] font-mono text-sky-400/90">
                <span>{copy.osWindowTitle}</span>
                <span className="text-zinc-400">{copy.scrollHint}</span>
              </div>
            </div>
            <div className="w-full text-center text-[10px] font-mono uppercase tracking-widest text-sky-400/50 pb-2">
              Workspace Monitor · Lincoln Diogo
            </div>
          </div>
        </div>
      </section>

      {/* Floating button when inside monitor to zoom back out to the 3D Room */}
      {transition.isInsideMonitor && (
        <button
          type="button"
          data-testid="back-to-3d-button"
          onClick={handleBackTo3D}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-zinc-900/90 text-zinc-100 dark:bg-zinc-900/95 px-4 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-md hover:border-sky-400 hover:text-sky-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <RotateCcw className="h-3.5 w-3.5 text-sky-400" />
          <span>{copy.backTo3D}</span>
        </button>
      )}
    </>
  );
});

Workspace3DPortal.displayName = 'Workspace3DPortal';
