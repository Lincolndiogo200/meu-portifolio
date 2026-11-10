import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ArrowDown, Monitor, RotateCcw, Sparkles } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { heroContent } from '../../data/portfolioData';
import {
  calculateScrollProgress,
  computePortalTransitionState,
  ROOM_INITIAL_POSITION,
} from '../../utils/cameraScrollMath';
import { CameraScrollRig } from './CameraScrollRig';
import { RoomEnvironment3D } from './RoomEnvironment3D';

interface Workspace3DPortalProps {
  onEnterMonitor?: () => void;
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
      'Conforme você faz o scroll, a câmera entra direto na tela do computador onde estão meus projetos, stack e experiência.',
    enterCta: 'Entrar no Monitor',
    scrollHint: 'Scroll para dar zoom na tela',
    backTo3D: 'Voltar ao Setup 3D',
    osWindowTitle: 'lincoln@workstation:~/portfolio — Monitor Principal',
  },
  en: {
    badge: 'Interactive 3D Setup · Three.js',
    greeting: "Hi, I'm",
    headline: 'Scroll down to dive into the monitor and explore my portfolio',
    subheadline:
      'As you scroll, the 3D camera zooms straight into the computer screen where my projects, stack, and experience live.',
    enterCta: 'Enter Monitor',
    scrollHint: 'Scroll to zoom into screen',
    backTo3D: 'Back to 3D Setup',
    osWindowTitle: 'lincoln@workstation:~/portfolio — Main Monitor',
  },
} as const;

export const Workspace3DPortal: React.FC<Workspace3DPortalProps> = ({
  onEnterMonitor,
}) => {
  const { language, theme } = usePreferences();
  const copy = PORTAL_COPY[language];
  const isDark = theme === 'dark';

  const [scrollProgress, setScrollProgress] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [hasWebGL] = useState<boolean>(() => detectWebGLSupport());

  useEffect(() => {
    const updateScroll = () => {
      const runwayPx = Math.max(window.innerHeight * 0.9, 560);
      const progress = calculateScrollProgress(window.scrollY, runwayPx);
      setScrollProgress(progress);
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  const transition = computePortalTransitionState(scrollProgress);

  const handleEnterMonitorClick = () => {
    if (onEnterMonitor) {
      onEnterMonitor();
    }
    const aboutEl = document.getElementById('about');
    if (aboutEl) {
      aboutEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const targetY = Math.max(window.innerHeight * 0.95, 640);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  const handleBackTo3D = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    setPointer({ x, y });
  };

  return (
    <>
      <section
        data-testid="workspace-3d-portal"
        data-portal-state={transition.isInsideMonitor ? 'inside-monitor' : 'room-overview'}
        onMouseMove={handlePointerMove}
        className="relative h-[140vh] w-full select-none -mt-16 sm:-mt-20"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
          {/* Full-screen 3D WebGL Canvas (Right side holds the 3D Room + Avatar at x=2) */}
          <div
            data-testid="studio-3d-stage"
            style={{ opacity: transition.canvasOpacity }}
            className="absolute inset-0 z-0 transition-opacity duration-150"
          >
            {hasWebGL ? (
              <Canvas
                dpr={[1, 2]}
                camera={{
                  position: ROOM_INITIAL_POSITION,
                  fov: 38,
                  near: 0.05,
                  far: 100,
                }}
              >
                <Suspense fallback={null}>
                  <CameraScrollRig scrollProgress={scrollProgress} pointer={pointer} />
                  <RoomEnvironment3D
                    scrollProgress={scrollProgress}
                    pointer={pointer}
                    isDark={isDark}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-sky-500/10 via-transparent to-emerald-500/10" />
            )}
          </div>

          {/* Left-aligned Hero HUD (David Heckhoff layout: text on the left, 3D room & character on the right) */}
          <div
            style={{
              opacity: transition.hudOpacity,
              pointerEvents: transition.hudOpacity > 0.15 ? 'auto' : 'none',
              transform: `translateY(${(-scrollProgress * 60).toFixed(1)}px)`,
            }}
            className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-16 sm:pt-20 transition-opacity duration-150"
          >
            <div className="max-w-md space-y-4 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-950/70 p-6 sm:p-7 backdrop-blur-md shadow-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{copy.badge}</span>
              </div>

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
                  onClick={handleEnterMonitorClick}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500 hover:bg-sky-400 text-zinc-950 px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <Monitor className="h-4 w-4" />
                  <span>{copy.enterCta}</span>
                  <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
                </button>
              </div>
            </div>
          </div>

          {/* Monitor Portal Overlay (clean dive transition without distorting scale transforms) */}
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
};
