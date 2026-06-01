# 🏛️ Auditoria de Banco de Dados, Gaps de Infra e Checklist Geral

> **Data de Emissão:** 01/06/2026  
> **Status de Conectividade do Banco:** 🔌 Conectado ao Supabase (ID: `lzzxivzkwtwifgvexuiy`)  
> **Segurança RLS:** ⚠️ Alerta Crítico (Tabelas Expostas sem RLS)

---

## 📊 1. Relatório de Banco de Dados (Supabase Remoto)

Realizamos uma varredura direta via API de Gerenciamento do Supabase nas tabelas do banco de dados na nuvem para analisar o esquema real atualmente em produção. Abaixo está o relatório técnico:

### A. Tabelas Ativas em Produção

| Tabela | Finalidade Operacional | RLS Ativo? | Rows | Status / Observação |
| :--- | :--- | :---: | :---: | :--- |
| `public.perfis` | Perfil estendido dos usuários (SEMED, Motoristas, Pais) | ✅ SIM | 0 | Chave primária vinculada a `auth.users(id)`. |
| `public.alunos` | Estudantes cadastrados da rede municipal | ✅ SIM | 0 | Chave estrangeira para `perfis(responsavel_id)`. |
| `public.carteirinhas` | Credenciais oficiais e hashes de QR Code | ✅ SIM | 0 | Chave estrangeira para `alunos(id)`. |
| `public.logs_embarque` | Registro de viagens diárias escaneadas pelo motorista | ✅ SIM | 0 | Registra data, tipo (IDA/VOLTA) e turno. |
| `public.documentos_aluno` | Armazena URLs dos comprovantes enviados pela família | ✅ SIM | 0 | PDFs/Fotos vinculadas ao aluno. |
| `public.escolas` | Cadastro de instituições escolares de Arapongas | ✅ SIM | 3 | Contém seed inicial (seed rodado). |
| `public.veiculos` | Cadastro de vans e ônibus escolares da SEMED | ❌ NÃO | 0 | **ALERTA CRÍTICO:** Dados expostos publicamente! |
| `public.rotas` | Itinerários e linhas ativas de transporte | ❌ NÃO | 1 | **ALERTA CRÍTICO:** Dados expostos publicamente! |

---

## 🛑 2. Gap Analysis: Tabelas e Buckets Faltantes ou Desconectados

Identificamos componentes críticos de código e arquivos de front-end que realizam consultas à tabelas do Supabase que **não constam na estrutura física do banco na nuvem** ou que foram omitidos nos scripts de migração locais.

### A. Tabelas Desconectadas (Omitidas no Banco Remoto)

1. **`public.presencas_diarias`**
   *   *Onde é usada:* `app/responsavel/dashboard/page.tsx` (linhas 1295, 1323, 1348) e `app/responsavel/rastreio/[rota_id]/page.tsx` (linhas 103, 127).
   *   *Impacto:* A ação **"Meu filho não vai hoje"** e os comunicados de ausência diária enviados pelos pais falham silenciosamente no banco ou quebram no runtime do cliente por falta da tabela de destino.
   *   *Solução:* Criar a tabela física no Supabase com chave estrangeira para `alunos(id)`.

2. **`public.notificacoes`**
   *   *Onde é usada:* `app/dashboard/motorista/page.tsx` (linha 459) no momento de salvar e disparar mensagens de embarque.
   *   *Impacto:* A sincronização em lote de viagens no painel do motorista lança exceções silenciosas no console ao tentar empilhar e persistir as notificações no banco remoto.
   *   *Solução:* Criar a tabela `notificacoes` para auditoria histórica das mensagens.

3. **`public.motoristas_perfil`**
   *   *Onde é usada:* `app/dashboard/motorista/page.tsx` (linha 139) para obter a placa, modelo do veículo e van ativa do motorista logado.
   *   *Impacto:* A tela do motorista falha em carregar os dados reais do veículo do "Tio Silvio" ou de outros colaboradores, caindo em estados simulados.
   *   *Solução:* Criar a tabela física mapeando `id` para `auth.users(id)` e criar o relacionamento necessário.

4. **`public.localizacao_veiculo`**
   *   *Situação:* Embora declarada no script de migração `20260527200000`, a tabela **não foi provisionada com sucesso ou foi deletada** no banco remoto do Supabase.
   *   *Impacto:* O rastreamento de ônibus em tempo real pelo mapa no Portal dos Pais falha na busca de coordenadas.
   *   *Solução:* Executar novamente a DDL de criação e ativamento de RLS da tabela `localizacao_veiculo`.

