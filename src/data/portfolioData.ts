import type {
  EducationItem,
  ExperienceItem,
  HeroContent,
  Language,
  PortfolioProject,
  SkillGroup,
  SocialLinks,
  SpokenLanguage,
  UILabels,
} from '../types/portfolio';

export const socialLinks: SocialLinks = {
  linkedin: 'https://www.linkedin.com/in/lincoln-diogo-973801323/',
  github: 'https://github.com/Lincolndiogo200',
  email: 'dev.lincoln.diogo@gmail.com',
  phoneDisplay: '+55 (83) 99992-7369',
  whatsappUrl: 'https://wa.me/5583999927369',
  cvPath: {
    pt: `${import.meta.env.BASE_URL}cv/CV_Lincoln_PT.pdf`,
    en: `${import.meta.env.BASE_URL}cv/CV_Lincoln_EN.pdf`,
  },
};

export const heroContent: HeroContent = {
  name: 'Lincoln Diogo',
  roleBadge: {
    pt: 'Engenheiro de Software (Frontend) @ Single Software',
    en: 'Software Engineer (Frontend) @ Single Software',
  },
  headline: {
    pt: 'Construindo interfaces escaláveis, reativas e sistemas de alta performance.',
    en: 'Building scalable, reactive interfaces and high-performance software systems.',
  },
  bio: {
    pt: 'Engenheiro de Software focado em arquitetura front-end moderna e desenvolvimento fullstack com React, TypeScript, Tailwind CSS, Vue/Nuxt e .NET — unindo código limpo, UX fluida e entregas de alto impacto.',
    en: 'Software Engineer focused on modern frontend architecture and fullstack engineering with React, TypeScript, Tailwind CSS, Vue/Nuxt, and .NET — combining clean code, fluid UX, and high-impact delivery.',
  },
  focusTitle: {
    pt: 'Foco Atual',
    en: 'Current Focus',
  },
  focusBody: {
    pt: 'Arquitetura front-end white-label em escala, integração prática de IA / LLMs em fluxos operacionais e internacionalização ponta a ponta (i18n).',
    en: 'Scalable white-label frontend architecture, practical AI / LLM workflow integration, and end-to-end internationalization (i18n).',
  },
  highlights: [
    {
      value: 'CRA 8.9/10',
      label: {
        pt: 'Sistemas de Informação · Unifacisa',
        en: 'B.Sc. Information Systems · GPA 8.9/10',
      },
    },
    {
      value: 'PB, Brasil',
      label: {
        pt: 'Campina Grande · Remoto / Híbrido',
        en: 'Campina Grande · Remote / Hybrid',
      },
    },
  ],
};

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    title: {
      pt: 'Frontend & UI',
      en: 'Frontend & UI',
    },
    skills: [
      { name: 'React', featured: true },
      { name: 'TypeScript', featured: true },
      { name: 'Tailwind CSS', featured: true },
      { name: 'Next.js' },
      { name: 'Vue.js 3' },
      { name: 'Nuxt.js' },
      { name: 'Pinia' },
      { name: 'PrimeVue' },
      { name: 'Vuetify' },
      { name: 'HTML5/CSS3' },
    ],
  },
  {
    id: 'backend',
    title: {
      pt: 'Backend & Bancos de Dados',
      en: 'Backend & Databases',
    },
    skills: [
      { name: 'Node.js' },
      { name: 'C#' },
      { name: '.NET / ASP.NET' },
      { name: 'PostgreSQL' },
      { name: 'SQL Server' },
      { name: 'MySQL' },
      { name: 'RESTful APIs' },
    ],
  },
  {
    id: 'tools',
    title: {
      pt: 'Ferramentas, IA & Práticas',
      en: 'Tools, AI & Practices',
    },
    skills: [
      { name: 'Git' },
      { name: 'Docker' },
      { name: 'AI / LLMs' },
      { name: 'i18n' },
      { name: 'Clean Code' },
      { name: 'Agile / Scrum' },
    ],
  },
];

