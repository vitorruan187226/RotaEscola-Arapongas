# Deploy no Vercel (05XX)

## Plataforma
**Vercel** – serviço recomendado para projetos Next.js.

## Pré‑requisitos
- **Vercel CLI** (`npm i -g vercel` ou usar `npx vercel`).
- **Token de acesso** ou login ao Vercel (`vercel login`).
- O repositório já está associado a um **team** (ex.: `fosfosilvio-beeps-projects`).
  Caso ainda não tenha um, crie um time na sua conta Vercel.

## Passos de instalação
```bash
# Instalar dependências do projeto (já feito)
npm install

# Instalar a CLI do Vercel (se ainda não estiver globalmente)
npm i -g vercel   # opcional – pode usar npx vercel

# Linkar o diretório local ao seu time no Vercel
vercel link --scope fosfosilvio-beeps-projects
```

## Variáveis de ambiente em produção
Copie as mesmas variáveis usadas no desenvolvimento (`.env.local`) para a configuração de **Environment Variables** no dashboard do Vercel:

| Nome                                 | Valor (exemplo)                                            |
|--------------------------------------|------------------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`           | `https://lzzxivzkwtwifgvexuiy.supabase.co`                |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`| `sb_publishable_Gh5TkPZtml0CvBRaiP_g8w_9nqhz8ED`           |

## Build & Deploy
```bash
# Build local (opcional, para checar erros)
npm run build

# Deploy para produção
vercel --prod --scope fosfosilvio-beeps-projects
```

## Pós‑deploy
- Verifique o URL gerado no console ou no dashboard da Vercel.
- Teste a página inicial (`/`) – deve listar os **todos** da sua Supabase.
- Caso queira conectar com um domínio próprio, adicione‑o nas **Domain Settings** do projeto Vercel.
