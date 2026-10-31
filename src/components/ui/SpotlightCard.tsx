import React, { useRef } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  onMouseMove,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const node = cardRef.current;
    if (node) {
      const rect = node.getBoundingClientRect();
      node.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
      node.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    }
    onMouseMove?.(event);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card group relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm transition-colors duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 ${className}`}
      {...rest}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(480px circle at var(--mouse-x, 50%) var(--mouse-y, 0%), rgba(56, 189, 248, 0.11), transparent 45%)',
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
