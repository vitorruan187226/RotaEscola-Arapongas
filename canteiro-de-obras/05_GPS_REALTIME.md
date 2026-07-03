# Frente 5 — GPS Realtime · 🟡

> Depende de: F4 (tipos corretos) · Onda: 3 · Refs: `00_MASTER.md`, `CONTRATOS.md §4`, `playbooks.md#frontend`.

## Objetivo
Substituir o GPS mockado e o polling de 30s por transmissão real de coordenadas via `navigator.geolocation.watchPosition` no motorista e escuta via Supabase Realtime Broadcast no portal dos pais.

## Escopo
- **Arquivos:** `lib/hooks/useGPSBroadcast.ts` (NEW), `lib/hooks/useGPSListener.ts` (NEW), `app/dashboard/motorista/page.tsx` (MODIFY — integrar hook), `app/responsavel/rastreio/[rota_id]/page.tsx` (MODIFY — substituir polling).
- **Fora de escopo:** PWA/Service Worker (F6). Refactor da página monolítica do motorista (F7). Schema de banco (F1).

## Pilar-motivo (1)
**Performance** — delay atual de 30s viola NFR-01 (< 1s); coordenadas mockadas enganam os pais.

## Diagnóstico (estado atual)
- Motorista: coordenadas fixas (`-23.4178, -51.4269`) inseridas apenas no `handleSendBatch` (sem GPS ativo).
- Pais: polling REST a cada 30s + timer fake de 15s simulando aproximação.
- Coluna `bearing` inexistente na tabela `localizacao_veiculo`.

## Passos
- [ ] 🟡 Criar hook `lib/hooks/useGPSBroadcast.ts`: usa `navigator.geolocation.watchPosition` (high accuracy, max age 5s) e emite via `supabase.channel('gps:<rotaId>').send({ type: 'broadcast', event: 'position_update', payload: { lat, lng, speed, bearing } })` — pronto quando: console do Supabase mostra mensagens no canal.
- [ ] 🟡 Criar hook `lib/hooks/useGPSListener.ts`: escuta `supabase.channel('gps:<rotaId>').on('broadcast', { event: 'position_update' }, callback)` e retorna a posição mais recente — pronto quando: componente de mapa recebe posição sem polling.
- [ ] 🟡 Integrar `useGPSBroadcast` na página do motorista: chamar `startTracking()` quando rota é ativada, `stopTracking()` quando encerrada — pronto quando: motorista com rota ativa emite GPS real.
- [ ] 🟡 Substituir polling de 30s no `rastreio/[rota_id]/page.tsx` por `useGPSListener`: remover `setInterval(fetchLocalizacao, 30_000)` e o timer fake de 15s — pronto quando: marcador no mapa move em tempo real (< 5s de delay).
- [ ] 🟢 Persistir o último ping de GPS na tabela `localizacao_veiculo` a cada 60s (não a cada 5s) para manter histórico sem sobrecarregar o banco — pronto quando: tabela atualiza 1×/min durante rota ativa.

## Contratos (assinaturas que outras frentes consomem)
→ `CONTRATOS.md §4` (`useGPSBroadcast`, `useGPSListener`, canal `gps:<rotaId>`).

## Critérios de aceite
- [ ] `npm run build` verde
- [ ] Motorista com rota ativa e GPS do celular ligado → coordenadas aparecem no Realtime Inspector do Supabase
- [ ] Portal dos pais mostra marcador movendo com < 5s de delay
- [ ] Sem timer fake de 15s no código do rastreio

## Riscos & mitigações
| Risco | Mitigação |
|---|---|
| Motorista nega permissão de GPS no navegador | Exibir modal de instrução + fallback para última posição conhecida |
| Consumo de bateria alto com watchPosition | Configurar `maximumAge: 5000` e `timeout: 10000` para reduzir polling do sensor |

## Verificação
`npm run build` + teste manual com geolocalização real (ou Chrome DevTools Sensors).
