import React, { useMemo, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { portfolioProjects, uiLabels } from '../../data/portfolioData';
import type { PortfolioProject, ProjectCategory } from '../../types/portfolio';
import { ProjectCardSkeleton } from '../ui/Skeleton';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ProjectModal } from './ProjectModal';

interface ProjectsSectionProps {
  isLoading: boolean;
  activeCategory: ProjectCategory;
  activeSkill: string | null;
  onSelectCategory: (category: ProjectCategory) => void;
  onClearSkill: () => void;
  onResetAll: () => void;
}

const CATEGORIES: ProjectCategory[] = ['all', 'frontend', 'fullstack', 'ai-data'];

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  isLoading,
  activeCategory,
  activeSkill,
  onSelectCategory,
  onClearSkill,
  onResetAll,
}) => {
  const { language } = usePreferences();
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const labels = uiLabels[language].projects;

  const filteredProjects = useMemo(() => {
    return portfolioProjects.filter((project) => {
      const matchesCategory =
        activeCategory === 'all' || project.categories.includes(activeCategory);
      const matchesSkill =
        !activeSkill ||
        project.technologies.some(
          (tech) => tech.toLowerCase() === activeSkill.toLowerCase()
        );
      return matchesCategory && matchesSkill;
    });
  }, [activeCategory, activeSkill]);

  return (
    <section id="projects" className="scroll-mt-28 space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {labels.sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {labels.sectionSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                aria-pressed={isActive}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isActive
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                    : 'border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {labels.categories[category]}
              </button>
            );
          })}
        </div>
      </div>

      {activeSkill && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {labels.activeTechLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
            {activeSkill}
            <button
              type="button"
              onClick={onClearSkill}
              aria-label={labels.clearFilter}
              className="rounded-full p-0.5 hover:bg-sky-500/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-10 text-center space-y-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{labels.emptyState}</p>
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center rounded-full bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-950 px-4 py-2 text-xs font-semibold"
          >
            {labels.resetAll}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {filteredProjects.map((project) => (
            <SpotlightCard
              key={project.id}
              onClick={() => setSelectedProject(project)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedProject(project);
                }
              }}
              className="cursor-pointer p-6 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <div className="flex h-full flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                      {project.contextTag[language]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                      <span>{labels.viewDetails}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {project.title[language]}
                  </h3>

                  <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {project.summary[language]}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.technologies.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/60 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 5 && (
                    <span className="rounded-full border border-zinc-200/80 dark:border-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-500">
                      +{project.technologies.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  );
};
