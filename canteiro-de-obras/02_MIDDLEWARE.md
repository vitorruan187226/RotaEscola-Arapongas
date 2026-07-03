# Frente 2 — Middleware Auth & Roles · 🔴

> Depende de: nenhuma · Onda: 1 · Refs: `00_MASTER.md`, `CONTRATOS.md §2`, `playbooks.md#seguranca`.

## Objetivo
Eliminar o bypass de autenticação via mock cookie, cobrir todos os valores de role do banco (incluindo `semed_admin`), e implementar validação cruzada de rota×role para impedir escalação horizontal de privilégios.

## Escopo
- **Arquivos:** `middleware.ts`.
- **Fora de escopo:** RLS no banco (F1). API Routes (F3). UI (F7).

## Pilar-motivo (1)
**Segurança** — qualquer pessoa na internet pode acessar `/dashboard/admin` com um cookie injetado.

## Diagnóstico (estado atual)
- `sb-mock-login` aceito em qualquer `NODE_ENV` → bypass total.
- Condicionais de role: `admin | motorista | secretaria` → `semed_admin` cai no fallback (responsável).
- Sem validação cruzada: responsável autenticado pode acessar `/dashboard/admin` manualmente (middleware só checa `!user`).
- Fallback query ao banco (`perfis.tipo_usuario`) adiciona 100-300ms no middleware.

## Passos
- [ ] 🔴 Envelopar lógica de `isMockCookie` em `if (process.env.NODE_ENV === 'development')` — `middleware.ts` — pronto quando: cookie mockado ignorado em build de produção.
- [ ] 🔴 Expandir mapa de roles para cobrir `semed_admin`, `admin`, `secretaria`, `motorista`, `responsavel` (case-insensitive via `.toLowerCase()`) — `middleware.ts` — pronto quando: login de `SEMED_ADMIN` redireciona para `/dashboard/admin`.
- [ ] 🔴 Adicionar validação cruzada: se `role !== admin|semed_admin|secretaria` e pathname começa com `/dashboard/admin` → redirecionar para rota correta do perfil — `middleware.ts` — pronto quando: responsável não consegue acessar `/dashboard/admin`.
- [ ] 🟡 Garantir que a role seja lida prioritariamente do JWT metadata (`user_metadata.role || user_metadata.tipo_usuario`), e que o fallback de SELECT no banco só ocorra se ambas forem nulas — `middleware.ts` — pronto quando: middleware não faz SELECT para 95%+ das requests.

## Contratos (assinaturas que outras frentes consomem)
→ `CONTRATOS.md §2` (tipo `UserRole`, mapa `ROUTE_ROLE_MAP`).

## Critérios de aceite
- [ ] `npm run build` verde
- [ ] Cookie `sb-mock-login=admin` + request a `/dashboard/admin` em `NODE_ENV=production` → redireciona para `/login`
- [ ] Login com metadata `role: 'SEMED_ADMIN'` → redireciona para `/dashboard/admin` (não para `/responsavel/dashboard`)
- [ ] Responsável autenticado acessando `/dashboard/admin` → redirecionado para `/responsavel/dashboard`

## Riscos & mitigações
| Risco | Mitigação |
|---|---|
| Remover mock cookie quebra fluxo de desenvolvimento local | Mantém funcional apenas em `NODE_ENV === 'development'` |
| Fallback de banco pode ser necessário para contas antigas sem metadata | Manter o fallback mas forçar injeção de role no `user_metadata` na criação/login |

## Verificação
`npm run build` + teste manual de login por perfil.
