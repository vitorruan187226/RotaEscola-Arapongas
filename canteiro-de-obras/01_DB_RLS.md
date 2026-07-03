# Frente 1 — DB / RLS / Storage · 🔴

> Depende de: nenhuma · Onda: 1 · Refs: `00_MASTER.md`, `CONTRATOS.md §1`, `playbooks.md#db-schema`, `playbooks.md#seguranca`.

## Objetivo
Fechar as 5 vulnerabilidades de banco identificadas nas auditorias L-01, L-02 e L-09: RLS permissiva em alunos e perfis, RPC pública de CPF→email, índices ausentes, e buckets de documentos de menores expostos publicamente.

## Escopo
- **Arquivos:** `supabase/migrations/` (nova migration), Storage policies.
- **Fora de escopo:** Alterações no frontend (quem consome os signed URLs é a F4/F7). Tipagem (F4). Alterações no middleware (F2).

## Pilar-motivo (1)
**Segurança** — dados de menores expostos publicamente + motorista lê todos os alunos do banco.

## Diagnóstico (estado atual)
- RLS de `alunos`: motorista com `USING(true)` vê todos os alunos → precisa filtrar por `rota_id` via subquery em `veiculos`.
- RLS de `perfis`: `USING(true)` para SELECT autenticado → expõe CPFs/telefones de todos.
- RPC `get_email_by_cpf`: `SECURITY DEFINER` sem restrição de role → harvesting de CPFs.
- Buckets `documentos-alunos` e `documentos-transporte`: `public = true` → documentos de menores acessíveis pela internet.
- Índices ausentes: `alunos(responsavel_id)`, `alunos(rota_id)`, `localizacao_veiculo(rota_id, atualizado_em DESC)`.

## Passos
- [ ] 🔴 Criar migration `YYYYMMDDHHMMSS_fix_rls_seguranca.sql` — pronto quando: RLS de alunos restringe motorista à sua rota, RLS de perfis restringe a `id = auth.uid()` ou Admin, RPC `get_email_by_cpf` revogada ou restrita a `service_role`.
- [ ] 🔴 Na mesma migration: `UPDATE storage.buckets SET public = false` para ambos os buckets + dropar políticas de SELECT público + criar políticas de SELECT autenticado com filtro por owner — pronto quando: URL pública de documento retorna 403.
- [ ] 🟡 Na mesma migration: criar os 3 índices (`idx_alunos_responsavel`, `idx_alunos_rota`, `idx_localizacao_rota_tempo`) — pronto quando: `EXPLAIN` mostra Index Scan ao filtrar alunos por rota.

## Contratos (assinaturas que outras frentes consomem)
→ `CONTRATOS.md §1` (políticas RLS, índices, buckets privados).

## Critérios de aceite
- [ ] `npm run build` verde
- [ ] `mcp__supabase__get_advisors` (security) sem alerta novo referente a alunos/perfis/storage
- [ ] Query `SELECT * FROM alunos` como motorista retorna APENAS alunos da sua rota
- [ ] Query `SELECT * FROM perfis` como responsável retorna APENAS seu próprio perfil
- [ ] URL pública do bucket `documentos-alunos` retorna 403

## Riscos & mitigações
| Risco | Mitigação |
|---|---|
| Subquery de rota na RLS degrada performance | Índice em `veiculos(motorista_id)` já existe implicitamente via FK; monitorar com EXPLAIN |
| Revogar `get_email_by_cpf` quebra login | O login já faz a query via API Route server-side com service_role; a RPC pública não é necessária |

## Verificação
Migration aplicada via MCP ou `supabase db push` + `mcp__supabase__get_advisors`.
