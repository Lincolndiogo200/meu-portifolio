# Lincoln Diogo — Software Engineer Portfolio

Portfólio pessoal minimalista e reativo construído com **React + TypeScript + Tailwind CSS**, inspirado na estética Bento Spotlight (Linear / Vercel).

## Destaques

- **Bento Spotlight UI:** Cards modulares com efeito spotlight radial guiado pelo cursor e suporte **Dark / Light Mode**.
- **Reatividade & Skeleton UI:** Estados de carregamento *Skeleton Shimmer* no boot inicial e nas transições de filtros de projetos e idioma.
- **Bilíngue (`PT` / `EN`):** Alternância instantânea de idioma sincronizada com download real do currículo (`CV_Lincoln_PT.pdf` e `CV_Lincoln_EN.pdf`).
- **Skills Interativas & Idiomas:** Clique em qualquer tecnologia para filtrar projetos; exibição dedicada de proficiência em idiomas (**Português — Nativo** e **Inglês — Profissional**).
- **Command Palette (`⌘K` / `Ctrl+K`):** Navegação rápida por teclado para seções, LinkedIn, GitHub, WhatsApp, CV e preferências.

## Comandos Locais

```bash
npm install
npm run dev      # Inicia em http://localhost:5173
npm test         # Roda suíte de testes (Vitest + Testing Library)
npm run build    # Typecheck (tsc -b) + build de produção (dist/)
```

## Colocando no Ar Hoje (2 opções rápidas)

### Opção 1 — Vercel (Recomendada, < 1 minuto)
1. Crie um repositório vazio no GitHub (ex.: `portfolio`) e envie o código:
   ```bash
   git remote add origin https://github.com/Lincolndiogo200/<NOME_DO_REPO>.git
   git push -u origin main
   ```
2. Acesse [vercel.com/new](https://vercel.com/new), importe o repositório e clique em **Deploy** (`vercel.json` já está configurado).

### Opção 2 — GitHub Pages (100% automático via GitHub Actions)
1. Faça o `git push` para a branch `main` do novo repositório no GitHub.
2. No repositório do GitHub, abra **Settings → Pages → Build and deployment** e selecione **Source: GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` vai rodar os testes, gerar o build e publicar automaticamente!
