import React from 'react';
import { Code2, Globe2 } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { skillGroups, spokenLanguages, uiLabels } from '../../data/portfolioData';
import { SpotlightCard } from '../ui/SpotlightCard';

interface SkillsAndLanguagesProps {
  activeSkill: string | null;
  onSelectSkill: (skill: string) => void;
}

export const SkillsAndLanguages: React.FC<SkillsAndLanguagesProps> = ({
  activeSkill,
  onSelectSkill,
}) => {
  const { language } = usePreferences();
  const labels = uiLabels[language].skills;

  return (
    <section id="skills" className="scroll-mt-28 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {labels.sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {labels.sectionSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Tech Stack Card */}
        <SpotlightCard className="lg:col-span-8 p-6 sm:p-7">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {labels.techStackLabel}
              </span>
              <Code2 className="h-4 w-4 text-sky-500 dark:text-sky-400" />
            </div>

            <div className="space-y-4">
              {skillGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {group.title[language]}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => {
                      const isSelected = activeSkill === skill.name;
                      return (
                        <button
                          key={skill.name}
                          type="button"
                          onClick={() => onSelectSkill(skill.name)}
                          aria-pressed={isSelected}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                            isSelected
                              ? 'bg-sky-500 text-zinc-950 font-semibold shadow-sm shadow-sky-500/25'
                              : skill.featured
                                ? 'border border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20'
                                : 'border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>

        {/* Spoken Languages Proficiency Card */}
        <SpotlightCard className="lg:col-span-4 p-6 sm:p-7">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {labels.languagesLabel}
                </span>
                <Globe2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>

              <div className="space-y-3.5">
                {spokenLanguages.map((langItem) => {
                  const isEmerald = langItem.accent === 'emerald';
                  return (
                    <div
                      key={langItem.id}
                      className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/90 bg-zinc-50/80 dark:bg-zinc-950/50 p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {langItem.name[language]}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                            isEmerald
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                          }`}
                        >
                          {langItem.level[language]}
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                        aria-hidden="true"
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isEmerald ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${langItem.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {labels.languagesFootnote}
            </p>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};
