import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, Download, MapPin, Sparkles } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { heroContent, socialLinks, uiLabels } from '../../data/portfolioData';
import { GitHubIcon, LinkedInIcon } from '../ui/BrandIcons';
import { SpotlightCard } from '../ui/SpotlightCard';

export const HeroBento: React.FC = () => {
  const { language } = usePreferences();
  const [copied, setCopied] = useState(false);
  const labels = uiLabels[language].hero;

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(socialLinks.email);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${socialLinks.email}`;
    }
  };

  return (
    <section id="about" className="scroll-mt-28 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Identity Bento Card */}
        <SpotlightCard className="lg:col-span-2 lg:row-span-2 p-7 sm:p-9">
          <div className="flex h-full flex-col justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>{heroContent.roleBadge[language]}</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {heroContent.name}
                </h1>
                <p className="text-base sm:text-lg font-medium text-zinc-700 dark:text-zinc-200 max-w-2xl">
                  {heroContent.headline[language]}
                </p>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-2xl">
                {heroContent.bio[language]}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <LinkedInIcon className="h-4 w-4" />
                <span>LinkedIn</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-75" />
              </a>

              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700/90 bg-zinc-100/80 dark:bg-zinc-800/70 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-colors hover:border-zinc-400 dark:hover:border-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <GitHubIcon className="h-4 w-4" />
                <span>GitHub</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
              </a>

              <a
                href={socialLinks.cvPath[language]}
                download={language === 'pt' ? 'CV_Lincoln_Diogo_PT.pdf' : 'CV_Lincoln_Diogo_EN.pdf'}
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/35 bg-sky-500/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-sky-700 dark:text-sky-300 transition-colors hover:bg-sky-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Download className="h-4 w-4" />
                <span>{labels.downloadCv}</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:hover:border-zinc-700 dark:hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">{labels.emailCopied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{labels.copyEmail}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </SpotlightCard>

        {/* Current Focus Bento Card */}
        <SpotlightCard className="p-6">
          <div className="flex h-full flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {heroContent.focusTitle[language]}
              </span>
              <Sparkles className="h-4 w-4 text-sky-500 dark:text-sky-400" />
            </div>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {heroContent.focusBody[language]}
            </p>
          </div>
        </SpotlightCard>

        {/* Highlights Bento Card */}
        <SpotlightCard className="p-6">
          <div className="grid h-full grid-cols-2 gap-4 items-center">
            {heroContent.highlights.map((item, idx) => (
              <div key={item.value} className="space-y-1">
                <div className="flex items-center gap-1.5 text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {idx === 1 && <MapPin className="h-4 w-4 text-sky-500 shrink-0" />}
                  <span>{item.value}</span>
                </div>
                <p className="text-xs leading-snug text-zinc-500 dark:text-zinc-400">
                  {item.label[language]}
                </p>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};
