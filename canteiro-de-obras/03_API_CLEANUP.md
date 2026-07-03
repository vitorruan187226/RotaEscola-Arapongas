# Frente 3 — API Cleanup · 🔴

> Depende de: nenhuma · Onda: 1 · Refs: `00_MASTER.md`, `CONTRATOS.md §2`, `playbooks.md#seguranca`.

## Objetivo
Eliminar rotas de depuração que vazam dados de menores, proteger o endpoint de cadastro de motoristas com validação de sessão+role de Admin, e adicionar guard de role no endpoint de status de rota.

## Escopo
- **Arquivos:** `app/api/debug-db/route.ts` (DELETE), `app/api/admin/fix-driver/route.ts` (DELETE), `app/api/admin/motoristas/route.ts` (MODIFY), `app/api/motorista/status-rota/route.ts` (MODIFY).
- **Fora de escopo:** Middleware (F2). RLS de banco (F1). Rate limiting (adiado — env var simples ou Upstash futuro).

## Pilar-motivo (1)
**Segurança** — endpoint `/api/debug-db` vaza dados PII de crianças para a internet aberta.

## Diagnóstico (estado atual)
- `/api/debug-db`: GET aberto → retorna JSON com alunos reais (nome, rota, turno) e presenças. Usa `supabaseAdmin` com `service_role_key`.
- `/api/admin/fix-driver`: GET aberto → reatribui perfis de motorista automaticamente sem validação.
- `/api/admin/motoristas`: POST aberto → cria conta de motorista no Supabase Auth com `supabaseAdmin.auth.admin.createUser()` sem validar sessão ou role.
- `/api/motorista/status-rota`: POST valida sessão mas não role → qualquer autenticado pode alterar status de rota de motorista.

## Passos
- [ ] 🔴 Deletar arquivo `app/api/debug-db/route.ts` — pronto quando: rota retorna 404.
- [ ] 🔴 Deletar arquivo `app/api/admin/fix-driver/route.ts` — pronto quando: rota retorna 404.
- [ ] 🔴 Adicionar guard em `app/api/admin/motoristas/route.ts`: validar sessão via `supabase.auth.getUser()` + verificar que `user_metadata.role` é `Admin` ou `admin` antes de prosseguir — pronto quando: POST sem sessão retorna 401; POST com role não-admin retorna 403.
- [ ] 🟡 Adicionar guard em `app/api/motorista/status-rota/route.ts`: verificar que `user_metadata.role` é `Motorista` ou `motorista` e que o `motorista_id` do payload coincide com `user.id` — pronto quando: POST com role de Pai retorna 403.

## Contratos (assinaturas que outras frentes consomem)
Nenhum contrato downstream. Consome o mapa de roles de `CONTRATOS.md §2`.

## Critérios de aceite
- [ ] `npm run build` verde
- [ ] `curl -X GET /api/debug-db` → 404
- [ ] `curl -X GET /api/admin/fix-driver` → 404
- [ ] `curl -X POST /api/admin/motoristas` sem cookie de sessão → 401
- [ ] `curl -X POST /api/admin/motoristas` com sessão de Pai → 403

## Riscos & mitigações
| Risco | Mitigação |
|---|---|
| Painel admin usa `/api/admin/motoristas` para cadastrar motoristas | O guard permite apenas sessões com role Admin — o painel admin já está logado como Admin |
| fix-driver pode ter sido usado para corrigir dados manualmente | Funcionalidade movida para scripts de seed ou SQL direto no Supabase Studio |

## Verificação
`npm run build` + verificar que rotas deletadas retornam 404.
