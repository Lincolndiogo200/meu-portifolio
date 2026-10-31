export type ThemeMode = 'dark' | 'light';
export type Language = 'pt' | 'en';

export type ProjectCategory = 'all' | 'frontend' | 'fullstack' | 'ai-data';

export interface LocalizedText {
  pt: string;
  en: string;
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  email: string;
  phoneDisplay: string;
  whatsappUrl: string;
  cvPath: Record<Language, string>;
}

export interface HeroContent {
  name: string;
  roleBadge: LocalizedText;
  headline: LocalizedText;
  bio: LocalizedText;
  focusTitle: LocalizedText;
  focusBody: LocalizedText;
  highlights: Array<{
    value: string;
    label: LocalizedText;
  }>;
}

export interface SkillGroup {
  id: string;
  title: LocalizedText;
  skills: Array<{
    name: string;
    featured?: boolean;
  }>;
}

export interface SpokenLanguage {
  id: string;
  name: LocalizedText;
  level: LocalizedText;
  percentage: number;
  accent: 'emerald' | 'sky';
}

export interface PortfolioProject {
  id: string;
  title: LocalizedText;
  contextTag: LocalizedText;
  categories: Exclude<ProjectCategory, 'all'>[];
  summary: LocalizedText;
  description: LocalizedText;
  deliverables: Record<Language, string[]>;
  technologies: string[];
  repoUrl?: string;
  liveUrl?: string;
  isEnterpriseCase?: boolean;
}

export interface ExperienceItem {
  id: string;
  role: LocalizedText;
  company: string;
  period: LocalizedText;
  location: string;
  highlights: Record<Language, string[]>;
  technologies: string[];
}

export interface EducationItem {
  id: string;
  degree: LocalizedText;
  institution: string;
  period: string;
  location: string;
  highlight?: LocalizedText;
}

export interface UILabels {
  nav: {
    about: string;
    skills: string;
    projects: string;
    experience: string;
    contact: string;
    searchHint: string;
    themeAria: string;
    langAria: string;
  };
  hero: {
    downloadCv: string;
    copyEmail: string;
    emailCopied: string;
  };
  skills: {
    sectionTitle: string;
    sectionSubtitle: string;
    techStackLabel: string;
    languagesLabel: string;
    languagesFootnote: string;
    activeFilterHint: string;
  };
  projects: {
    sectionTitle: string;
    sectionSubtitle: string;
    categories: Record<ProjectCategory, string>;
    activeTechLabel: string;
    clearFilter: string;
    emptyState: string;
    resetAll: string;
    viewDetails: string;
    modalDeliverables: string;
    modalTechStack: string;
    modalRepoButton: string;
    modalEnterpriseNote: string;
    closeModal: string;
  };
  experience: {
    sectionTitle: string;
    sectionSubtitle: string;
    workHeading: string;
    educationHeading: string;
  };
  contact: {
    badge: string;
    heading: string;
    subheading: string;
    whatsappButton: string;
    footerNote: string;
  };
  commandPalette: {
    placeholder: string;
    empty: string;
    groups: {
      navigation: string;
      social: string;
      preferences: string;
    };
    actions: {
      openLinkedin: string;
      openGithub: string;
      downloadCv: string;
      copyEmail: string;
      openWhatsapp: string;
      toggleTheme: string;
      toggleLang: string;
    };
    closeHint: string;
  };
}
