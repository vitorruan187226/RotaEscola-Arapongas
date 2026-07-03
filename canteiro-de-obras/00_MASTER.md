# 00 · PLANO MASTER — Remediação PRD RotaEscola Arapongas

> Data: 2026-07-03 · Escopo: Fechar os gaps críticos de segurança, LGPD, tipagem e funcionalidade identificados na auditoria L-01→L-10 contra o Blueprint. · Deriva de: `AUDITORIA PRD/` (10 relatórios).

## Objetivo
Transformar o RotaEscola de um protótipo funcional com vulnerabilidades graves (APIs abertas, bypass de auth, dados de menores públicos, GPS mockado) em uma plataforma **deploy-ready para staging** da Secretaria de Educação de Arapongas. Prioridade: fechar vetores de ataque antes de qualquer evolução funcional.

## Decisões travadas (ADR-lite)
| # | Decisão | Valor |
|---|---|---|
| D1 | Paleta de cores diverge do Blueprint | **Manter a paleta atual** (navy `#0F172A` + bus-yellow `#FBBF24`) — superior para identidade GovTech |
| D2 | ENUMs vs TEXT+CHECK no Postgres | **Manter TEXT+CHECK** — facilita ALTER sem lock de tabela |
| D3 | Lat/Lng separados vs POINT | **Manter lat/lng separados** — consumo direto no front. PostGIS adiado para geofencing futuro |
| D4 | RabbitMQ/Kafka para telemetria | **Cortado (Gate de Subtração)** — Supabase Realtime Broadcast resolve a escala de Arapongas (~50 vans) |
| D5 | Read/Write Splitting | **Cortado** — volume atual não justifica réplica |
| D6 | S3/Parquet para arquivamento | **Cortado** — pg_cron com DELETE > 180 dias basta por agora |
| D7 | Feature Flags (LaunchDarkly/Flagsmith) | **Cortado** — `NEXT_PUBLIC_FEATURE_*` env vars simples |
| D8 | Field-Level Encryption (pgcrypto/pgsodium) | **Adiado** — prioridade é tornar buckets privados e fechar endpoints |

## Diagnóstico (estado atual confirmado no código em 2026-07-03)
| ID | Área | Achado | Veredito |
|---|---|---|---|
| L02-1 | RLS alunos | Motorista lê TODOS os alunos do banco, não só os da sua rota | 🔴 corrigir RLS |
| L02-2 | RLS perfis | `USING(true)` expõe CPF/telefone de todos para qualquer autenticado | 🔴 restringir |
| L02-3 | RPC pública | `get_email_by_cpf` SECURITY DEFINER sem restrição de role | 🔴 mover para API server-side |
| L07-1 | Middleware | Cookie `sb-mock-login` bypass em qualquer ambiente | 🔴 envelopar em NODE_ENV |
| L07-2 | Middleware | Roles não cobrem `semed_admin`; sem validação cruzada rota×role | 🔴 corrigir condicionais |
| L08-1 | API Routes | `/api/debug-db` expõe dados de crianças | 🔴 deletar |
| L08-2 | API Routes | `/api/admin/fix-driver` aberta | 🔴 deletar |
| L08-3 | API Routes | `/api/admin/motoristas` sem auth | 🔴 adicionar guard |
| L08-4 | API Routes | `/api/motorista/status-rota` sem validação de role | 🟡 adicionar guard |
| L09-1 | Storage | Buckets `documentos-alunos` e `documentos-transporte` públicos | 🔴 tornar privados |
| L09-2 | Storage | Front usa `.getPublicUrl()` para documentos de menores | 🔴 trocar para `.createSignedUrl()` |
| L01-1 | Schema | Faltam índices em `alunos(responsavel_id)` e `alunos(rota_id)` | 🟡 criar índices |
| L01-2 | Schema | Falta índice em `localizacao_veiculo(rota_id, atualizado_em)` | 🟡 criar índice |
| L03-1 | Tipagem | `database.types.ts` não existe | 🟡 gerar via CLI |
| L03-2 | Tipagem | `types/index.ts` desalinhado com banco (camelCase, colunas fantasma) | 🟡 refatorar |
| L03-3 | Tipagem | Uso excessivo de `as any` em páginas | 🟡 eliminar |
| L04-1 | GPS | Motorista não transmite coordenadas reais | 🟡 implementar watchPosition + Realtime |
| L04-2 | GPS | Portal pais usa polling 30s + timer fake de aproximação | 🟡 migrar para Realtime listener |
| L05-1 | PWA | Sem manifest.json, sem Service Worker, sem IndexedDB | 🟡 implementar |
| L06-1 | UI | `page.tsx` do motorista com 119KB (2500 linhas) | 🟡 extrair componentes |
| L06-2 | UI | `page.tsx` da landing com 47KB | 🟢 extrair seções |

## DAG de dependências
```
F1 (DB/RLS) ──┐
               ├──▶ F4 (Tipagem) ──▶ F5 (GPS/Realtime) ──▶ F6 (PWA)
F2 (Middleware)┤
               │
F3 (API clean) ┘
```
> F1, F2, F3 = arquivos disjuntos → paralelo (Onda 1).
> F4 depende de F1 (schema estável → gerar tipos).
> F5 depende de F4 (tipos corretos para payloads Realtime).
> F6 depende de F5 (PWA empacota o motorista já com GPS real).
> F7 (UI refactor) = independente, Onda 1 paralela com F1-F3.

