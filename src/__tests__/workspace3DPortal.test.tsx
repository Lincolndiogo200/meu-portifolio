import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreferencesProvider } from '../context/PreferencesContext';
import { Workspace3DPortal } from '../components/3d/Workspace3DPortal';

describe('Workspace3DPortal (3D Room & Monitor Zoom Portal)', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('renders the initial 3D workstation stage, Lincoln avatar identity, and Enter Monitor CTA', () => {
    const onEnterMonitor = vi.fn();

    render(
      <PreferencesProvider>
        <Workspace3DPortal onEnterMonitor={onEnterMonitor} />
      </PreferencesProvider>
    );

    const portal = screen.getByTestId('workspace-3d-portal');
    expect(portal).toBeInTheDocument();
    expect(portal).toHaveAttribute('data-portal-state', 'room-overview');

    expect(screen.getByTestId('monitor-portal-screen')).toBeInTheDocument();

    const enterButton = screen.getByRole('button', { name: /Entrar no Monitor/i });
    expect(enterButton).toBeInTheDocument();

    fireEvent.click(enterButton);
    expect(onEnterMonitor).toHaveBeenCalledTimes(1);
  });

  it('transitions into inside-monitor state on scroll and allows returning to the 3D setup', () => {
    render(
      <PreferencesProvider>
        <Workspace3DPortal />
      </PreferencesProvider>
    );

    const portal = screen.getByTestId('workspace-3d-portal');
    expect(portal).toHaveAttribute('data-portal-state', 'room-overview');

    // Simulate scrolling past 85% of the zoom runway
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 900 });
    fireEvent.scroll(window);

    expect(portal).toHaveAttribute('data-portal-state', 'inside-monitor');

    const backButton = screen.getByTestId('back-to-3d-button');
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
