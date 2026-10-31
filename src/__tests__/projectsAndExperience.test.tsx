import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PreferencesProvider } from '../context/PreferencesContext';
import { ProjectsSection } from '../components/sections/ProjectsSection';
import { ExperienceTimeline } from '../components/sections/ExperienceTimeline';
import { ContactFooter } from '../components/layout/ContactFooter';

describe('ProjectsSection', () => {
  it('renders skeleton shimmer cards while loading', () => {
    render(
      <PreferencesProvider>
        <ProjectsSection
          isLoading={true}
          activeCategory="all"
          activeSkill={null}
          onSelectCategory={vi.fn()}
          onClearSkill={vi.fn()}
          onResetAll={vi.fn()}
        />
      </PreferencesProvider>
    );

    expect(screen.getAllByTestId('project-skeleton-card').length).toBeGreaterThanOrEqual(3);
  });

  it('filters projects by category and skill tag and opens accessible detail modal', () => {
    const onClearSkill = vi.fn();

    const { rerender } = render(
      <PreferencesProvider>
        <ProjectsSection
          isLoading={false}
          activeCategory="ai-data"
          activeSkill={null}
          onSelectCategory={vi.fn()}
          onClearSkill={onClearSkill}
          onResetAll={vi.fn()}
        />
      </PreferencesProvider>
    );

    expect(
      screen.getByText(/Plataforma White-Label & AI Backoffice Chatbot/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Strategy & Monte Carlo Analytics Engine/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/AquaProduce — Plataforma Institucional/i)
    ).not.toBeInTheDocument();

    // Open project modal
    fireEvent.click(screen.getByText(/Plataforma White-Label & AI Backoffice Chatbot/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Principais Entregas & Arquitetura/i)).toBeInTheDocument();

    // Escape closes modal
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Rerender with activeSkill = 'C#'
    rerender(
      <PreferencesProvider>
        <ProjectsSection
          isLoading={false}
          activeCategory="all"
          activeSkill="C#"
          onSelectCategory={vi.fn()}
          onClearSkill={onClearSkill}
          onResetAll={vi.fn()}
        />
      </PreferencesProvider>
    );

    expect(
      screen.getByText(/Sistema Corporativo de Gestão Educacional & KPIs/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Limpar filtro/i }));
    expect(onClearSkill).toHaveBeenCalledTimes(1);
  });
});

describe('ExperienceTimeline & ContactFooter', () => {
  it('renders all CV work experiences, education entries, and contact redirects', () => {
    render(
      <PreferencesProvider>
        <ExperienceTimeline />
        <ContactFooter />
      </PreferencesProvider>
    );

    expect(screen.getByText('Single Software')).toBeInTheDocument();
    expect(screen.getByText('SMN Tecnologia da Informação')).toBeInTheDocument();
    expect(screen.getByText('AquaProduce')).toBeInTheDocument();
    expect(screen.getByText('Unifacisa Centro Universitário')).toBeInTheDocument();
    expect(screen.getByText(/CRA: 8.9 \/ 10/i)).toBeInTheDocument();
    expect(
      screen.getByText('Universidade Federal de Campina Grande (UFCG)')
    ).toBeInTheDocument();

    const whatsappLink = screen.getByRole('link', { name: /WhatsApp/i });
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/5583999927369');
  });
});
