import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language, ThemeMode } from '../types/portfolio';

interface PreferencesContextValue {
  theme: ThemeMode;
  language: Language;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const THEME_STORAGE_KEY = 'portfolio-theme';
const LANG_STORAGE_KEY = 'portfolio-lang';

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

function readInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Ignore storage read errors in restricted environments
  }
  return 'dark';
}

function readInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'pt' || stored === 'en') {
      return stored;
    }
  } catch {
    // Ignore storage read errors
  }
  return 'pt';
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readInitialTheme);
  const [language, setLanguageState] = useState<Language>(readInitialLanguage);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage write errors
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // Ignore storage write errors
    }
  }, [language]);

  const setTheme = (next: ThemeMode) => setThemeState(next);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const setLanguage = (next: Language) => setLanguageState(next);
  const toggleLanguage = () => setLanguageState((prev) => (prev === 'pt' ? 'en' : 'pt'));

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        language,
        setTheme,
        toggleTheme,
        setLanguage,
        toggleLanguage,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