### B. Buckets de Storage Faltantes
*   **`documentos-alunos`**: Usado em `app/responsavel/dashboard/page.tsx` para upload da Declaração de Matrícula, Comprovante de Residência e Foto 3x4.
*   *Impacto:* O upload de documentos no Portal dos Pais quebra com erro *Bucket not found*.
*   *Solução:* Criar um bucket público de Storage no painel do Supabase com o nome `documentos-alunos`.

---

## 🔒 3. Auditoria de Segurança: Alerta Crítico de RLS Desabilitado

O analisador do Supabase retornou um alerta de segurança de prioridade **CRÍTICA**:

> ⚠️ **Row Level Security (RLS) is disabled for:** `public.veiculos` and `public.rotas`.
> *Mecanismo:* Sem RLS, as duas tabelas estão totalmente expostas. Qualquer usuário ou robô de posse da chave pública anônima (`anon`) pode ler, injetar, alterar ou excluir todos os registros de rotas, veículos e placas da SEMED de Arapongas.

### SQL Proposta de Correção (Remediação de Segurança)

Para corrigir imediatamente esta vulnerabilidade sem interromper o funcionamento do aplicativo, propomos o seguinte script DDL:

```sql
-- 1. Ativa segurança de linha
alter table public.veiculos enable row level security;
alter table public.rotas enable row level security;

-- 2. Cria políticas de leitura para usuários autenticados (Pais e Motoristas)
create policy "Usuarios autenticados podem visualizar veiculos"
  on public.veiculos for select to authenticated using (true);

create policy "Usuarios autenticados podem visualizar rotas"
  on public.rotas for select to authenticated using (true);

-- 3. Cria políticas de escrita total apenas para Administradores da SEMED
create policy "Admins possuem controle total de veiculos"
  on public.veiculos for all to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and (tipo_usuario = 'admin' or tipo_usuario = 'Admin')
    )
  );

create policy "Admins possuem controle total de rotas"
  on public.rotas for all to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and (tipo_usuario = 'admin' or tipo_usuario = 'Admin')
    )
  );
```

---

## 💡 4. Sugestões de Usabilidade e Lógica Dinâmica

Para elevar a experiência visual e técnica do aplicativo ao nível premium, propomos as seguintes otimizações na lógica de dinâmica:

1. **Sincronização Offline no Painel do Motorista:**
   *   *Problema:* Na zona rural de Arapongas, a conexão 3G/4G oscila ativamente. Se o motorista tentar marcar embarques e o sinal cair, a viagem falhará.
   *   *Melhoria:* Implementar **IndexedDB** local (via biblioteca leve como `idb` ou `RxDB`) na tela do motorista. Os escaneamentos de QR Code e presenças diárias são guardados localmente com indicador visual de status de sinal ("Modo Offline - Sincronização Pendente"). Quando o sinal for restabelecido, o app faz o push em lote de forma transparente.

2. **Sanitização Inteligente de Rotas (UUID vs String):**
   *   *Problema:* No banco de dados, `rota_id` na tabela `logs_embarque` é do tipo `uuid references rotas(id)`, mas no front-end em diversos pontos a rota é pesquisada/filtrada por Strings amigáveis (ex: `'Rota 04'`). Isso causa colisões de busca.
   *   *Melhoria:* Criar um utilitário centralizado de sanitização e busca que mapeia automaticamente os UUIDs em seus rótulos textuais operacionais no momento do fetch, garantindo que buscas por string e chave estrangeira coexistam sem quebras de tipo.

3. **Parada Inteligente GPS e Economia de Bateria:**
   *   *Problema:* O pooling de 10s no Portal dos Pais consome tráfego e bateria do aparelho.
   *   *Melhoria:* Implementar gatilho de inatividade. Se o ônibus estiver parado (`velocidade_kmh = 0`) há mais de 3 minutos, diminuir a frequência de rastreio para 60s. Aumentar para 5s dinamicamente apenas quando a velocidade for superior a 10 km/h, demonstrando fluidez no mapa apenas quando o veículo estiver em trânsito.

---

## 📋 5. Checklist Geral do Ecossistema RotaEscola

### ✅ A. O que foi Implementado e está 100% Funcional

