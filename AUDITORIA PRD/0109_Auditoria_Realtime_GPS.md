# 🛰️ Auditoria L-04: PULSE — Realtime, WebSocket e Telemetria GPS

Este relatório de auditoria avalia a conformidade dos mecanismos de geolocalização e transmissão em tempo real do sistema em comparação com os requisitos RF-04, NFR-01 e ADR-001 do Blueprint.

---

## 1. Polling de Banco vs. Supabase Realtime Broadcast (ADR-001)

- **Exigência do Blueprint (ADR-001):** Rastreamento ao vivo via protocolo WebSocket usando Supabase Realtime (canais Broadcast) para trafegar coordenadas geográficas na memória do servidor, evitando escrita excessiva em disco a cada ping de 5 segundos.
- **Implementação Real ([rastreio/[rota_id]/page.tsx:L107](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/app/responsavel/rastreio/%5Brota_id%5D/page.tsx#L107)):**
```typescript
// Atualiza localização a cada 30s se o veículo estiver em turno
const interval = setInterval(fetchLocalizacao, 30_000);
```
- **🚨 Diagnóstico:** **Inconformidade Crítica.** O sistema não utiliza WebSockets para a telemetria do veículo. Ele faz consultas repetidas via API REST (`SELECT` direto na tabela `localizacao_veiculo`) do lado do cliente a cada 30 segundos. Isso gera carga desnecessária de leitura no Postgres e impede atualizações fluidas de tela.

---

## 2. Emissão de Telemetria Ativa pelo Motorista

- **Exigência do Blueprint (RF-04):** O aplicativo do motorista emite pacotes de coordenadas geográficas (`latitude`, `longitude`, `speed`, `bearing`) em intervalos fixos de 5 segundos enquanto a rota estiver em execução.
- **Implementação Real ([motorista/page.tsx:L733-L739](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/app/dashboard/motorista/page.tsx#L733-L739)):**
  - Não existe lógica de rastreamento por GPS ativo (`navigator.geolocation.watchPosition` ou `navigator.geolocation.getCurrentPosition`) rodando no painel do motorista.
  - A única escrita de localização ocorre estaticamente no clique de sincronização de checklist em lote (`handleSendBatch`):
  ```typescript
  supabase.from('localizacao_veiculo').insert({
    rota_id: rotaAtiva.id,
    latitude: -23.4178,
    longitude: -51.4269, // Coordenadas fixas mockadas de Arapongas
    velocidade_kmh: 40,
    atualizado_em: new Date().toISOString()
  })
  ```
- **🚨 Diagnóstico:** **Não implementado.** O motorista não transmite coordenadas em tempo real. A van permanece estática em uma única coordenada geográfica mockada após o envio do lote de embarque.

---

## 3. Simulação de Movimento no Portal dos Pais (Fake Telemetry)

- **Implementação Real ([rastreio/[rota_id]/page.tsx:L113-L119](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/app/responsavel/rastreio/%5Brota_id%5D/page.tsx#L113-L119)):**
  - Para disfarçar a falta de transmissão de coordenadas do veículo, a interface do responsável simula o movimento do ônibus em um mapa SVG usando um timer estático de 15 segundos:
  ```typescript
  // Simula ônibus se aproximando no mapa SVG a cada 15s
  useEffect(() => {
    if (localizacao?.foraDeTurno || !isRouteActive) return;
    const interval = setInterval(() => {
      setTempoEstimado(prev => (prev > 1 ? prev - 1 : 12));
    }, 15_000);
    return () => clearInterval(interval);
  }, [localizacao?.foraDeTurno, isRouteActive]);
  ```
- **🚨 Diagnóstico:** O ônibus move-se de forma artificial na tela do pai, mesmo se a van real do motorista estiver parada ou desligada, ocultando a real situação logística da rota do menor.

---

## 4. Estrutura de Dados e Coluna `bearing`

- **Exigência do Blueprint (RF-04):** O payload do GPS deve conter latitude, longitude, speed (`velocidade_kmh`) e bearing.
- **Implementação Real (Tabela `localizacao_veiculo`):**
  - Contém apenas `latitude`, `longitude` e `velocidade_kmh`.
  - **A coluna `bearing` (direção/rumo do veículo em graus) está ausente** no banco e em qualquer tipagem, inviabilizando a rotação do ícone da van no mapa na direção correta da via.

---

## 5. Tempo de Resposta e Latência (NFR-01)

- **Exigência do Blueprint (NFR-01):** O delay de propagação da telemetria entre o motorista e o mapa do pai deve ser inferior a **1 segundo**.
- **Desempenho Real:**
  - Latência de polling fixada em 30 segundos. No melhor cenário, a atualização demora até 30s para refletir na tela da família, violando o requisito P95 e NFR-01 por uma margem extrema.

---

## 📋 Resumo de Achados (L-04)
- **Status Geral:** 🔴 **CRÍTICO / NÃO CONFORME**
- **Recomendações Corretivas:**
  1. Adicionar o hook `navigator.geolocation.watchPosition` no aplicativo do motorista (dentro do painel de rota ativa) para capturar o GPS real do smartphone.
  2. Implementar a transmissão de coordenadas via canal Realtime Broadcast do Supabase (sem persistência em disco).
  3. No Portal dos Pais, escutar o mesmo canal Realtime Broadcast para atualizar o marcador no mapa instantaneamente (< 1s), removendo a simulação estática de timer.
