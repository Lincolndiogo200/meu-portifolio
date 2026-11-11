import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoadingScreen } from '../components/ui/LoadingScreen';

describe('LoadingScreen (3D Workstation Loader)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders branding lincoln.diogo, progress bar, and accessibility roles', () => {
    render(<LoadingScreen progress={45} language="pt" />);

    const container = screen.getByTestId('studio-loading-screen');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('role', 'status');
    expect(container).toHaveAttribute('aria-live', 'polite');

    expect(screen.getByText('lincoln')).toBeInTheDocument();
    expect(screen.getByText('.diogo')).toBeInTheDocument();

    const progressBar = screen.getByTestId('loading-progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '45%' });

    expect(screen.getByTestId('loading-percentage-text')).toHaveTextContent('45%');
    expect(screen.getByTestId('loading-phase-text')).toHaveTextContent(/Carregando modelos e texturas/i);
  });

  it('adapts phase copy in English when language is en', () => {
    render(<LoadingScreen progress={95} language="en" />);

    expect(screen.getByTestId('loading-percentage-text')).toHaveTextContent('95%');
    expect(screen.getByTestId('loading-phase-text')).toHaveTextContent(/Portfolio ready/i);
    expect(screen.getByText('PORTFOLIO')).toBeInTheDocument();
  });

  it('renders rotating text ring with lincoln.diogo full-stack engineer and without 3D workspace', () => {
    render(<LoadingScreen progress={50} />);

    expect(screen.getByText(/• LINCOLN\.DIOGO • FULL-STACK ENGINEER/i)).toBeInTheDocument();
    expect(screen.queryByText(/3D WORKSPACE/i)).not.toBeInTheDocument();
  });

  it('reveals skip button after 2.5s and invokes onSkip when clicked', () => {
    const onSkipMock = vi.fn();
    render(<LoadingScreen progress={20} language="pt" onSkip={onSkipMock} />);

    expect(screen.queryByTestId('skip-loading-button')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const skipButton = screen.getByTestId('skip-loading-button');
    expect(skipButton).toBeInTheDocument();
    expect(skipButton).toHaveTextContent(/Pular carregamento/i);

    fireEvent.click(skipButton);
    expect(onSkipMock).toHaveBeenCalledTimes(1);
  });

  it('applies fade out styling when isFadingOut is true', () => {
    const { rerender } = render(<LoadingScreen progress={100} isFadingOut={false} />);
    const container = screen.getByTestId('studio-loading-screen');
    expect(container.className).toContain('opacity-100');

    rerender(<LoadingScreen progress={100} isFadingOut={true} />);
    expect(container.className).toContain('opacity-0');
    expect(container.className).toContain('pointer-events-none');
  });
});
