import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Bone,
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  computeRoomTransform,
} from '../../utils/cameraScrollMath';
import { LincolnAvatar3D } from './LincolnAvatar3D';
import { RubberDuck3D } from './RubberDuck3D';

interface RoomEnvironment3DProps {
  scrollProgress: number;
  isDark: boolean;
}

/**
 * High-resolution CMD / Terminal screen for the LEFT monitor (desktop-plane-1).
 * Displays developer Vitest test results and live Vite server status.
 */
function createTerminalTexture(): Texture {
  if (typeof document === 'undefined') {
    return new Texture();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Texture();

  // Dark terminal background
  ctx.fillStyle = '#080b12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Terminal Titlebar
  ctx.fillStyle = '#111726';
  ctx.fillRect(0, 0, canvas.width, 42);

  // Window control buttons
  const dots = [
    { x: 26, color: '#ef4444' },
    { x: 46, color: '#f59e0b' },
    { x: 66, color: '#10b981' },
  ];
  dots.forEach((d) => {
    ctx.beginPath();
    ctx.arc(d.x, 21, 6, 0, Math.PI * 2);
    ctx.fillStyle = d.color;
    ctx.fill();
  });

  // Tab text
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('lincoln@workstation: ~/portfolio (zsh)', canvas.width / 2, 26);
  ctx.textAlign = 'left';

  // Terminal Text lines
  const startX = 36;
  let startY = 82;
  const lineHeight = 30;

  // Command 1
  ctx.font = 'bold 16px "JetBrains Mono", Consolas, monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('portfolio git:(main) ❯', startX, startY);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('pnpm test', startX + 225, startY);
  startY += lineHeight;

  ctx.font = '14px "JetBrains Mono", Consolas, monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('RUN v3.2.7 C:/Users/lincoln/meu-portifolio', startX, startY);
  startY += lineHeight + 6;

  // Unit tests passing list
  const testFiles = [
    'src/__tests__/cameraScrollMath.test.ts (6 tests)',
    'src/__tests__/preferencesAndSkeleton.test.tsx (4 tests)',
    'src/__tests__/heroAndSkills.test.tsx (3 tests)',
    'src/__tests__/projectsAndExperience.test.tsx (3 tests)',
    'src/__tests__/workspace3DPortal.test.tsx (2 tests)',
    'src/__tests__/App.test.tsx (4 tests)',
  ];

  testFiles.forEach((f) => {
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 15px "JetBrains Mono", Consolas, monospace';
    ctx.fillText('✓', startX, startY);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px "JetBrains Mono", Consolas, monospace';
    ctx.fillText(f, startX + 24, startY);
    startY += lineHeight - 2;
  });

  startY += 6;
  // Summary
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 15px "JetBrains Mono", Consolas, monospace';
  ctx.fillText('Test Files  6 passed (6)', startX, startY);
  startY += lineHeight - 2;
  ctx.fillText('Tests       22 passed (22)', startX, startY);
  startY += lineHeight - 2;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "JetBrains Mono", Consolas, monospace';
  ctx.fillText('Duration    1.18s (tests 820ms, transform 360ms)', startX, startY);
  startY += lineHeight + 14;

  // Next command: Dev server
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px "JetBrains Mono", Consolas, monospace';
  ctx.fillText('portfolio git:(main) ❯', startX, startY);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('vite dev --host', startX + 225, startY);
  startY += lineHeight;

  ctx.fillStyle = '#10b981';
  ctx.font = '14px "JetBrains Mono", Consolas, monospace';
  ctx.fillText('VITE v8.3.2 ready in 142 ms', startX, startY);
  startY += lineHeight - 2;

  ctx.fillStyle = '#38bdf8';
  ctx.fillText('➜  Local:   http://localhost:5173/', startX, startY);
  startY += lineHeight - 2;

  ctx.fillStyle = '#64748b';
  ctx.fillText('●  Status: 3D Studio active · Portal ready', startX, startY);

  const texture = new CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * High-resolution Portfolio Preview for the RIGHT monitor (desktop-plane-0).
 * Displays Lincoln's actual website UI: brand navbar, photo avatar, hero greeting,
 * stack badges, and bento cards, with smooth scroll during zoom!
 */
function createPortfolioPreviewTexture(onImageLoaded?: () => void): Texture {
  if (typeof document === 'undefined') {
    return new Texture();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Texture();

  const renderContent = (avatarImg?: HTMLImageElement) => {
    // Zinc-950 background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Browser Chrome Header
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, 42);

    // Window controls
    const dots = [
      { x: 26, color: '#ef4444' },
      { x: 46, color: '#f59e0b' },
      { x: 66, color: '#10b981' },
    ];
    dots.forEach((d) => {
      ctx.beginPath();
      ctx.arc(d.x, 21, 6, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.fill();
    });

    // Browser URL Pill
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.roundRect(140, 9, canvas.width - 280, 24, 6);
    ctx.fill();

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔒 https://lincoln-diogo.dev/portfolio', canvas.width / 2, 25);
    ctx.textAlign = 'left';

    // Navbar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 42, canvas.width, 68);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 110);
    ctx.lineTo(canvas.width, 110);
    ctx.stroke();

    // Brand Logo
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('lincoln', 48, 83);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('.diogo', 122, 83);

    // Nav Items
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    const navItems = ['Sobre', 'Skills', 'Projetos', 'Experiência', 'Contato'];
    let navX = 350;
    navItems.forEach((item) => {
      ctx.fillText(item, navX, 83);
      navX += 95;
    });

    // Language Badge
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.roundRect(canvas.width - 120, 62, 72, 32, 16);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.fillText('PT / EN', canvas.width - 108, 82);

    // Hero Section Content
    const heroY = 155;

    // Badge: "Setup Interativo 3D"
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(48, heroY, 270, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.fillText('✨ Setup Interativo 3D · Three.js', 66, heroY + 21);

    // Circular Avatar with amber glowing border
    const avatarCenterX = 96;
    const avatarCenterY = heroY + 88;
    const avatarRadius = 40;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
    ctx.clip();
    if (avatarImg && avatarImg.complete) {
      ctx.drawImage(
        avatarImg,
        avatarCenterX - avatarRadius,
        avatarCenterY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(
        avatarCenterX - avatarRadius,
        avatarCenterY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LD', avatarCenterX, avatarCenterY + 8);
      ctx.textAlign = 'left';
    }
    ctx.restore();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Greeting & Headline
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText('OLÁ, EU SOU', 158, heroY + 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Inter", sans-serif';
    ctx.fillText('Lincoln Diogo', 158, heroY + 108);

    ctx.fillStyle = '#f4f4f5';
    ctx.font = '600 24px "Inter", sans-serif';
    ctx.fillText('Senior Frontend Engineer & Creative Developer', 48, heroY + 168);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '15px "Inter", sans-serif';
    ctx.fillText(
      'Especialista em React, TypeScript, Three.js, WebGL e arquitetura moderna de aplicações.',
      48,
      heroY + 200
    );

    // Action CTA Buttons
    // Primary Button
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(48, heroY + 232, 175, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#09090b';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText('Ver Projetos ↓', 84, heroY + 259);

    // Secondary Button
    ctx.fillStyle = '#27272a';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(240, heroY + 232, 140, 44, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f4f4f5';
    ctx.fillText('Baixar CV', 278, heroY + 259);

    // Bento Cards Preview Grid
    const bentoY = heroY + 305;

    // Card 1: Tech Stack
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(48, bentoY, 440, 245, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('TECH STACK', 72, bentoY + 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillText('Especialidades & Ferramentas', 72, bentoY + 70);

    const badges = [
      { name: 'React 19', bg: '#0284c7' },
      { name: 'TypeScript', bg: '#2563eb' },
      { name: 'Three.js / WebGL', bg: '#d97706' },
      { name: 'Next.js', bg: '#3f3f46' },
      { name: 'Tailwind CSS', bg: '#0284c7' },
      { name: 'Vitest / TDD', bg: '#16a34a' },
    ];

    let badgeX = 72;
    let badgeY = bentoY + 115;
    badges.forEach((b, idx) => {
      ctx.fillStyle = b.bg;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, 116, 34, 17);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.name, badgeX + 58, badgeY + 21);
      ctx.textAlign = 'left';

      badgeX += 128;
      if (idx === 2) {
        badgeX = 72;
        badgeY += 46;
      }
    });

    // Card 2: Featured Project
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.roundRect(512, bentoY, 464, 245, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('PROJETO EM DESTAQUE', 536, bentoY + 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillText('Workspace 3D Interativo', 536, bentoY + 70);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('Experiência imersiva 3D com Three.js e React.', 536, bentoY + 106);
    ctx.fillText('Navegação orbital e portal dimensional para portfólio.', 536, bentoY + 130);

    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.roundRect(536, bentoY + 168, 200, 38, 19);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.fillText('✦ Explorar Projeto', 572, bentoY + 192);

    // Section 2 Header (revealed as visitor zooms and scrolls)
    const projectsY = bentoY + 285;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText('// PORTFÓLIO DE PROJETOS', 48, projectsY + 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Inter", sans-serif';
    ctx.fillText('Trabalhos Selecionados & Casos Reais', 48, projectsY + 68);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('Aplicações web completas, interfaces de alto desempenho e gráficos 3D.', 48, projectsY + 98);

    // Project Cards
    const cardAY = projectsY + 115;
    // Card A
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(48, cardAY, 440, 215, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('FINTECH & SAAS', 72, cardAY + 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 19px "Inter", sans-serif';
    ctx.fillText('Plataforma Financeira Inteligente', 72, cardAY + 64);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText('Dashboard analítico em tempo real com gráficos interativos,', 72, cardAY + 95);
    ctx.fillText('alta escalabilidade e testes end-to-end automatizados.', 72, cardAY + 118);

    const projBadgesA = ['React', 'TypeScript', 'Tailwind', 'Next.js'];
    let pbx = 72;
    projBadgesA.forEach((b) => {
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.roundRect(pbx, cardAY + 150, 78, 26, 13);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b, pbx + 39, cardAY + 167);
      ctx.textAlign = 'left';
      pbx += 86;
    });

    // Card B
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.roundRect(512, cardAY, 464, 215, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('3D & CREATIVE WEB', 536, cardAY + 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 19px "Inter", sans-serif';
    ctx.fillText('E-Commerce Imersivo 3D', 536, cardAY + 64);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText('Showroom tridimensional em WebGL com customização de', 536, cardAY + 95);
    ctx.fillText('produtos em tempo real e iluminação com PBR shader.', 536, cardAY + 118);

    const projBadgesB = ['Three.js', 'WebGL', 'Zustand', 'GLSL'];
    let pbxB = 536;
    projBadgesB.forEach((b) => {
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.roundRect(pbxB, cardAY + 150, 78, 26, 13);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b, pbxB + 39, cardAY + 167);
      ctx.textAlign = 'left';
      pbxB += 86;
    });
  };

  renderContent();

  const texture = new CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 0.58);
  texture.offset.set(0, 0.42);

  if (typeof Image !== 'undefined') {
    const avatar = new Image();
    avatar.crossOrigin = 'anonymous';
    avatar.src = `${import.meta.env.BASE_URL}images/lincoln-avatar.jpg`;
    avatar.onload = () => {
      renderContent(avatar);
      texture.needsUpdate = true;
      if (onImageLoaded) onImageLoaded();
    };
  }

  return texture;
}

/**
 * Modern framed React 19 art poster for the wall picture frame.
 * Displays glowing cyan atom orbits on a sleek dark slate background.
 */
function createReactPosterTexture(): Texture {
  if (typeof document === 'undefined') return new Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 680;
  canvas.height = 580;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Texture();

  // Dark sleek carbon background
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle radial gradient aura
  const grad = ctx.createRadialGradient(canvas.width / 2, 230, 20, canvas.width / 2, 230, 280);
  grad.addColorStop(0, 'rgba(0, 216, 255, 0.25)');
  grad.addColorStop(0.5, 'rgba(0, 216, 255, 0.06)');
  grad.addColorStop(1, 'rgba(10, 13, 20, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer framed border
  ctx.strokeStyle = 'rgba(0, 216, 255, 0.3)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  // Draw React Atom
  const cx = canvas.width / 2;
  const cy = 230;
  const rx = 165;
  const ry = 62;

  ctx.save();
  ctx.strokeStyle = '#00d8ff';
  ctx.shadowColor = '#00d8ff';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 7.5;

  // 3 orbital rings at 0, 60, 120 degrees
  [0, Math.PI / 3, (Math.PI * 2) / 3].forEach((angle) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, angle, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Central nucleus
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#00d8ff';
  ctx.shadowBlur = 24;
  ctx.fill();
  ctx.restore();

  // Typography below
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px "Inter", -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('React 19', cx, 420);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px "JetBrains Mono", Consolas, monospace';
  ctx.fillText('// THE UI RUNTIME OF CHOICE', cx, 460);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "Inter", sans-serif';
  ctx.fillText('Declarative · Component-Driven · High Performance', cx, 495);

  const texture = new CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * Pinned official TypeScript logo plate for the corkboard and desk trophy.
 */
function createTypeScriptPosterTexture(): Texture {
  if (typeof document === 'undefined') return new Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Texture();

  // Official TypeScript blue
  ctx.fillStyle = '#3178c6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle border highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  // Bold "TS" logo in white
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 195px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('TS', canvas.width - 24, canvas.height - 14);

  // Small subtitle on top
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('TypeScript', 24, 24);
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('strict: true', 24, 54);

  const texture = new CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * Developer sticky note with TypeScript types and vitest test badge.
 */
function createStickyNoteTexture(): Texture {
  if (typeof document === 'undefined') return new Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Texture();

  // Canary yellow sticky note paper
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#854d0e';
  ctx.fillText('// ARCHITECTURE', 26, 44);

  // Handwritten/monospace developer code
  const lines = [
    'type SeniorDev = {',
    '  frontend: "React" | "Next",',
    '  typeSafe: true,',
    '  creative: "Three.js",',
    '  rubberDuck: "Quack! 🦆"',
    '};',
    '',
    '✓ Vitest: 22 passed',
  ];
  let y = 84;
  lines.forEach((line) => {
    if (line.includes('passed')) {
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
    } else if (line.includes('type SeniorDev')) {
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
    } else {
      ctx.fillStyle = '#1c1917';
      ctx.font = '14px "JetBrains Mono", monospace';
    }
    ctx.fillText(line, 26, y);
    y += 28;
  });

  const texture = new CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const SHADOW_VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vUv = uv;
}
`;

const SHADOW_FRAGMENT_SHADER = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec3 uColorBackground;
uniform vec3 uColorShadow;

void main() {
  vec4 shadow = texture2D(uTexture, vUv);
  float intensity = shadow.r;
  vec3 color = mix(uColorShadow.rgb, uColorBackground.rgb, intensity);
  gl_FragColor = vec4(color, 1.0);
}
`;

const ROOM_MESH_NAMES = [
  'blackboard',
  'carpet',
  'chair',
  'frame',
  'mouse',
  'music',
  'plant',
  'room',
  'shelf',
] as const;

export const RoomEnvironment3D: React.FC<RoomEnvironment3DProps> = ({
  scrollProgress,
  isDark: _isDark,
}) => {
  const rootWrapperRef = useRef<Group>(null);
  const roomGroupRef = useRef<Group>(null);
  const chairMeshRef = useRef<Mesh | null>(null);
  const chairBasePosRef = useRef(new Vector3(0, 0.0169, 0.66));
  const mouseMeshRef = useRef<Mesh | null>(null);
  const mouseBasePosRef = useRef(new Vector3());
  const rightHandBoneRef = useRef<Bone | null>(null);
  const chairSwivelRef = useRef(0);
  const dropStartTimeRef = useRef<number | null>(null);
  const portfolioTexRef = useRef<Texture | null>(null);

  // High-resolution developer art & mascot textures
  const reactPosterTex = useMemo(() => createReactPosterTexture(), []);
  const tsPosterTex = useMemo(() => createTypeScriptPosterTexture(), []);
  const stickyNoteTex = useMemo(() => createStickyNoteTexture(), []);

  useEffect(() => {
    return () => {
      reactPosterTex.dispose();
      tsPosterTex.dispose();
      stickyNoteTex.dispose();
    };
  }, [reactPosterTex, tsPosterTex, stickyNoteTex]);

  const shadowUniformsRef = useRef({
    uTexture: { value: null as Texture | null },
    uColorBackground: { value: new Color('#c8b9a6') },
    uColorShadow: { value: new Color('rgb(170, 155, 140)') },
  });

  useEffect(() => {
    shadowUniformsRef.current.uColorBackground.value.set('#c8b9a6');
    shadowUniformsRef.current.uColorShadow.value.set('rgb(170, 155, 140)');
  }, []);

  useEffect(() => {
    let isMounted = true;
    const base = import.meta.env.BASE_URL;
    const gltfLoader = new GLTFLoader();
    const texLoader = new TextureLoader();

    const loadTex = (path: string, srgb = false, flipY = false): Promise<Texture> =>
      new Promise((resolve, reject) => {
        texLoader.load(
          `${base}${path}`,
          (tex) => {
            tex.flipY = flipY;
            tex.colorSpace = srgb ? SRGBColorSpace : LinearSRGBColorSpace;
            resolve(tex);
          },
          undefined,
          reject
        );
      });

    Promise.all([
      new Promise<{ scene: Group }>((resolve, reject) => {
        gltfLoader.load(`${base}assets/models/room.glb`, resolve, undefined, reject);
      }),
      loadTex('assets/textures/room.webp', true, false),
      loadTex('assets/textures/room-shadow.webp', false, false),
    ])
      .then(([gltf, roomTex, shadowTex]) => {
        if (!isMounted || !roomGroupRef.current) return;

        roomGroupRef.current.clear();

        const roomMaterial = new MeshBasicMaterial({ map: roomTex });

        // Setup baked room meshes
        for (const name of ROOM_MESH_NAMES) {
          const obj = gltf.scene.children.find((child) => child.name === name);
          if (!obj) continue;

          obj.traverse((child) => {
            if (child instanceof Mesh) {
              child.material = roomMaterial;
            }
          });

          if (name === 'carpet' && obj instanceof Mesh) {
            obj.renderOrder = -10;
            obj.onBeforeRender = () => {
              roomMaterial.depthWrite = false;
            };
            obj.onAfterRender = () => {
              roomMaterial.depthWrite = true;
            };
          }

          if (name === 'chair' && obj instanceof Mesh) {
            chairMeshRef.current = obj;
            chairBasePosRef.current.copy(obj.position);
          }

          if (name === 'mouse' && obj instanceof Mesh) {
            mouseMeshRef.current = obj;
            mouseBasePosRef.current.copy(obj.position);
          }

          roomGroupRef.current.add(obj);
        }

        // Setup shadow-catcher plane
        const shadowMesh = gltf.scene.children.find(
          (child) => child.name === 'shadow-catcher'
        ) as Mesh | undefined;
        if (shadowMesh) {
          shadowUniformsRef.current.uTexture.value = shadowTex;
          shadowMesh.material = new ShaderMaterial({
            vertexShader: SHADOW_VERTEX_SHADER,
            fragmentShader: SHADOW_FRAGMENT_SHADER,
            depthWrite: false,
            depthTest: false,
            uniforms: shadowUniformsRef.current,
          });
          shadowMesh.renderOrder = -1000;
          roomGroupRef.current.add(shadowMesh);
        }

        // Setup dual monitors:
        // - Right monitor (desktop-plane-0): LIVE PORTFOLIO PREVIEW (zoomed into on scroll)
        // - Left monitor (desktop-plane-1): CMD TERMINAL WITH VITEST TESTS
        const desktop1 = gltf.scene.children.find(
          (child) => child.name === 'desktop-plane-0'
        ) as Mesh | undefined;
        const desktop2 = gltf.scene.children.find(
          (child) => child.name === 'desktop-plane-1'
        ) as Mesh | undefined;

        if (desktop1 && desktop2) {
          // 1. Right Monitor: Portfolio Preview
          const geom1 = desktop1.geometry.clone();
          geom1.translate(desktop1.position.x, desktop1.position.y, desktop1.position.z);
          const uv1 = geom1.attributes.uv;
          for (let i = 0; i < uv1.count; i++) {
            const u = uv1.getX(i);
            const v = uv1.getY(i);
            const normU = (u - 0.001) / (0.498 - 0.001);
            // Invert V (1.0 - normV) so top vertex (v=0.001) maps to top of canvas (1.0)
            const normV = 1.0 - (v - 0.001) / (0.329 - 0.001);
            uv1.setXY(i, Math.max(0, Math.min(1, normU)), Math.max(0, Math.min(1, normV)));
          }
          uv1.needsUpdate = true;

          const portfolioTex = createPortfolioPreviewTexture();
          portfolioTexRef.current = portfolioTex;
          const portfolioMaterial = new MeshBasicMaterial({
            map: portfolioTex,
            toneMapped: false,
          });
          const desktopRightMesh = new Mesh(geom1, portfolioMaterial);
          roomGroupRef.current.add(desktopRightMesh);

          // 2. Left Monitor: CMD Terminal with Vitest Tests
          const geom2 = desktop2.geometry.clone();
          geom2.translate(desktop2.position.x, desktop2.position.y, desktop2.position.z);
          const uv2 = geom2.attributes.uv;
          for (let i = 0; i < uv2.count; i++) {
            const u = uv2.getX(i);
            const v = uv2.getY(i);
            const normU = (u - 0.500) / (1.000 - 0.500);
            // Invert V (1.0 - normV) so top vertex (v=0.003) maps to top of terminal titlebar (1.0)
            const normV = 1.0 - (v - 0.003) / (0.354 - 0.003);
            uv2.setXY(i, Math.max(0, Math.min(1, normU)), Math.max(0, Math.min(1, normV)));
          }
          uv2.needsUpdate = true;

          const terminalTex = createTerminalTexture();
          const terminalMaterial = new MeshBasicMaterial({
            map: terminalTex,
            toneMapped: false,
          });
          const desktopLeftMesh = new Mesh(geom2, terminalMaterial);
          roomGroupRef.current.add(desktopLeftMesh);
        }
      })
      .catch(() => {
        // Ignore in headless test environments
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (dropStartTimeRef.current === null) {
      dropStartTimeRef.current = t;
    }

    const roomTransform = computeRoomTransform(scrollProgress);

    // Position the unified room + avatar root wrapper
    if (rootWrapperRef.current) {
      rootWrapperRef.current.position.set(
        roomTransform.roomPosition[0],
        roomTransform.roomPosition[1],
        roomTransform.roomPosition[2]
      );
      rootWrapperRef.current.rotation.set(0, roomTransform.roomRotationY, 0);
    }

    // Chair rolls back & aside on scroll, and swivels in lockstep with Lincoln
    if (chairMeshRef.current) {
      chairMeshRef.current.position.set(
        chairBasePosRef.current.x - roomTransform.chairSlideOffset * 0.45,
        chairBasePosRef.current.y,
        chairBasePosRef.current.z + roomTransform.chairSlideOffset * 0.85
      );
      chairMeshRef.current.rotation.set(
        0,
        roomTransform.chairRotationY + chairSwivelRef.current,
        0
      );
    }

    // Scroll portfolio preview down on the right monitor in sync with camera zoom
    if (portfolioTexRef.current) {
      portfolioTexRef.current.offset.y = 0.42 * (1.0 - scrollProgress);
    }

    // Sync desk mouse with avatar's right hand bone
    if (
      mouseMeshRef.current &&
      rightHandBoneRef.current &&
      roomGroupRef.current &&
      scrollProgress < 0.1
    ) {
      const worldHand = new Vector3();
      rightHandBoneRef.current.getWorldPosition(worldHand);
      roomGroupRef.current.worldToLocal(worldHand);
      if (
        worldHand.y <= 1.8 &&
        worldHand.x >= -0.9 &&
        worldHand.x <= -0.7 &&
        worldHand.z >= -0.6 &&
        worldHand.z <= -0.28
      ) {
        mouseMeshRef.current.position.set(
          worldHand.x,
          mouseBasePosRef.current.y,
          worldHand.z - 0.15
        );
      }
    }
  });

  return (
    <group ref={rootWrapperRef}>
      <group ref={roomGroupRef} />

      {/* Cozy Warm Studio Room Architecture: Isometric Walls, Floor & Warm Lighting */}
      <group name="studio-room-architecture">
        {/* Right Wall (behind corkboard, floating shelf, picture frame) - Warm cozy cream */}
        <mesh position={[-2.72, 3.1, 2.1]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[9.2, 6.2]} />
          <meshStandardMaterial
            color="#eae3d2"
            roughness={0.85}
            metalness={0.02}
          />
        </mesh>

        {/* Back Wall (behind monitors and workstation desk) - Warm cozy cream */}
        <mesh position={[-0.02, 3.1, 6.7]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[5.4, 6.2]} />
          <meshStandardMaterial
            color="#eae3d2"
            roughness={0.85}
            metalness={0.02}
          />
        </mesh>

        {/* Studio Floor Platform - Warm Scandinavian light wood tone */}
        <mesh position={[-0.02, 0.002, 2.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.4, 9.2]} />
          <meshStandardMaterial
            color="#c8b9a6"
            roughness={0.7}
            metalness={0.02}
          />
        </mesh>

        {/* Baseboard Trim: Right Wall - Warm wood */}
        <mesh position={[-2.70, 0.09, 2.1]}>
          <boxGeometry args={[0.04, 0.18, 9.2]} />
          <meshStandardMaterial
            color="#8c7355"
            roughness={0.65}
          />
        </mesh>

        {/* Baseboard Trim: Back Wall - Warm wood */}
        <mesh position={[-0.02, 0.09, 6.68]}>
          <boxGeometry args={[5.4, 0.18, 0.04]} />
          <meshStandardMaterial
            color="#8c7355"
            roughness={0.65}
          />
        </mesh>

        {/* Soft Warm Ambient Desk Light */}
        <pointLight
          position={[-1.4, 2.8, 4.2]}
          color="#fff5ea"
          intensity={0.9}
          distance={8}
          decay={1.8}
        />
      </group>

      {/* Developer Studio Wall & Furniture Decor */}
      <group name="developer-decor">
        {/* 1. React 19 Art inside Wall Picture Frame */}
        <mesh position={[-2.572, 3.266, -2.889]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.30, 1.12]} />
          <meshBasicMaterial map={reactPosterTex} toneMapped={false} />
        </mesh>
        {/* Soft Cyan Glow from React frame */}
        <pointLight
          position={[-2.35, 3.266, -2.889]}
          color="#00d8ff"
          intensity={0.4}
          distance={2.5}
          decay={2}
        />

        {/* 2. TypeScript Logo Plate Pinned on Corkboard */}
        <group position={[-2.152, 4.65, 0.75]} rotation={[0, Math.PI / 2, 0.04]}>
          <mesh>
            <planeGeometry args={[0.36, 0.36]} />
            <meshBasicMaterial map={tsPosterTex} toneMapped={false} />
          </mesh>
          {/* Red pushpin */}
          <mesh position={[0, 0.17, 0.015]}>
            <sphereGeometry args={[0.022, 16, 16]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.1} />
          </mesh>
        </group>

        {/* 3. Developer Architecture Sticky Note Pinned on Corkboard */}
        <group position={[-2.152, 4.38, -0.45]} rotation={[0, Math.PI / 2, -0.04]}>
          <mesh>
            <planeGeometry args={[0.42, 0.38]} />
            <meshBasicMaterial map={stickyNoteTex} toneMapped={false} />
          </mesh>
          {/* Blue pushpin */}
          <mesh position={[0, 0.18, 0.015]}>
            <sphereGeometry args={[0.022, 16, 16]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.1} />
          </mesh>
        </group>

        {/* 4. 3D TypeScript Collectible Cube on Floating Shelf */}
        <group position={[-2.22, 4.02, 3.82]} rotation={[0, 0.28, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial color="#3178c6" roughness={0.25} metalness={0.06} />
          </mesh>
          {/* Front Face TS Badge */}
          <mesh position={[0, 0, 0.112]}>
            <planeGeometry args={[0.18, 0.18]} />
            <meshBasicMaterial map={tsPosterTex} toneMapped={false} />
          </mesh>
        </group>

        {/* 5. Programming Books Stack on Floating Shelf */}
        <group position={[-2.22, 4.03, 3.35]}>
          {/* Book 1: Clean Code (Navy) */}
          <mesh position={[0, 0, 0.12]} rotation={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[0.08, 0.32, 0.22]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.55} />
          </mesh>
          {/* Book 2: Design Patterns & TS (Emerald) */}
          <mesh position={[0, -0.01, 0.02]} rotation={[0, -0.06, 0]} castShadow>
            <boxGeometry args={[0.07, 0.30, 0.22]} />
            <meshStandardMaterial color="#047857" roughness={0.55} />
          </mesh>
          {/* Book 3: Three.js & WebGL (Amber) */}
          <mesh position={[0, -0.02, -0.08]} rotation={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.08, 0.28, 0.21]} />
            <meshStandardMaterial color="#b45309" roughness={0.55} />
          </mesh>
        </group>

        {/* 6. Yellow Rubber Duck on Workstation Desk (replaces penguin) */}
        <RubberDuck3D
          position={[-0.20, 1.493, 2.62]}
          rotation={[0, 0.48, 0]}
          scale={1.0}
        />
      </group>

      <LincolnAvatar3D
        scrollProgress={scrollProgress}
        onRightHandBoneReady={(bone) => {
          rightHandBoneRef.current = bone;
        }}
        onSwivelChange={(swivel) => {
          chairSwivelRef.current = swivel;
        }}
      />
    </group>
  );
};
