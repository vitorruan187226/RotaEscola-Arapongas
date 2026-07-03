# 🗄️ Auditoria L-10: PIPELINE — Mensageria, Workers e Ciclo de Vida de Dados

Este relatório de auditoria avalia a infraestrutura de segundo plano, processadores assíncronos e conformidade do ecossistema de dados contra os ADR-001, ADR-002 e ADR-003 da arquitetura do Blueprint.

---

## 1. Message Broker e Consolidação Assíncrona (ADR-001)

- **Exigência do Blueprint:** Utilizar **RabbitMQ ou Kafka** para receber pings de telemetria rápidos de forma assíncrona, onde um worker consolida e salva as posições em lote no banco a cada 1 minuto, reduzindo em 90% a carga de escrita no PostgreSQL.
- **Implementação Real:** **Nenhuma.**
  - Não há dependências de clientes de fila ou mensageria (`amqplib`, `kafkajs`, `bullmq`, `@nestjs/microservices`) no `package.json`.
  - O aplicativo do motorista grava presenças e a coordenada de fechamento diretamente no banco do Supabase através de requisições síncronas de API REST.

---

## 2. Segregação de Banco de Dados (Read/Write Splitting — ADR-002)

- **Exigência do Blueprint:** Implementar replicação assíncrona de banco de dados, direcionando escritas e atualizações de motoristas ao nó **Primário (Master)** e relatórios analíticos/consultas pesadas da SEMED ao nó **Réplica (Read-Only)**.
- **Implementação Real:** **Não existe.**
  - A aplicação Next.js se conecta a uma única instância de banco do Supabase remoto através da mesma URL (`NEXT_PUBLIC_SUPABASE_URL`) configurada no `utils/supabase/client.ts` e `utils/supabase/server.ts`.
  - Não há lógica de multiplexação de conexões (Read/Write replica routing) a nível de código ou ORM no frontend/backend.

---

## 3. Controle de Deploy e Feature Flags (ADR-003)

- **Exigência do Blueprint:** Inclusão de **Feature Flags** em tempo real no código Next.js para liberar funcionalidades como otimização automática de rotas por IA a uma porcentagem canário (5%) de motoristas, permitindo desligamento rápido em caso de falha.
- **Implementação Real:** **Não implementado.**
  - Não há integrações com provedores de Feature Flags (`flagsmith`, `launchdarkly`, `growthbook`) e nem variáveis de ambiente do tipo `NEXT_PUBLIC_FEATURE_*` implementadas. A build do frontend é monolítica e idêntica para todos os usuários.

---

## 4. Background Processors e Geração de Ativos

- **QR Codes:** O Blueprint sugere geração assíncrona de QR Codes via Background Processors. O projeto Next.js real realiza a geração do SVG do QR Code **inteiramente no lado do cliente** usando a biblioteca `@qrcode.react`. Isso reduz os custos de computação no servidor, mas centraliza o processamento de imagem na máquina do usuário.
- **Geocoding Fallback:** Não há processadores em lote ou filas de contingência (`geocoding-retry-queue`) para validar endereços residenciais de alunos em caso de falha de APIs de geolocalização.

---

## 5. Limpeza de Dados e pg_cron (Data Lifecycle)

- **Exigência do Blueprint (Seção 3.4):** Workers automatizados convertendo dados Hot (> 90 dias) para formato colunar Parquet em S3/Glacier e limpando a tabela do Postgres.
- **Implementação Real:** **Não existe.**
  - Nenhuma migration configura a extensão `pg_cron` no Supabase ou declara rotinas periódicas de expurgo de dados. A tabela `localizacao_veiculo` e `logs_embarque` acumulam dados indefinidamente.

---

## 6. Análise da Edge Function `enviar-push-embarque`

- **Implementação ([supabase/functions/enviar-push-embarque/index.ts](file:///c:/Users/NOSSA WEBTV/Documents/GitHub/RotaEscola-Arapongas/supabase/functions/enviar-push-embarque/index.ts)):**
  - **Status:** **🟢 CONFORME.** A Edge Function está bem estruturada e implementa um fluxo assíncrono via Database Webhooks (escutando INSERTs na tabela `logs_embarque`).
  - Ela lê do banco usando o cliente Supabase administrativo, monta a notificação correta e despacha via chamada HTTP à API do Firebase (FCM).
  - Possui um excelente fallback de simulação caso a chave `FCM_SERVER_KEY` não esteja presente, gravando os dados no console de logs do Deno, o que a torna segura e ideal para desenvolvimento local.

---

## 📋 Resumo de Achados (L-10)
- **Status Geral:** ⚠️ **CONFORME COM RESSALVAS** (Apenas a Edge Function de push está ativa, enquanto mensageria, réplicas e cron de arquivamento estão ausentes).
- **Recomendações:**
  - Instalar e configurar a extensão `pg_cron` no Supabase para automatizar o expurgo periódico de dados antigos de logs e localização.
  - Implementar suporte simplificado a Feature Flags usando variáveis de ambiente ou ferramentas open-source para mitigar riscos de deploy.
