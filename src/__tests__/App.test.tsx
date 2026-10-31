import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from '../App';

describe('App End-to-End Portfolio Experience', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.lang = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('boots with initial Skeleton UI and hydrates complete portfolio after 450ms', () => {
    render(<App />);

    expect(screen.getByTestId('hero-skeleton')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(screen.queryByTestId('hero-skeleton')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Lincoln Diogo/i })).toBeInTheDocument();
    expect(screen.getByText('Português')).toBeInTheDocument();
    expect(screen.getByText('Nativo')).toBeInTheDocument();
    expect(screen.getByText('Inglês')).toBeInTheDocument();
    expect(screen.getByText('Profissional')).toBeInTheDocument();
  });

  it('triggers reactive Skeleton shimmer when filtering projects via skill badge', () => {
    render(<App />);

    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Click Docker skill pill in Skills section
    fireEvent.click(screen.getByRole('button', { name: 'Docker' }));

    // Should enter 240ms skeleton transition
    expect(screen.getAllByTestId('project-skeleton-card').length).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(240);
    });

    expect(screen.queryAllByTestId('project-skeleton-card')).toHaveLength(0);
    expect(screen.getByText(/Strategy & Monte Carlo Analytics Engine/i)).toBeInTheDocument();
    expect(screen.queryByText(/Planify — Gestão Estratégica/i)).not.toBeInTheDocument();
  });

  it('opens Command Palette via Ctrl+K, filters commands, and toggles theme', () => {
    render(<App />);

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Open via Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    const searchInput = screen.getByPlaceholderText(/Digite um comando/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'tema' } });
    fireEvent.click(screen.getByText(/Alternar tema/i));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.queryByPlaceholderText(/Digite um comando/i)).not.toBeInTheDocument();
  });

  it('switches language from PT to EN across navbar and sections', () => {
    render(<App />);

    act(() => {
      vi.advanceTimersByTime(450);
    });

    fireEvent.click(screen.getByRole('button', { name: /Mudar idioma para Inglês/i }));

    act(() => {
      vi.advanceTimersByTime(240);
    });

    expect(
      screen.getByText(/Software Engineer \(Frontend\) @ Single Software/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Professional Working Proficiency')).toBeInTheDocument();
  });
});
