import React, { useEffect } from 'react';
import { ArrowUpRight, CheckCircle2, Lock, X } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { uiLabels } from '../../data/portfolioData';
import type { PortfolioProject } from '../../types/portfolio';
import { GitHubIcon } from '../ui/BrandIcons';

interface ProjectModalProps {
  project: PortfolioProject | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const { language } = usePreferences();
  const labels = uiLabels[language].projects;

  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${project.id}`}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl animate-fadeIn max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-sky-700 dark:text-sky-300">
              {project.contextTag[language]}
            </span>
            <h3
              id={`modal-title-${project.id}`}
              className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              {project.title[language]}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={labels.closeModal}
            className="rounded-full border border-zinc-200 dark:border-zinc-800 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
          {project.description[language]}
        </p>

        <div className="mt-6 space-y-3">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {labels.modalDeliverables}
          </h4>
          <ul className="space-y-2.5">
            {project.deliverables[language].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 space-y-2.5">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {labels.modalTechStack}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/70 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 px-4 py-2 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <GitHubIcon className="h-4 w-4" />
              <span>{labels.modalRepoButton}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Lock className="h-3.5 w-3.5" />
              <span>{labels.modalEnterpriseNote}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