export const spokenLanguages: SpokenLanguage[] = [
  {
    id: 'pt',
    name: {
      pt: 'Português',
      en: 'Portuguese',
    },
    level: {
      pt: 'Nativo',
      en: 'Native',
    },
    percentage: 100,
    accent: 'emerald',
  },
  {
    id: 'en',
    name: {
      pt: 'Inglês',
      en: 'English',
    },
    level: {
      pt: 'Profissional',
      en: 'Professional Working Proficiency',
    },
    percentage: 85,
    accent: 'sky',
  },
];

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'whitelabel-ai-backoffice',
    title: {
      pt: 'Plataforma White-Label & AI Backoffice Chatbot',
      en: 'White-Label Platform & AI Backoffice Chatbot',
    },
    contextTag: {
      pt: 'Single Software · Produção',
      en: 'Single Software · Production',
    },
    categories: ['frontend', 'ai-data'],
    summary: {
      pt: 'Arquitetura front-end multi-marca de alta performance e Backoffice administrativo com Chatbot de IA integrado e suporte internacional (i18n).',
      en: 'High-performance multi-brand frontend architecture and administrative Backoffice featuring an integrated AI operator Chatbot and end-to-end i18n.',
    },
    description: {
      pt: 'Liderança front-end do ecossistema administrativo (gestão, operação e relatórios) e interfaces white-label para múltiplas marcas, incluindo idealização e entrega de assistente com IA para consultas e ações via linguagem natural.',
      en: 'Frontend leadership for administrative Backoffice modules (management, operations, reporting) and multi-brand user interfaces, including conceiving and shipping a natural-language AI assistant for operators.',
    },
    deliverables: {
      pt: [
        'Idealização e implementação de Chatbot com IA integrado ao Backoffice para consultas contextuais e parametrizações via linguagem natural.',
        'Internacionalização (i18n) ponta a ponta para Inglês e Espanhol visando expansão internacional.',
        'Padronização arquitetural e componentização modular de alta reusabilidade.',
      ],
      en: [
        'Spearheaded an AI-powered Backoffice Chatbot enabling contextual queries and configuration actions via natural language.',
        'Implemented end-to-end internationalization (i18n) for English and Spanish markets.',
        'Standardized modular component libraries ensuring high code reusability and clean architecture.',
      ],
    },
    technologies: ['TypeScript', 'Tailwind CSS', 'Vue.js 3', 'Nuxt.js', 'Pinia', 'PrimeVue', 'Vuetify', 'AI / LLMs', 'i18n'],
    isEnterpriseCase: true,
  },
  {
    id: 'planify-workspace',
    title: {
      pt: 'Planify — Gestão Estratégica & Kanban',
      en: 'Planify — Strategic Task & Kanban Workspace',
    },
    contextTag: {
      pt: 'Projeto Autoral · Web App',
      en: 'Personal Project · Web App',
    },
    categories: ['frontend', 'fullstack'],
    summary: {
      pt: 'Aplicação reativa de produtividade para organização de planos e metas com quadros Kanban drag-and-drop e métricas em tempo real.',
      en: 'Reactive productivity workspace for strategic planning featuring interactive drag-and-drop Kanban boards and real-time completion metrics.',
    },
    description: {
      pt: 'Construído com foco em fluidez de interação no front-end, tipagem estrita em TypeScript, persistência relacional e experiência mobile-first.',
      en: 'Engineered with fluid frontend micro-interactions, strict TypeScript safety, relational persistence, and a mobile-first layout.',
    },
    deliverables: {
      pt: [
        'Quadro Kanban interativo com movimentação fluida e feedback visual imediato.',
        'Painel de métricas automáticas de conclusão de tarefas e acompanhamento de metas.',
        'Interface minimalista e responsiva com React, TypeScript e Tailwind CSS.',
      ],
      en: [
        'Interactive Kanban board with smooth drag-and-drop and instant visual feedback.',
        'Automated productivity metrics and goal-tracking dashboard.',
        'Minimalist, responsive UI built with React, TypeScript, and Tailwind CSS.',
      ],
    },
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Clean Code'],
    repoUrl: 'https://github.com/Lincolndiogo200',
  },
  {
    id: 'enterprise-edu-erp',
    title: {
      pt: 'Sistema Corporativo de Gestão Educacional & KPIs',
      en: 'Enterprise Educational Management & KPI Dashboards',
    },
    contextTag: {
      pt: 'SMN Tecnologia · Fullstack',
      en: 'SMN Information Tech · Fullstack',
    },
    categories: ['fullstack'],
    summary: {
      pt: 'Plataforma corporativa completa com portais de professores/alunos, controle de acesso, APIs REST de baixa latência e dashboards executivos.',
      en: 'Enterprise platform featuring faculty/student portals, access control, low-latency REST APIs, and executive KPI dashboards.',
    },
    description: {
      pt: 'Engenharia fullstack conectando interfaces intuitivas em TypeScript a serviços robustos em C# / ASP.NET e SQL Server com foco em performance e consistência.',
      en: 'Fullstack engineering connecting intuitive TypeScript interfaces to robust C# / ASP.NET and SQL Server services focused on throughput and data integrity.',
    },
    deliverables: {
      pt: [
        'Módulos completos de agendamento, controle de acesso, relatórios e portais acadêmicos.',
        'Otimização de APIs REST para integração contínua entre serviços com menor latência.',
        'Dashboards operacionais interativos para visualização clara de indicadores (KPIs).',
      ],
      en: [
        'Fullstack modules for scheduling, access control, reporting, and academic portals.',
        'High-throughput RESTful API optimization reducing inter-module processing latency.',
        'Interactive operational dashboards empowering stakeholders with clear KPI visualizations.',
      ],
    },
    technologies: ['TypeScript', 'C#', '.NET / ASP.NET', 'SQL Server', 'RESTful APIs', 'Git', 'Agile / Scrum'],
    isEnterpriseCase: true,
  },
  {
    id: 'meu-funcionario-portal',
    title: {
      pt: 'Meu Funcionário — Portal RH & Autosserviço',
      en: 'Meu Funcionário — HR Self-Service Portal',
    },
    contextTag: {
      pt: 'Aplicação Front-End · React + TS',
      en: 'Frontend Application · React + TS',
    },
    categories: ['frontend'],
    summary: {
      pt: 'Portal web em React + TypeScript para autosserviço de colaboradores, fluxo de férias/atestados e visualização integrada de documentos.',
      en: 'React + TypeScript self-service employee portal streamlining leave workflows, payslip viewing, and HR communication.',
    },
    description: {
      pt: 'Interface limpa e acessível projetada para simplificar rotinas de RH com estados de carregamento claros, validação tipada e consumo de APIs REST.',
      en: 'Clean, accessible interface designed to simplify HR operations with clear loading states, typed validation, and REST API integration.',
    },
    deliverables: {
      pt: [
        'Fluxo digital completo de solicitação e acompanhamento de férias e documentos.',
        'Visualização integrada de holerites e comprovantes diretamente no navegador.',
        'Componentização reutilizável em React + TypeScript + Tailwind CSS.',
      ],
      en: [
        'End-to-end digital request and approval tracking for employee leave and documents.',
        'Integrated in-browser PDF payslip and document viewer.',
        'Reusable component architecture in React, TypeScript, and Tailwind CSS.',
      ],
    },
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'RESTful APIs', 'HTML5/CSS3'],
    repoUrl: 'https://github.com/Lincolndiogo200',
  },
  {
    id: 'bet-strategy-simulator',
    title: {
      pt: 'Strategy & Monte Carlo Analytics Engine',
      en: 'Strategy & Monte Carlo Analytics Engine',
    },
    contextTag: {
      pt: 'Simulação & Dados · TS + Node',
      en: 'Simulation & Data · TS + Node',
    },
    categories: ['ai-data', 'fullstack'],
    summary: {
      pt: 'Motor algorítmico em TypeScript e Node.js para simulação de milhares de cenários probabilísticos, métricas de variância e exportação analítica.',
      en: 'TypeScript & Node.js algorithmic engine simulating thousands of concurrent probability scenarios with variance analytics and data export.',
    },
    description: {
      pt: 'Ambiente containerizado com Docker para validação estatística rápida, expondo endpoints REST otimizados e visualizações gráficas de desempenho.',
      en: 'Dockerized statistical validation engine exposing high-throughput REST endpoints and interactive profitability/variance visualizations.',
    },
    deliverables: {
      pt: [
        'Execução concorrente de simulações Monte Carlo com análise de desvio padrão.',
        'Exportação estruturada de resultados em CSV e JSON.',
        'Empacotamento reproduzível com Docker e arquitetura modular.',
      ],
      en: [
        'Concurrent Monte Carlo simulation runner with standard-deviation analysis.',
        'Structured CSV and JSON analytical dataset export.',
        'Reproducible Docker containerization and modular TypeScript architecture.',
      ],
    },
    technologies: ['TypeScript', 'Node.js', 'Docker', 'RESTful APIs', 'Clean Code'],
    repoUrl: 'https://github.com/Lincolndiogo200',
  },
  {
    id: 'aquaproduce-web',
    title: {
      pt: 'AquaProduce — Plataforma Institucional & Conversão',
      en: 'AquaProduce — High-Conversion Brand Experience',
    },
    contextTag: {
      pt: 'Freelance · Recife, PE',
      en: 'Freelance · Recife, PE',
    },
    categories: ['frontend'],
    summary: {
      pt: 'Landing page mobile-first de carregamento ultrarrápido com SEO técnico, acessibilidade e animações sutis voltadas à geração de clientes.',
      en: 'Ultra-fast mobile-first landing experience combining technical SEO, accessibility standards, and subtle animations to drive lead conversion.',
    },
    description: {
      pt: 'Projeto entregue de ponta a ponta priorizando Core Web Vitals, semântica HTML5 rigorosa e experiência fluida em qualquer dispositivo.',
      en: 'End-to-end frontend delivery prioritizing Core Web Vitals, semantic HTML5, and cross-browser responsiveness.',
    },
    deliverables: {
      pt: [
        'Arquitetura mobile-first responsiva com tempo de carregamento otimizado.',
        'Implementação de boas práticas de SEO técnico e padrões de acessibilidade.',
        'Micro-interações dinâmicas para destacar produtos e aumentar a conversão.',
      ],
      en: [
        'Responsive mobile-first layout optimized for fast load times.',
        'Technical SEO best practices and WCAG accessibility compliance.',
        'Dynamic micro-interactions boosting brand credibility and lead conversion.',
      ],
    },
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'HTML5/CSS3'],
  },
];

