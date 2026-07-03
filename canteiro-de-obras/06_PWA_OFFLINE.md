# Frente 6 — PWA & Offline · 🟡

> Depende de: F5 (GPS implementado) · Onda: 4 · Refs: `00_MASTER.md`, `playbooks.md#frontend`.

## Objetivo
Tornar o app do motorista instalável como PWA, implementar persistência offline do checklist via IndexedDB, e conectar o indicador de rede a eventos reais do navegador.

## Escopo
- **Arquivos:** `public/manifest.json` (NEW), `public/sw.js` ou config via `next-pwa` (NEW), `lib/hooks/useOfflineChecklist.ts` (NEW), `lib/hooks/useNetworkStatus.ts` (NEW), `app/dashboard/motorista/page.tsx` (MODIFY — integrar hooks).
- **Fora de escopo:** GPS Realtime (F5 já entregou). Refactor de componentes (F7). Schema de banco (F1).

## Pilar-motivo (1)
**Estabilidade** — motorista em zona rural perde checklist inteiro se app recarrega sem sinal.

## Diagnóstico (estado atual)
- Zero dependências PWA (`next-pwa`, `workbox`) no `package.json`.
- Sem `manifest.json` → app não instalável.
- Sem Service Worker → sem cache offline.
- Checklist em memória RAM (`useState`) → perda total no refresh.
- `isOnline` toggle via `onClick` (mockado) → não reflete estado real da rede.

## Passos
- [ ] 🟡 Criar `public/manifest.json` com ícones da prefeitura, `display: standalone`, `theme_color: #0F172A`, `start_url: /dashboard/motorista` — pronto quando: Chrome mostra prompt de instalação.
- [ ] 🟡 Configurar `next-pwa` (ou `@ducanh2912/next-pwa`) no `next.config.ts` para gerar Service Worker no build — pronto quando: DevTools → Application → Service Workers mostra worker ativo.
- [ ] 🟡 Criar hook `lib/hooks/useOfflineChecklist.ts`: salva array de presenças em IndexedDB via `idb-keyval` (ou API nativa); ao `handleSendBatch` com sucesso, limpa o store; ao montar, restaura do store — pronto quando: fechar e reabrir o navegador preserva o checklist não enviado.
- [ ] 🟡 Criar hook `lib/hooks/useNetworkStatus.ts`: escuta `window.addEventListener('online')` e `window.addEventListener('offline')` — pronto quando: `isOnline` reflete o estado real da rede.
- [ ] 🟢 Integrar ambos os hooks na página do motorista: substituir `useState` mockado por `useNetworkStatus()` e `useOfflineChecklist()` — pronto quando: badge de rede muda automaticamente + checklist persiste offline.

## Contratos (assinaturas que outras frentes consomem)
Nenhum contrato downstream. Consome `useGPSBroadcast` de F5.

## Critérios de aceite
- [ ] `npm run build` verde
- [ ] App instalável no Chrome mobile (prompt "Adicionar à tela inicial")
- [ ] Fechar app + reabrir sem internet → checklist preservado
- [ ] Desligar WiFi → badge muda para "OFFLINE" automaticamente
- [ ] Reconectar → `handleSendBatch` envia o lote pendente

## Riscos & mitigações
| Risco | Mitigação |
|---|---|
| `next-pwa` conflita com App Router | Usar `@ducanh2912/next-pwa` (fork mantido para App Router) |
| IndexedDB indisponível em navegador muito antigo | Fallback para `localStorage` (capacidade menor mas funcional) |

## Verificação
`npm run build` + teste manual de instalação PWA + teste de offline no DevTools.
