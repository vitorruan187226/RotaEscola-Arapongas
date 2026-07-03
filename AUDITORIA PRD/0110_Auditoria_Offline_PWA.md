# 📦 Auditoria L-05: BUNKER — Resiliência Offline e Capacidade PWA

Este relatório de auditoria avalia a prontidão do aplicativo do motorista (versão Web) para atuar de forma offline na zona rural de Arapongas, conforme exigido pelo requisito Q-03, NFR-03 e pelas diretrizes de PWA.

---

## 1. Dependências de PWA e Service Workers

- **Exigência do Blueprint (NFR-03):** O app do motorista deve funcionar como um PWA (Progressive Web App) de baixíssimo consumo de dados.
- **Análise do Repositório (`package.json`):**
  - **Zero dependências de Service Workers ou PWA.** Não há bibliotecas como `@ducanh2912/next-pwa`, `next-pwa`, `workbox-window` ou similares no arquivo de dependências.
  - Não há arquivo de Service Worker (`sw.js` ou `service-worker.js`) ou registro de script correspondente no ciclo de boot do Next.js (`app/layout.tsx` ou formulários).
  - **Ausência de Manifesto:** Não existe arquivo `manifest.json` ou `manifest.webmanifest` no projeto. O app não pode ser instalado como aplicativo nativo na home do smartphone do motorista.

---

## 2. Banco Local de Dados (IndexedDB / LocalStorage)

- **Exigência (Q-03 Fallback Offline):** Persistir batidas de presença por QR Code em armazenamento local (IndexedDB) com sincronização em lote transacional e resolução de conflitos cronológicos em zonas rurais.
- **Implementação Real ([motorista/page.tsx:L692](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/app/dashboard/motorista/page.tsx#L692)):**
  - O estado do checklist é mantido **exclusivamente na memória RAM (React state)** (`setRotas`).
  - Caso o motorista feche o navegador por engano, ou o smartphone reinicie devido ao calor no painel do veículo, **toda a lista de presença do dia não enviada é perdida permanentemente**, exigindo que o motorista faça o re-escaneamento de todas as crianças no embarque.
  - Não há uso de IndexedDB ou sequer LocalStorage para backup emergencial do estado local.

---

## 3. Detecção de Status de Rede (onLine Mocked)

- **Implementação Real ([motorista/page.tsx:L1327](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/app/dashboard/motorista/page.tsx#L1327)):**
  - O painel exibe um badge visual de conectividade no topo superior.
  - No entanto, a lógica é puramente visual (mockada) para demonstração de design. O status `isOnline` não escuta os eventos do navegador (`window.addEventListener('online')`), sendo alterado apenas no clique do mouse/toque no próprio badge:
  ```typescript
  onClick={() => setIsOnline(!isOnline)}
  ```
  - Se a internet real cair, o badge continuará exibindo "ONLINE" em verde. O motorista só descobrirá a queda de sinal ao tentar submeter o lote de presença e receber uma mensagem de erro genérica.

---

## 4. Resolução de Conflitos e Timestamping Cronológico

- **Exigência (Q-03):** Sincronização em lote transacional e resolução de conflitos baseada em ordem cronológica de batidas.
- **Implementação Real:**
  - O envio de dados em lote no clique (`handleSendBatch`) cria um objeto `logs_embarque` usando a data atualizada do servidor (`todayDate`) no momento em que a API processa o post.
  - Sem persistência offline de timestamps individuais no momento do scan real, se o lote for transmitido com 3 horas de atraso (quando o veículo retornar à área com sinal), o banco registrará o horário da inserção tardia, distorcendo o relatório de controle de horários de Arapongas.

---

## 📋 Resumo de Achados (L-05)
- **Status Geral:** 🔴 **CRÍTICO / NÃO CONFORME**
- **Recomendações Corretivas:**
  1. Adicionar suporte a PWA instalável no Next.js (criando o arquivo `manifest.json` com ícones da prefeitura e configurando plugin de Service Worker no build).
  2. Implementar persistência local automática do checklist do motorista no `localStorage` ou `IndexedDB` a cada alteração de status.
  3. Vincular o estado `isOnline` aos eventos nativos do navegador (`window.ononline` e `window.onoffline`) para desativar o botão de sincronização caso o sinal do celular caia na estrada rural de Arapongas.