export const experienceItems: ExperienceItem[] = [
  {
    id: 'single-software',
    role: {
      pt: 'Engenheiro de Software (Frontend)',
      en: 'Software Engineer (Frontend)',
    },
    company: 'Single Software',
    period: {
      pt: 'Nov. 2025 – Presente',
      en: 'Nov. 2025 – Present',
    },
    location: 'Campina Grande, PB',
    highlights: {
      pt: [
        'Desenvolvimento e evolução da arquitetura frontend de plataforma white-label de alta performance utilizando Vue.js 3, Nuxt.js, TypeScript, Pinia e Tailwind CSS.',
        'Liderança do desenvolvimento frontend do Backoffice administrativo (gestão, operação e relatórios) e aplicações voltadas aos usuários finais para múltiplas marcas.',
        'Idealização e implementação de Chatbot com Inteligência Artificial integrado ao Backoffice para consultas contextuais e ações via linguagem natural.',
        'Condução da internacionalização (i18n) para Inglês e Espanhol e padronização de bibliotecas de componentes com PrimeVue e Vuetify.',
      ],
      en: [
        'Develop and scale frontend architecture for high-performance white-label platforms using Vue.js 3, Nuxt.js, TypeScript, Pinia, and Tailwind CSS.',
        'Lead frontend development for the administrative Backoffice platform and user-facing interfaces across multiple client brands.',
        'Spearheaded an AI-powered Chatbot integrated into the Backoffice for natural-language queries and administrative actions.',
        'Implemented end-to-end internationalization (i18n) for English and Spanish and standardized component libraries with PrimeVue and Vuetify.',
      ],
    },
    technologies: ['TypeScript', 'Tailwind CSS', 'Vue.js 3', 'Nuxt.js', 'Pinia', 'AI / LLMs', 'i18n'],
  },
  {
    id: 'smn-tecnologia',
    role: {
      pt: 'Desenvolvedor Fullstack',
      en: 'Fullstack Developer',
    },
    company: 'SMN Tecnologia da Informação',
    period: {
      pt: 'Jan. 2025 – Nov. 2025',
      en: 'Jan. 2025 – Nov. 2025',
    },
    location: 'Campina Grande, PB',
    highlights: {
      pt: [
        'Desenvolvimento full stack para sistema corporativo de gestão educacional (portais de professores/alunos, controle de acesso, agendamento e relatórios) com TypeScript, C#, .NET / ASP.NET e SQL Server.',
        'Projeto e otimização de APIs REST para integração contínua entre módulos, reduzindo latência e garantindo consistência de dados.',
        'Criação de dashboards operacionais interativos com foco em UX e visualização clara de KPIs.',
        'Atuação ativa em sprints ágeis, code reviews, refatoração contínua e Clean Code com Git.',
      ],
      en: [
        'Engineered fullstack features for an enterprise educational management system using TypeScript, C#, .NET / ASP.NET, and SQL Server.',
        'Designed and optimized high-throughput RESTful APIs for inter-module integration, reducing internal processing latency.',
        'Created interactive operational dashboards and intuitive UX workflows for KPI visualization.',
        'Collaborated in agile sprints with peer code reviews, continuous refactoring, and Clean Code practices.',
      ],
    },
    technologies: ['TypeScript', 'C#', '.NET / ASP.NET', 'SQL Server', 'RESTful APIs', 'Git'],
  },
  {
    id: 'aquaproduce',
    role: {
      pt: 'Desenvolvedor Frontend (Freelancer)',
      en: 'Frontend Developer (Freelance)',
    },
    company: 'AquaProduce',
    period: {
      pt: 'Nov. 2024 – Jan. 2025',
      en: 'Nov. 2024 – Jan. 2025',
    },
    location: 'Recife, PE',
    highlights: {
      pt: [
        'Desenvolvimento de landing page moderna e responsiva para o setor de aquicultura, priorizando velocidade de carregamento e navegação mobile-first.',
        'Implementação de SEO técnico, padrões de acessibilidade e animações dinâmicas voltadas ao engajamento e conversão de clientes.',
      ],
      en: [
        'Built a modern, responsive mobile-first landing page for an aquaculture firm prioritizing fast load times and fluid navigation.',
        'Implemented technical SEO best practices, accessibility standards, and interactive animations driving user conversion.',
      ],
    },
    technologies: ['HTML5/CSS3', 'TypeScript', 'Tailwind CSS'],
  },
];

