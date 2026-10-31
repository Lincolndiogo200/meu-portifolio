import React from 'react';
import { ArrowUpRight, Download, Mail, MessageCircle } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { socialLinks, uiLabels } from '../../data/portfolioData';
import { GitHubIcon, LinkedInIcon } from '../ui/BrandIcons';
import { SpotlightCard } from '../ui/SpotlightCard';

export const ContactFooter: React.FC = () => {
  const { language } = usePreferences();
  const labels = uiLabels[language].contact;
  const heroLabels = uiLabels[language].hero;

  return (
    <footer id="contact" className="scroll-mt-28 space-y-8 pt-4 pb-12">
      <SpotlightCard className="p-7 sm:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
              {labels.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {labels.heading}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              {labels.subheading}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-semibold hover:-translate-y-0.5 transition-transform"
            >
              <LinkedInIcon className="h-4 w-4" />
              <span>LinkedIn</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/70 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
            >
              <GitHubIcon className="h-4 w-4" />
              <span>GitHub</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <a
              href={socialLinks.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{labels.whatsappButton}</span>
            </a>

            <a
              href={`mailto:${socialLinks.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>{socialLinks.email}</span>
            </a>

            <a
              href={socialLinks.cvPath[language]}
              download={language === 'pt' ? 'CV_Lincoln_Diogo_PT.pdf' : 'CV_Lincoln_Diogo_EN.pdf'}
              className="inline-flex items-center gap-2 rounded-full border border-sky-500/35 bg-sky-500/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>{heroLabels.downloadCv}</span>
            </a>
          </div>
        </div>
      </SpotlightCard>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          © {new Date().getFullYear()} Lincoln Diogo · {socialLinks.phoneDisplay}
        </span>
        <span>{labels.footerNote}</span>
      </div>
    </footer>
  );
};