## Frentes & Roteamento
| Frente | Arquivo | Resumo | Tier | Onda | Gate |
|---|---|---|---|---|---|
| F1 | `01_DB_RLS.md` | Corrigir RLS de alunos/perfis, revogar RPC pública, criar índices, tornar buckets privados | 🔴 | 1 | — |
| F2 | `02_MIDDLEWARE.md` | Eliminar bypass mock cookie, cobrir todas as roles, validação cruzada rota×role | 🔴 | 1 | — |
| F3 | `03_API_CLEANUP.md` | Deletar debug-db e fix-driver, adicionar guards de sessão+role nas API routes | 🔴 | 1 | — |
| F4 | `04_TIPAGEM.md` | Gerar `database.types.ts`, refatorar `types/index.ts`, eliminar `as any` | 🟡 | 2 | após F1 |
| F5 | `05_GPS_REALTIME.md` | Implementar watchPosition no motorista, canal Realtime Broadcast, listener no portal pais | 🟡 | 3 | após F4 |
| F6 | `06_PWA_OFFLINE.md` | Manifest, Service Worker, IndexedDB para checklist, detecção real de rede | 🟡 | 4 | após F5 |
| F7 | `07_UI_REFACTOR.md` | Extrair componentes do motorista (119KB→módulos), extrair seções da landing | 🟡 | 1 | — |

> **Frentes 🔴 (F1, F2, F3):** Cada uma isola 1 núcleo crítico de segurança. Opus revisa as 3 na mesma sessão (Onda 1).
> **F7** roda em paralelo na Onda 1 porque toca arquivos disjuntos dos de segurança (app/page.tsx e app/dashboard/motorista/page.tsx, não middleware.ts nem API routes).
> Numeração de frente = ID livre; a ordem de execução vem da coluna **Onda**.

## Contratos
→ `CONTRATOS.md` (costuras entre frentes: tipos canônicos, assinaturas de hooks GPS).

## Ordem (ondas)
```
Onda 1 (paralela, arquivos disjuntos):  F1 ‖ F2 ‖ F3 ‖ F7
  GATE: npm run build verde + advisors segurança limpos
Onda 2 (sequencial, depende de DB):     F4
  GATE: npm run build verde
Onda 3 (sequencial, depende de tipos):  F5
  GATE: npm run build verde
Onda 4 (sequencial, depende de GPS):    F6
  GATE: npm run build verde + teste manual PWA
```

## Estratégia de roteamento manual (minimizar trocas de modelo)
```
┌──────────────────────────────────────────────────────────────────────┐
│  SESSÃO OPUS (1× — o usuário cola MASTER + CONTRATOS + F1/F2/F3)   │
│                                                                      │
│  Opus recebe: PERFIL + 00_MASTER (resumo) + CONTRATOS               │
│  Executa sequencialmente: F1 → F2 → F3 (mesma sessão)              │
│  Entrega: migrations SQL, middleware.ts, API routes corrigidas      │
│  Gate: npm run build                                                 │
├──────────────────────────────────────────────────────────────────────┤
│  SESSÃO SONNET/FLASH (N×):                                          │
│  Onda 1: F7 (UI refactor — paralelo, arquivos disjuntos de Opus)   │
│  Onda 2: F4 (tipagem — após Opus entregar DB)                      │
│  Onda 3: F5 (GPS Realtime)                                          │
│  Onda 4: F6 (PWA Offline)                                           │
└──────────────────────────────────────────────────────────────────────┘
```
> **Opus faz 1 sessão (F1+F2+F3).** Depois disso, todo o resto roda em Sonnet/Flash.

## Execução
- **Por frente:** o agente recebe PERFIL + master-resumo + sua frente + contratos que consome — nunca o canteiro inteiro.
- **Ondas paralelas (Onda 1):** F1/F2/F3 vão para Opus em sequência na mesma sessão. F7 vai para Sonnet em paralelo.
- **Gate entre ondas:** `npm run build` verde antes de abrir a próxima.

## Verificação global (usuário testa)
```
npm run build
```
- [ ] Login de motorista redireciona para `/dashboard/motorista` (não cai em responsável)
- [ ] Login de admin redireciona para `/dashboard/admin`
- [ ] Cookie `sb-mock-login` não funciona em produção (`NODE_ENV=production`)
- [ ] `/api/debug-db` retorna 404
- [ ] Bucket `documentos-alunos` retorna 403 sem autenticação
- [ ] GPS do motorista emite coordenadas reais no Realtime
- [ ] Portal pais vê van mover em tempo real (<5s de delay)
- [ ] Motorista instala PWA no celular e checklist sobrevive a refresh

## DoD / Governança (pós-execução)
Atualizar `_docs/<quarteirão>`, `indice.txt`, logs de execução; marcar achados resolvidos em `AUDITORIA PRD/`; fechar canteiro ✅.

## Status board
| Frente | Status |
|---|---|
| F1 — DB/RLS | ✅ |
| F2 — Middleware | ✅ |
| F3 — API Cleanup | ✅ |
| F4 — Tipagem | ⬜ |
| F5 — GPS/Realtime | ⬜ |
| F6 — PWA/Offline | ⬜ |
| F7 — UI Refactor | ⬜ |
> ⬜ Pendente · 🟦 Em andamento · ✅ Concluído · ⛔ Bloqueado