export const educationItems: EducationItem[] = [
  {
    id: 'unifacisa',
    degree: {
      pt: 'Bacharelado em Sistemas de Informação',
      en: 'Bachelor of Science in Information Systems',
    },
    institution: 'Unifacisa Centro Universitário',
    period: '2023 – 2027',
    location: 'Campina Grande, PB',
    highlight: {
      pt: 'CRA: 8.9 / 10',
      en: 'GPA: 8.9 / 10',
    },
  },
  {
    id: 'ufcg',
    degree: {
      pt: 'Bacharelado em Engenharia Elétrica',
      en: "Bachelor's Coursework in Electrical Engineering",
    },
    institution: 'Universidade Federal de Campina Grande (UFCG)',
    period: '2019 – 2021',
    location: 'Campina Grande, PB',
  },
];

export const uiLabels: Record<Language, UILabels> = {
  pt: {
    nav: {
      about: 'Sobre',
      skills: 'Skills',
      projects: 'Projetos',
      experience: 'Experiência',
      contact: 'Contato',
      searchHint: 'Comandos',
      themeAria: 'Alternar tema claro ou escuro',
      langAria: 'Mudar idioma para Inglês',
    },
    hero: {
      downloadCv: 'Baixar CV (PDF)',
      copyEmail: 'Copiar E-mail',
      emailCopied: 'Copiado!',
    },
    skills: {
      sectionTitle: 'Skills & Idiomas',
      sectionSubtitle: 'Clique em uma tecnologia para filtrar os projetos relacionados abaixo.',
      techStackLabel: 'Domínio Técnico',
      languagesLabel: 'Proficiência em Idiomas',
      languagesFootnote:
        'Vivência diária com documentação técnica em inglês e liderança de internacionalização (i18n) em produtos multi-idioma.',
      activeFilterHint: 'Filtro ativo',
    },
    projects: {
      sectionTitle: 'Projetos & Cases de Engenharia',
      sectionSubtitle: 'Sistemas em produção e aplicações autorais com foco em performance e UI reativa.',
      categories: {
        all: 'Todos',
        frontend: 'Frontend',
        fullstack: 'Fullstack',
        'ai-data': 'IA & Dados',
      },
      activeTechLabel: 'Tecnologia:',
      clearFilter: 'Limpar filtro',
      emptyState: 'Nenhum projeto encontrado para essa combinação de filtros.',
      resetAll: 'Mostrar todos os projetos',
      viewDetails: 'Ver detalhes',
      modalDeliverables: 'Principais Entregas & Arquitetura',
      modalTechStack: 'Tecnologias Utilizadas',
      modalRepoButton: 'Ver no GitHub',
      modalEnterpriseNote: 'Case corporativo em produção (código proprietário)',
      closeModal: 'Fechar detalhes do projeto',
    },
    experience: {
      sectionTitle: 'Experiência & Formação',
      sectionSubtitle: 'Trajetória profissional e base acadêmica em engenharia e sistemas.',
      workHeading: 'Carreira Profissional',
      educationHeading: 'Formação Acadêmica',
    },
    contact: {
      badge: 'Disponível para conexões & oportunidades',
      heading: 'Vamos construir algo juntos?',
      subheading:
        'Entre em contato para oportunidades em engenharia front-end/fullstack, projetos ou networking.',
      whatsappButton: 'Chamar no WhatsApp',
      footerNote: 'Construído com React, TypeScript & Tailwind CSS.',
    },
    commandPalette: {
      placeholder: 'Digite um comando ou busque seção, rede social, CV...',
      empty: 'Nenhum comando encontrado.',
      groups: {
        navigation: 'Navegação',
        social: 'Links & Currículo',
        preferences: 'Preferências',
      },
      actions: {
        openLinkedin: 'Abrir LinkedIn',
        openGithub: 'Abrir GitHub',
        downloadCv: 'Baixar Currículo (PDF)',
        copyEmail: 'Copiar endereço de e-mail',
        openWhatsapp: 'Conversar no WhatsApp',
        toggleTheme: 'Alternar tema (Dark / Light)',
        toggleLang: 'Mudar idioma para Inglês (EN)',
      },
      closeHint: 'ESC para fechar',
    },
  },
  en: {
    nav: {
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      experience: 'Experience',
      contact: 'Contact',
      searchHint: 'Commands',
      themeAria: 'Toggle light or dark theme',
      langAria: 'Switch language to Portuguese',
    },
    hero: {
      downloadCv: 'Download CV (PDF)',
      copyEmail: 'Copy Email',
      emailCopied: 'Copied!',
    },
    skills: {
      sectionTitle: 'Skills & Languages',
      sectionSubtitle: 'Click any technology badge to filter the related projects below.',
      techStackLabel: 'Technical Mastery',
      languagesLabel: 'Language Proficiency',
      languagesFootnote:
        'Daily experience reading/writing technical documentation in English and leading end-to-end i18n in multi-language products.',
      activeFilterHint: 'Active filter',
    },
    projects: {
      sectionTitle: 'Projects & Engineering Cases',
      sectionSubtitle: 'Production systems and crafted web apps focused on performance and reactive UI.',
      categories: {
        all: 'All',
        frontend: 'Frontend',
        fullstack: 'Fullstack',
        'ai-data': 'AI & Data',
      },
      activeTechLabel: 'Technology:',
      clearFilter: 'Clear filter',
      emptyState: 'No projects match this filter combination.',
      resetAll: 'Show all projects',
      viewDetails: 'View details',
      modalDeliverables: 'Key Deliverables & Architecture',
      modalTechStack: 'Tech Stack',
      modalRepoButton: 'View on GitHub',
      modalEnterpriseNote: 'Production enterprise case study (proprietary codebase)',
      closeModal: 'Close project details',
    },
    experience: {
      sectionTitle: 'Experience & Education',
      sectionSubtitle: 'Professional software engineering track record and academic background.',
      workHeading: 'Professional Experience',
      educationHeading: 'Education',
    },
    contact: {
      badge: 'Open to opportunities & collaborations',
      heading: "Let's build something great together?",
      subheading:
        'Reach out for frontend/fullstack engineering roles, product collaborations, or networking.',
      whatsappButton: 'Message on WhatsApp',
      footerNote: 'Built with React, TypeScript & Tailwind CSS.',
    },
    commandPalette: {
      placeholder: 'Type a command or search sections, socials, resume...',
      empty: 'No matching commands.',
      groups: {
        navigation: 'Navigation',
        social: 'Links & Resume',
        preferences: 'Preferences',
      },
      actions: {
        openLinkedin: 'Open LinkedIn',
        openGithub: 'Open GitHub',
        downloadCv: 'Download Resume (PDF)',
        copyEmail: 'Copy email address',
        openWhatsapp: 'Message on WhatsApp',
        toggleTheme: 'Toggle theme (Dark / Light)',
        toggleLang: 'Switch language to Português (PT)',
      },
      closeHint: 'ESC to close',
    },
  },
};
