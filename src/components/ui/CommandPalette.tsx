import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CornerDownLeft,
  Download,
  Globe,
  Mail,
  MessageCircle,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { socialLinks, uiLabels } from '../../data/portfolioData';
import { GitHubIcon, LinkedInIcon } from './BrandIcons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchLanguage: () => void;
}

interface CommandItem {
  id: string;
  group: string;
  label: string;
  keywords: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSwitchLanguage,
}) => {
  const { theme, language, toggleTheme } = usePreferences();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const labels = uiLabels[language].commandPalette;
  const navLabels = uiLabels[language].nav;

  const commands: CommandItem[] = useMemo(() => {
    const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
      onClose();
    };

    return [
      {
        id: 'nav-about',
        group: labels.groups.navigation,
        label: navLabels.about,
        keywords: 'about sobre bio perfil inicio',
        icon: <ArrowRight className="h-4 w-4" />,
        onSelect: () => scrollToSection('about'),
      },
      {
        id: 'nav-skills',
        group: labels.groups.navigation,
        label: `${navLabels.skills} (Português / English)`,
        keywords: 'skills habilidades tecnologias idiomas portugues ingles react typescript',
        icon: <ArrowRight className="h-4 w-4" />,
        onSelect: () => scrollToSection('skills'),
      },
      {
        id: 'nav-projects',
        group: labels.groups.navigation,
        label: navLabels.projects,
        keywords: 'projects projetos portfolio cases github',
        icon: <ArrowRight className="h-4 w-4" />,
        onSelect: () => scrollToSection('projects'),
      },
      {
        id: 'nav-experience',
        group: labels.groups.navigation,
        label: navLabels.experience,
        keywords: 'experience experiencia carreira formacao single software smn unifacisa',
        icon: <ArrowRight className="h-4 w-4" />,
        onSelect: () => scrollToSection('experience'),
      },
      {
        id: 'nav-contact',
        group: labels.groups.navigation,
        label: navLabels.contact,
        keywords: 'contact contato footer whatsapp email',
        icon: <ArrowRight className="h-4 w-4" />,
        onSelect: () => scrollToSection('contact'),
      },
      {
        id: 'social-linkedin',
        group: labels.groups.social,
        label: labels.actions.openLinkedin,
        keywords: 'linkedin rede social perfil carreira',
        icon: <LinkedInIcon className="h-4 w-4" />,
        onSelect: () => {
          window.open(socialLinks.linkedin, '_blank', 'noopener,noreferrer');
          onClose();
        },
      },
      {
        id: 'social-github',
        group: labels.groups.social,
        label: labels.actions.openGithub,
        keywords: 'github repositorios codigo open source',
        icon: <GitHubIcon className="h-4 w-4" />,
        onSelect: () => {
          window.open(socialLinks.github, '_blank', 'noopener,noreferrer');
          onClose();
        },
      },
      {
        id: 'social-cv',
        group: labels.groups.social,
        label: labels.actions.downloadCv,
        keywords: 'cv curriculo resume pdf download baixar',
        icon: <Download className="h-4 w-4" />,
        onSelect: () => {
          const link = document.createElement('a');
          link.href = socialLinks.cvPath[language];
          link.download =
            language === 'pt' ? 'CV_Lincoln_Diogo_PT.pdf' : 'CV_Lincoln_Diogo_EN.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          onClose();
        },
      },
      {
        id: 'social-email',
        group: labels.groups.social,
        label: `${labels.actions.copyEmail} (${socialLinks.email})`,
        keywords: 'email copiar contato gmail',
        icon: <Mail className="h-4 w-4" />,
        onSelect: () => {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            void navigator.clipboard.writeText(socialLinks.email);
          }
          onClose();
        },
      },
      {
        id: 'social-whatsapp',
        group: labels.groups.social,
        label: labels.actions.openWhatsapp,
        keywords: 'whatsapp telefone mensagem contato',
        icon: <MessageCircle className="h-4 w-4" />,
        onSelect: () => {
          window.open(socialLinks.whatsappUrl, '_blank', 'noopener,noreferrer');
          onClose();
        },
      },
      {
        id: 'pref-theme',
        group: labels.groups.preferences,
        label: labels.actions.toggleTheme,
        keywords: 'theme tema dark light escuro claro modo',
        icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        onSelect: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'pref-lang',
        group: labels.groups.preferences,
        label: labels.actions.toggleLang,
        keywords: 'language idioma portugues ingles pt en',
        icon: <Globe className="h-4 w-4" />,
        onSelect: () => {
          onSwitchLanguage();
          onClose();
        },
      },
    ];
  }, [labels, navLabels, language, theme, toggleTheme, onSwitchLanguage, onClose]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(normalized) ||
        cmd.keywords.toLowerCase().includes(normalized) ||
        cmd.group.toLowerCase().includes(normalized)
    );
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) =>
          filteredCommands.length === 0 ? 0 : (prev + 1) % filteredCommands.length
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) =>
          filteredCommands.length === 0
            ? 0
            : (prev - 1 + filteredCommands.length) % filteredCommands.length
        );
      } else if (event.key === 'Enter' && filteredCommands[activeIndex]) {
        event.preventDefault();
        filteredCommands[activeIndex].onSelect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, activeIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/70 backdrop-blur-sm p-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl animate-fadeIn"
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3.5">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.placeholder}
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
          <kbd className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {labels.empty}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((item, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={item.onSelect}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs sm:text-sm transition-colors ${
                      isSelected
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-zinc-400 dark:text-zinc-500 shrink-0">
                        {item.icon}
                      </span>
                      <div className="truncate">
                        <span className="font-medium">{item.label}</span>
                        <span className="ml-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                          {item.group}
                        </span>
                      </div>
                    </div>
                    {isSelected && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 opacity-70" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
