# PERFIL do Projeto — RotaEscola Arapongas

> Bloco lido pela skill `canteiro-de-obras` na fase Intake. 1×/projeto.

## Stack
Next.js 14 (App Router) · Supabase (Postgres + RLS + Realtime + Edge Functions) · Tailwind CSS · TypeScript · Vercel.

## Gates
| Gate | Comando / Checagem |
|---|---|
| Tipo/build | `npm run build` (type-gate) |
| Segurança DB | `mcp__supabase__get_advisors` (security) sem alerta novo |
| Testes | Manual (usuário valida fluxos no navegador) |

## Tiers (tag → modelo de subagente)
🔴 `opus` (crítico: schema, RLS, middleware, APIs abertas, LGPD) · 🟡 `sonnet` (intermediário: hooks, UI, refactor, tipagem) · 🟢 `haiku/flash` (trivial: copy, rename, estilos).
> Opus = roteamento manual do usuário (minimizar trocas). Sonnet/Flash = agente padrão.

## Governança (atualizar no DoD)
- `_docs/<quarteirão>` · `indice.txt` · logs de execução.
- Auditorias: marcar achado resolvido em `AUDITORIA PRD/`.

## Higiene
Arquivos ≤ ~150 linhas · modularidade extrema · sem `catch` silencioso · god-component → hooks.

## Restrições (travadas)
- **NUNCA subir preview server** — usuário testa manual.
- Verificação pós-edição = só `npm run build`.
- Segurança server-side primeiro (middleware/RLS); nunca confiar só no client.
- Dados de menores = LGPD Art. 14 (tratamento com consentimento específico do responsável).
