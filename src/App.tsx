import React, { useEffect, useState } from 'react';
import { ContactFooter } from './components/layout/ContactFooter';
import { Navbar } from './components/layout/Navbar';
import { ExperienceTimeline } from './components/sections/ExperienceTimeline';
import { HeroBento } from './components/sections/HeroBento';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { SkillsAndLanguages } from './components/sections/SkillsAndLanguages';
import { CommandPalette } from './components/ui/CommandPalette';
import { HeroBentoSkeleton } from './components/ui/Skeleton';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import { useSkeletonTransition } from './hooks/useSkeletonTransition';
import type { ProjectCategory } from './types/portfolio';

const PortfolioShell: React.FC = () => {
  const { toggleLanguage } = usePreferences();
  const { isBooting, isTransitioning, triggerTransition } = useSkeletonTransition({
    initialDelayMs: 450,
    transitionDelayMs: 240,
  });

  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('all');
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    const handleGlobalShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, []);

  const handleSelectCategory = (category: ProjectCategory) => {
    if (category === activeCategory) return;
    triggerTransition(() => {
      setActiveCategory(category);
    });
  };

  const handleSelectSkill = (skill: string) => {
    triggerTransition(() => {
      setActiveSkill((prev) => (prev === skill ? null : skill));
      setActiveCategory('all');
    });
    const projectsNode = document.getElementById('projects');
    projectsNode?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleClearSkill = () => {
    triggerTransition(() => {
      setActiveSkill(null);
    });
  };

  const handleResetAllFilters = () => {
    triggerTransition(() => {
      setActiveCategory('all');
      setActiveSkill(null);
    });
  };

  const handleSwitchLanguage = () => {
    triggerTransition(() => {
      toggleLanguage();
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Minimalist ambient grid & top spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-grid-subtle opacity-60 dark:opacity-35"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 -top-40 -z-10 mx-auto h-96 max-w-3xl rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/12"
      />

      <Navbar
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        onSwitchLanguage={handleSwitchLanguage}
      />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-10 sm:pt-14 space-y-16 sm:space-y-20">
        {isBooting ? (
          <HeroBentoSkeleton />
        ) : (
          <>
            <HeroBento />
            <SkillsAndLanguages
              activeSkill={activeSkill}
              onSelectSkill={handleSelectSkill}
            />
            <ProjectsSection
              isLoading={isTransitioning}
              activeCategory={activeCategory}
              activeSkill={activeSkill}
              onSelectCategory={handleSelectCategory}
              onClearSkill={handleClearSkill}
              onResetAll={handleResetAllFilters}
            />
            <ExperienceTimeline />
            <ContactFooter />
          </>
        )}
      </main>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSwitchLanguage={handleSwitchLanguage}
      />
    </div>
  );
};

export function App() {
  return (
    <PreferencesProvider>
      <PortfolioShell />
    </PreferencesProvider>
  );
}

export default App;
