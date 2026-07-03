# Frente 7 — UI Refactor (Modularização) · 🟡

> Depende de: nenhuma · Onda: 1 (paralela — arquivos disjuntos de F1/F2/F3) · Refs: `00_MASTER.md`, `playbooks.md#frontend`.

## Objetivo
Quebrar os dois maiores arquivos monolíticos do projeto (motorista 119KB / landing 47KB) em componentes menores e reutilizáveis, seguindo a regra de higiene de ~150 linhas/arquivo.

## Escopo
- **Arquivos:**
  - `app/dashboard/motorista/page.tsx` (MODIFY — extrair componentes)
  - `components/motorista/SOSModal.tsx` (NEW)
  - `components/motorista/MecanicoModal.tsx` (NEW)
  - `components/motorista/OcorrenciaModal.tsx` (NEW)
  - `components/motorista/PassageirosChecklist.tsx` (NEW)
  - `components/motorista/QrCodeReader.tsx` (NEW)
  - `components/motorista/RotaStatusBar.tsx` (NEW)
  - `app/page.tsx` (MODIFY — extrair seções)
  - `components/landing/HeroSection.tsx` (NEW)
  - `components/landing/BeneficiosSection.tsx` (NEW)
  - `components/landing/FrotaSection.tsx` (NEW)
  - `components/landing/EstatisticasSection.tsx` (NEW)
  - `components/landing/TestemunhosSection.tsx` (NEW)
  - `components/landing/FAQSection.tsx` (NEW)
  - `components/landing/FooterSection.tsx` (NEW)
- **Fora de escopo:** Lógica de negócio (hooks, GPS, auth). Alterações no banco. Middleware.

## Pilar-motivo (1)
**Estabilidade** — arquivo de 2500 linhas é impossível de manter; qualquer mudança pequena exige parsear 119KB.

## Diagnóstico (estado atual)
- `app/dashboard/motorista/page.tsx`: 119KB, ~2500 linhas. Contém modais de SOS, mecânico, ocorrência, checklist de passageiros, scanner QR, status de rota — tudo inline.
- `app/page.tsx`: 47KB. Contém Header, Hero, Benefícios, Frota, Estatísticas, Testemunhos, FAQ, Footer — tudo inline.

## Passos
- [ ] 🟡 Extrair `SOSModal` de `motorista/page.tsx` → `components/motorista/SOSModal.tsx` — pronto quando: modal funciona identicamente e page.tsx diminui.
- [ ] 🟡 Extrair `MecanicoModal` → `components/motorista/MecanicoModal.tsx` — idem.
- [ ] 🟡 Extrair `OcorrenciaModal` → `components/motorista/OcorrenciaModal.tsx` — idem.
- [ ] 🟡 Extrair `PassageirosChecklist` → `components/motorista/PassageirosChecklist.tsx` — idem.
- [ ] 🟡 Extrair `QrCodeReader` → `components/motorista/QrCodeReader.tsx` — idem.
- [ ] 🟡 Extrair `RotaStatusBar` → `components/motorista/RotaStatusBar.tsx` — idem.
- [ ] 🟢 Extrair seções da landing page → `components/landing/*.tsx` (7 componentes) — pronto quando: cada seção é um arquivo ≤ 150 linhas.
- [ ] 🟢 Verificar que `page.tsx` do motorista ficou ≤ 300 linhas (orquestrador de componentes) — pronto quando: tamanho do arquivo reduziu ≥ 70%.

## Contratos (assinaturas que outras frentes consomem)
Nenhum contrato downstream formal. Consome tipos de F4 quando disponíveis.

## Critérios de aceite
- [ ] `npm run build` verde
- [ ] `motorista/page.tsx` ≤ 300 linhas
- [ ] `app/page.tsx` ≤ 200 linhas
- [ ] Todos os modais e seções funcionam identicamente ao estado anterior
- [ ] Nenhum componente novo excede ~150 linhas

## Riscos & mitigações
| Risco | Mitigação |
|---|---|
| Estado compartilhado entre modais é complexo | Passar callbacks via props; extrair hooks se state crescer |
| Conflito de merge com F5 que modifica motorista/page.tsx | F7 entrega na Onda 1; F5 roda na Onda 3 sobre o arquivo já refatorado |

## Verificação
`npm run build` + verificação visual de cada modal/seção.
