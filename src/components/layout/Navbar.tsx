import React from 'react';
import { Moon, Search, Sun } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { uiLabels } from '../../data/portfolioData';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onSwitchLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onSwitchLanguage,
}) => {
  const { theme, language, toggleTheme } = usePreferences();
  const labels = uiLabels[language].nav;

  const navItems = [
    { href: '#about', label: labels.about },
    { href: '#skills', label: labels.skills },
    { href: '#projects', label: labels.projects },
    { href: '#experience', label: labels.experience },
    { href: '#contact', label: labels.contact },
  ];

  return (
    <header className="sticky top-4 z-40 mx-auto max-w-5xl px-4 sm:px-6">
      <nav
        aria-label="Primary"
        className="flex items-center justify-between gap-3 rounded-full border border-zinc-200/80 dark:border-zinc-800/90 bg-white/80 dark:bg-zinc-900/75 px-4 py-2.5 shadow-sm backdrop-blur-md"
      >
        <a
          href="#"
          className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md px-1"
        >
          lincoln<span className="text-sky-500 dark:text-sky-400">.diogo</span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded px-1 py-0.5"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/70 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{labels.searchHint}</span>
            <kbd className="rounded bg-white/90 dark:bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400 border border-zinc-200/70 dark:border-zinc-700/70">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={onSwitchLanguage}
            aria-label={labels.langAria}
            className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/70 px-2.5 py-1.5 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <span className={language === 'pt' ? 'text-sky-600 dark:text-sky-400' : 'opacity-50'}>
              PT
            </span>
            <span className="mx-1 opacity-30">/</span>
            <span className={language === 'en' ? 'text-sky-600 dark:text-sky-400' : 'opacity-50'}>
              EN
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={labels.themeAria}
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/70 p-2 text-zinc-700 dark:text-zinc-200 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-zinc-700" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};
