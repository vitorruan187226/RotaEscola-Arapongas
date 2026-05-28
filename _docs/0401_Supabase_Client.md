# Clientes Supabase — Configuração (0401)

## Propósito
Documenta os 3 clientes Supabase do projeto RotaEscola, quando usar cada um, e as variáveis de ambiente necessárias.

---

## Variáveis de Ambiente

| Nome | Arquivo | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local` | Chave pública (anon) do Supabase |

> [!CAUTION]
> **NUNCA** use a `SUPABASE_SERVICE_ROLE_KEY` no frontend. Ela só deve ser usada em Edge Functions e server-side seguros.

---

## Clientes

### 1. Client (Browser) — `utils/supabase/client.ts`
```typescript
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseKey);
```

**Quando usar:** Em qualquer `'use client'` component que precise fazer queries, auth, ou storage no lado do cliente.

**Exemplos de uso:**
- `app/login/page.tsx` — `supabase.auth.signInWithPassword()`
- `app/responsavel/dashboard/page.tsx` — `supabase.from('alunos').select()`
- `components/LogoutButton.tsx` — `supabase.auth.signOut()`

---

### 2. Server (SSR) — `utils/supabase/server.ts`
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = (cookieStore) =>
  createServerClient(supabaseUrl, supabaseKey, { cookies: { ... } });
```

**Quando usar:** Em Server Components e Route Handlers que precisam de dados autenticados no SSR.

**Exemplos de uso:**
- `app/dashboard/secretaria/page.tsx` — `supabase.from('alunos').select('*', { count: 'exact' })`
- `app/auth/callback/route.ts` — `supabase.auth.exchangeCodeForSession(code)`

**Assinatura:** Recebe `cookieStore` como parâmetro (obtido via `await cookies()`).

---

### 3. Middleware — `utils/supabase/middleware.ts`
```typescript
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const createClient = (request: NextRequest) => { ... };
```

**Quando usar:** Helper auxiliar para o middleware Next.js. O middleware principal (`middleware.ts` na raiz) já cria seu próprio client inline.

---

## Arquivos Relacionados
| Arquivo | Responsabilidade |
|---|---|
| `.env.local` | Variáveis de ambiente (NÃO commitado no Git) |
| `middleware.ts` | Proteção de rotas e refresh de sessão |
| `app/auth/callback/route.ts` | Troca de code OAuth por sessão |

## Histórico de Alterações
| Data | Alteração |
|---|---|
| Setup inicial | Criação dos 3 clientes Supabase |
| 28/05/2026 | Documentação criada (0401) |