*   **Autenticação por CPF Segura (Server-side):**
    *   Substituição do login de e-mail tradicional por CPF higienizado (strip de formatação).
    *   API Route `/api/auth/login` que resolve CPF -> E-mail gerado de forma isolada, protegendo contra *Email Enumeration*.
    *   API Route `/api/auth/cadastro` usando o Supabase Admin Auth para criar contas de responsáveis de forma silenciosa, auto-confirmando o e-mail e contornando limites de requisição de provedores.
*   **Visual Premium & Correção de Hidratação:**
    *   Uso do guard `isMounted` com renderizações condicionais de esqueleto nos formulários de acesso de modo a expurgar avisos de mismatch de hidratação (React #418/425/423) no console do desenvolvedor.
*   **Painel do Motorista Mobile-First:**
    *   Escâner de QR Code integrado por câmera real do aparelho (`html5-qrcode`) com importação dinâmica adaptada a SSR.
    *   Feedbacks multissensoriais nativos: Beeps de áudio de alta e baixa frequência, vibração física do smartphone de 100ms e síntese de voz artificial (*Text-to-Speech*) ditando os nomes ou alertas.
    *   Checklist de passageiros em 3 estados dinâmicos (Pendente, Presente, Faltou) com transição de cor e etiquetas.
    *   Envio em lote unificado e auto-reset inteligente de 3 segundos para limpar a tela para a viagem seguinte.
*   **Portal dos Pais:**
    *   Integração dinâmica total do perfil. Mostra o Nome do usuário e o CPF formatado em máscara.
    *   Mecanismo de controle que oculta o fallbacks de mocks (`FILHOS_MOCK`) e o badge de demonstração para contas autenticadas reais.
    *   Sub-componente `<HistoricoEmbarque>` renderizando o histórico retroativo real dos filhos direto do banco com pílulas estéticas indicando data, tipo e turno.
*   **SEMED Admin:**
    *   Grade de auditoria operacional cruzando dados de alunos com `logs_embarque` em tempo real.
    *   KPIs principais dinâmicos.

---

### ⏳ B. O que Falta Implementar (Pendências Técnicas)

1. **Provisionamento DDL das Tabelas Ausentes:**
   *   Necessário rodar a migração para criar fisicamente as tabelas `presencas_diarias`, `notificacoes`, `motoristas_perfil` e `localizacao_veiculo` no Supabase remoto.
2. **Correção de Vulnerabilidade de RLS:**
   *   Ativar RLS e criar políticas de acesso para `public.veiculos` e `public.rotas`.
3. **Criação do Bucket de Armazenamento:**
   *   Criar o bucket `documentos-alunos` no Supabase Storage para evitar erros 404 de envio de PDF/Fotos.
4. **Push Notifications Reais via Firebase:**
   *   Ativar a integração real com as chaves de Firebase Cloud Messaging (FCM) no backend do Supabase para enviar mensagens push reais aos pais assim que o motorista escanear o QR Code de embarque na van.
5. **Painel da Secretaria Escolar (`/dashboard/secretaria`):**
   *   Ativar a visualização local para as secretarias municipais confirmarem as matrículas e liberarem as carteirinhas digitais.

---

### 🐛 C. Bugs Conhecidos e Soluções Propostas

| Bug Identificado | Causa Raiz | Solução Aplicada / Proposta |
| :--- | :--- | :--- |
| **`supabaseKey is required` no build** | Instanciação de cliente administrativo com variáveis do servidor fora do escopo funcional. | **Corrigido:** Refatorado para Lazy Loading funcional (só inicializa o cliente administrativo sob demanda real na API no runtime). |
| **Erros de Hidratação React #418** | Elementos dinâmicos baseados no navegador (cookies, máscaras) rodando no ciclo SSR do Next.js. | **Corrigido:** Injeção de mounted guard (`useState` + `useEffect` definindo `isMounted=true`) para atrasar render até o mount local. |
| **Spam de E-mail / Rate Limit 429** | O Supabase exige confirmação de e-mail por padrão no método `signUp` client-side, travando após poucas contas de testes. | **Corrigido:** Fluxo migrado para API segura que consome `service_role` e cria a conta via Admin Auth com confirmação direta e automática (`email_confirm: true`). |
| **Vazamento de RLS em Rotas/Veículos** | Políticas de RLS desativadas para desenvolvimento rápido. | **Pendente:** Executar a DDL de correção de segurança contendo políticas restritivas a usuários autenticados e controle total de Admin. |
