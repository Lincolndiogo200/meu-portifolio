import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreferencesProvider, usePreferences } from '../context/PreferencesContext';
import { HeroBento } from '../components/sections/HeroBento';
import { SkillsAndLanguages } from '../components/sections/SkillsAndLanguages';

function LanguageSwitchHelper() {
  const { toggleLanguage } = usePreferences();
  return <button onClick={toggleLanguage}>Switch Lang</button>;
}

describe('HeroBento & SkillsAndLanguages', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Lincoln Diogo profile, verified social redirects, and language-synced CV PDF link', () => {
    render(
      <PreferencesProvider>
        <LanguageSwitchHelper />
        <HeroBento />
      </PreferencesProvider>
    );

    expect(screen.getByRole('heading', { name: /Lincoln Diogo/i })).toBeInTheDocument();
    expect(screen.getByText(/Single Software/i)).toBeInTheDocument();

    const linkedinLink = screen.getByRole('link', { name: /LinkedIn/i });
    expect(linkedinLink).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/lincoln-diogo-973801323/'
    );

    const githubLink = screen.getByRole('link', { name: /GitHub/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Lincolndiogo200');

    const cvLinkPt = screen.getByRole('link', { name: /Baixar CV/i });
    expect(cvLinkPt.getAttribute('href')).toContain('cv/CV_Lincoln_PT.pdf');

    fireEvent.click(screen.getByText('Switch Lang'));
    const cvLinkEn = screen.getByRole('link', { name: /Download CV/i });
    expect(cvLinkEn.getAttribute('href')).toContain('cv/CV_Lincoln_EN.pdf');
  });

  it('copies real email address on click and displays confirmation', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(
      <PreferencesProvider>
        <HeroBento />
      </PreferencesProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Copiar E-mail/i }));
    expect(writeText).toHaveBeenCalledWith('dev.lincoln.diogo@gmail.com');

    await waitFor(() => {
      expect(screen.getByText(/Copiado!/i)).toBeInTheDocument();
    });
  });

  it('renders categorized tech skills, Português Nativo and Inglês Profissional, and triggers skill filter', () => {
    const onSelectSkill = vi.fn();

    render(
      <PreferencesProvider>
        <LanguageSwitchHelper />
        <SkillsAndLanguages activeSkill={null} onSelectSkill={onSelectSkill} />
      </PreferencesProvider>
    );

    expect(screen.getByText('Português')).toBeInTheDocument();
    expect(screen.getByText('Nativo')).toBeInTheDocument();
    expect(screen.getByText('Inglês')).toBeInTheDocument();
    expect(screen.getByText('Profissional')).toBeInTheDocument();

    const reactSkillBtn = screen.getByRole('button', { name: 'React' });
    fireEvent.click(reactSkillBtn);
    expect(onSelectSkill).toHaveBeenCalledWith('React');

    // Verify EN translation of language proficiencies
    fireEvent.click(screen.getByText('Switch Lang'));
    expect(screen.getByText('Portuguese')).toBeInTheDocument();
    expect(screen.getByText('Native')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Professional Working Proficiency')).toBeInTheDocument();
  });
});
