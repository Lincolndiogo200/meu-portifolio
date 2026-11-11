import React from 'react';
import { heroContent } from '../../data/portfolioData';

interface LoadingScreenProps {
  progress: number;
  isFadingOut?: boolean;
  language?: 'pt' | 'en';
  theme?: 'light' | 'dark';
  onSkip?: () => void;
}

const LOADING_COPY = {
  pt: {
    phases: [
      { max: 25, text: 'Carregando setup...' },
      { max: 65, text: 'Carregando modelos e texturas...' },
      { max: 92, text: 'Configurando ambiente do escritório...' },
      { max: 100, text: 'Ambiente pronto!' },
    ],
    aria: 'Carregando portfólio de Lincoln Diogo',
    tag: 'PORTFÓLIO',
    skip: 'Pular carregamento',
  },
  en: {
    phases: [
      { max: 25, text: 'Loading setup...' },
      { max: 65, text: 'Loading 3D models & textures...' },
      { max: 92, text: 'Setting up office environment...' },
      { max: 100, text: 'Portfolio ready!' },
    ],
    aria: 'Loading Lincoln Diogo portfolio',
    tag: 'PORTFOLIO',
    skip: 'Skip loading',
  },
} as const;

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  isFadingOut = false,
  language = 'pt',
  onSkip,
}) => {
  const [canSkip, setCanSkip] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCanSkip(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const copy = LOADING_COPY[language] || LOADING_COPY.pt;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const currentPhase =
    copy.phases.find((p) => clampedProgress <= p.max)?.text || copy.phases[copy.phases.length - 1].text;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={copy.aria}
      data-testid="studio-loading-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden bg-[#f4eee4] dark:bg-[#0c0d12] text-zinc-900 dark:text-zinc-100 transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
      }`}
    >
      {/* Ambient background glow & subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-50 dark:opacity-25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-96 w-96 rounded-full bg-sky-500/15 dark:bg-sky-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
      />

      {/* Main animated stage */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm">
        {/* Top category badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping" />
          <span>{copy.tag}</span>
        </div>

        {/* The Spinning lincoln.diogo 3D Emblem & Orbit System */}
        <div className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64 my-1">
          {/* Outer dashed orbit rotating clockwise */}
          <svg
            className="absolute inset-0 h-full w-full animate-spin-slow pointer-events-none"
            viewBox="0 0 240 240"
            aria-hidden="true"
          >
            <circle
              cx="120"
              cy="120"
              r="108"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 8"
              className="text-sky-500/30 dark:text-sky-400/30"
            />
            <circle
              cx="120"
              cy="12"
              r="3.5"
              className="fill-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.9)]"
            />
            <circle
              cx="120"
              cy="228"
              r="2.5"
              className="fill-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]"
            />
          </svg>

          {/* Circular SVG text path rotating in reverse ("lincoln.diogo girando") */}
          <svg
            className="absolute inset-0 h-full w-full animate-spin-reverse pointer-events-none"
            viewBox="0 0 240 240"
            aria-hidden="true"
          >
            <defs>
              <path
                id="lincolnTextRing"
                d="M 120, 120 m -84, 0 a 84,84 0 1,1 168,0 a 84,84 0 1,1 -168,0"
              />
            </defs>
            <text className="text-[9px] font-mono font-bold tracking-[0.16em] uppercase fill-zinc-500 dark:fill-zinc-400">
              <textPath href="#lincolnTextRing" startOffset="0%">
                • LINCOLN.DIOGO • FULL-STACK ENGINEER • LINCOLN.DIOGO • FULL-STACK ENGINEER
              </textPath>
            </text>
          </svg>

          {/* Glowing cyan inner ring */}
          <div
            aria-hidden="true"
            className="absolute inset-9 sm:inset-10 rounded-full border border-sky-400/40 dark:border-sky-400/50 shadow-[0_0_24px_rgba(56,189,248,0.25)] pointer-events-none"
          />

          {/* 3D Perspective Spinning Coin / Badge */}
          <div className="relative z-10 h-24 w-24 sm:h-28 sm:w-28 perspective-1000">
            <div className="relative h-full w-full preserve-3d animate-flip-y">
              {/* Front Face: Lincoln's Avatar Photo */}
              <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-sky-400 shadow-xl shadow-sky-500/25 backface-hidden bg-zinc-900">
                <img
                  src={heroContent.avatarUrl}
                  alt="Lincoln Diogo"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-sky-500/20 via-transparent to-transparent pointer-events-none"
                />
              </div>

              {/* Back Face: Cyber Emblem with LD / lincoln.diogo monogram */}
              <div
                style={{ transform: 'rotateY(180deg)' }}
                className="absolute inset-0 rounded-full border-2 border-sky-400 bg-zinc-950 p-2 shadow-xl shadow-sky-500/30 backface-hidden flex flex-col items-center justify-center text-center select-none"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] mb-1" />
                <span className="font-mono text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                  LD
                </span>
                <span className="font-mono text-[8px] font-bold tracking-widest text-sky-400 uppercase">
                  DEV
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lincoln Diogo Title */}
        <div className="mt-4 flex items-center justify-center gap-1.5 font-mono text-2xl font-black tracking-tight">
          <span className="text-zinc-900 dark:text-zinc-100">lincoln</span>
          <span className="text-sky-500 dark:text-sky-400 drop-shadow-[0_0_14px_rgba(56,189,248,0.6)]">
            .diogo
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="mt-6 w-64 sm:w-72">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-300 dark:bg-zinc-800/80 border border-zinc-300/80 dark:border-zinc-700/60 shadow-inner">
            <div
              data-testid="loading-progress-bar"
              style={{ width: `${clampedProgress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.9)] transition-all duration-150 ease-out"
            />
          </div>

          {/* Status info & Percentage */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
            <span
              data-testid="loading-phase-text"
              className="text-zinc-600 dark:text-zinc-400 truncate max-w-[190px] text-left"
            >
              {currentPhase}
            </span>
            <span
              data-testid="loading-percentage-text"
              className="font-bold text-sky-600 dark:text-sky-400"
            >
              {Math.round(clampedProgress)}%
            </span>
          </div>

          {/* Optional skip button if user is on slow connection */}
          {canSkip && onSkip && (
            <div className="mt-4 animate-fadeIn">
              <button
                type="button"
                onClick={onSkip}
                data-testid="skip-loading-button"
                className="text-[11px] font-mono text-zinc-500 hover:text-sky-500 dark:text-zinc-400 dark:hover:text-sky-400 underline underline-offset-4 transition-colors"
              >
                {copy.skip} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
