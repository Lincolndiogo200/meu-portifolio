import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800/80 dark:via-zinc-700/60 dark:to-zinc-800/80 bg-[length:200%_100%] animate-shimmer ${className}`}
    />
  );
};

export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div
      data-testid="project-skeleton-card"
      className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/50 p-6 flex flex-col justify-between gap-5"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
};

export const HeroBentoSkeleton: React.FC = () => {
  return (
    <section
      data-testid="hero-skeleton"
      aria-label="Carregando portfólio"
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 lg:row-span-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/50 p-7 sm:p-8 flex flex-col justify-between gap-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-64 rounded-full" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-5 w-4/5 max-w-lg" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/50 p-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/50 p-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </section>
  );
};
