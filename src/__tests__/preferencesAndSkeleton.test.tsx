import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PreferencesProvider, usePreferences } from '../context/PreferencesContext';
import { useSkeletonTransition } from '../hooks/useSkeletonTransition';

function PreferencesProbe() {
  const { theme, language, toggleTheme, toggleLanguage } = usePreferences();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="lang">{language}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={toggleLanguage}>Toggle Lang</button>
    </div>
  );
}

function SkeletonProbe({
  initialDelayMs = 450,
  transitionDelayMs = 240,
}: {
  initialDelayMs?: number;
  transitionDelayMs?: number;
}) {
  const { isBooting, isTransitioning, triggerTransition } = useSkeletonTransition({
    initialDelayMs,
    transitionDelayMs,
  });
  const [value, setValue] = React.useState('all');

  return (
    <div>
      <span data-testid="booting">{String(isBooting)}</span>
      <span data-testid="transitioning">{String(isTransitioning)}</span>
      <span data-testid="value">{value}</span>
      <button onClick={() => triggerTransition(() => setValue('frontend'))}>
        Filter Frontend
      </button>
      <button onClick={() => triggerTransition(() => setValue('fullstack'))}>
        Filter Fullstack
      </button>
    </div>
  );
}

import React from 'react';

describe('PreferencesContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.lang = '';
  });

  it('defaults to dark theme and pt language and syncs documentElement', () => {
    render(
      <PreferencesProvider>
        <PreferencesProbe />
      </PreferencesProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('lang')).toHaveTextContent('pt');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.lang).toBe('pt');
  });

  it('toggles theme and language and persists to localStorage', () => {
    render(
      <PreferencesProvider>
        <PreferencesProbe />
      </PreferencesProvider>
    );

    fireEvent.click(screen.getByText('Toggle Theme'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('portfolio-theme')).toBe('light');

    fireEvent.click(screen.getByText('Toggle Lang'));
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('portfolio-lang')).toBe('en');
  });
});

describe('useSkeletonTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('boots in skeleton state for initialDelayMs and resolves cleanly', () => {
    render(<SkeletonProbe initialDelayMs={450} transitionDelayMs={240} />);

    expect(screen.getByTestId('booting')).toHaveTextContent('true');

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(screen.getByTestId('booting')).toHaveTextContent('false');
  });

  it('cancels overlapping rapid transitions and applies only the latest state', () => {
    render(<SkeletonProbe initialDelayMs={100} transitionDelayMs={240} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    fireEvent.click(screen.getByText('Filter Frontend'));
    expect(screen.getByTestId('transitioning')).toHaveTextContent('true');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Rapid second click before first transition finishes
    fireEvent.click(screen.getByText('Filter Fullstack'));
    expect(screen.getByTestId('transitioning')).toHaveTextContent('true');

    act(() => {
      vi.advanceTimersByTime(240);
    });

    expect(screen.getByTestId('transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('value')).toHaveTextContent('fullstack');
  });
});
