import React from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { educationItems, experienceItems, uiLabels } from '../../data/portfolioData';
import { SpotlightCard } from '../ui/SpotlightCard';

export const ExperienceTimeline: React.FC = () => {
  const { language } = usePreferences();
  const labels = uiLabels[language].experience;

  return (
    <section id="experience" className="scroll-mt-28 space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {labels.sectionTitle}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {labels.sectionSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Work Experience Column */}
        <SpotlightCard className="lg:col-span-8 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="h-4 w-4 text-sky-500 dark:text-sky-400" />
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {labels.workHeading}
            </h3>
          </div>

          <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-2 space-y-8">
            {experienceItems.map((exp, index) => (
              <div key={exp.id} className="relative pl-6">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-900 ${
                    index === 0 ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {exp.role[language]}
                    </h4>
                    <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
                      {exp.company}{' '}
                      <span className="font-normal text-zinc-500 dark:text-zinc-400">
                        · {exp.location}
                      </span>
                    </p>
                  </div>
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                    {exp.period[language]}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {exp.highlights[language].map((point) => (
                    <li
                      key={point}
                      className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
                    >
                      • {point}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-800/60 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* Academic Education Column */}
        <SpotlightCard className="lg:col-span-4 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {labels.educationHeading}
            </h3>
          </div>

          <div className="space-y-4">
            {educationItems.map((edu) => (
              <div
                key={edu.id}
                className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/90 bg-zinc-50/70 dark:bg-zinc-950/50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {edu.period}
                  </span>
                  {edu.highlight && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      {edu.highlight[language]}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {edu.degree[language]}
                </h4>
                <p className="text-xs font-medium text-sky-600 dark:text-sky-400">
                  {edu.institution}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{edu.location}</p>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};
