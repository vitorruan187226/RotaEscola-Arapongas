# Frente 4 — Tipagem & Contratos de Dados · 🟡

> Depende de: F1 (schema estável) · Onda: 2 · Refs: `00_MASTER.md`, `CONTRATOS.md §3`, `playbooks.md#frontend`.

## Objetivo
Gerar o arquivo `database.types.ts` autogerado pelo Supabase CLI, refatorar `types/index.ts` para alinhar com o banco real, e eliminar todos os `as any` das páginas que consomem dados.

## Escopo
- **Arquivos:** `types/database.types.ts` (NEW), `types/index.ts` (MODIFY), páginas que usam `as any` (`app/responsavel/dashboard/page.tsx`, `app/dashboard/admin/escolas/detalhes/page.tsx`, `app/dashboard/admin/frota/page.tsx`).
- **Fora de escopo:** Schema do banco (F1 já entregou). Middleware (F2). GPS (F5).

## Pilar-motivo (1)
**Estabilidade** — sem tipagem, bugs de coluna são silenciosos e surgem em runtime.

## Diagnóstico (estado atual)
- `database.types.ts` não existe → todas as queries Supabase retornam `any`.
- `types/index.ts`: interfaces com colunas fantasma (`documento`), camelCase (`rotaId`) vs snake_case real (`rota_id`), turnos divergentes (`Matutino` vs `manha`).
- ~15 ocorrências de `as any` ou `as any[]` em páginas críticas.

## Passos
- [ ] 🟡 Rodar `npx supabase gen types typescript --project-id <ID> > types/database.types.ts` — pronto quando: arquivo gerado e importável.
- [ ] 🟡 Tipar o cliente Supabase com `createClient<Database>()` em `utils/supabase/client.ts` e `utils/supabase/server.ts` — pronto quando: queries retornam tipos corretos em vez de `any`.
- [ ] 🟡 Refatorar `types/index.ts`: remover interfaces que duplicam `database.types.ts`, alinhar nomes de campos com snake_case do banco — pronto quando: zero interfaces com campos fantasma.
- [ ] 🟡 Substituir `as any` por tipos explícitos nas páginas listadas — pronto quando: `grep -r "as any" app/` retorna zero ocorrências.
- [ ] 🟡 Trocar `.getPublicUrl()` por `.createSignedUrl(expiresIn: 300)` nas páginas que exibem documentos do bucket privado — pronto quando: documentos exibidos via URL temporária de 5 minutos.

## Contratos (assinaturas que outras frentes consomem)
→ `CONTRATOS.md §3` (padrão de importação de tipos).

## Critérios de aceite
- [ ] `npm run build` verde (zero erros de tipo)
- [ ] `grep -rn "as any" app/` retorna zero
- [ ] `types/database.types.ts` existe e reflete o schema real

## Riscos & mitigações
| Risco | Mitigação |
|---|---|
| Tipos gerados quebram compilação por incompatibilidade | Ajustar interfaces customizadas em `types/index.ts` para serem aliases dos tipos gerados |

## Verificação
`npm run build` verde.
